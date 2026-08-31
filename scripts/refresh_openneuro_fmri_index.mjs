import fs from "node:fs/promises";

const endpoint = "https://openneuro.org/crn/graphql";
const outputUrl = new URL("../data/openneuro-fmri-index.json", import.meta.url);
const verifiedAt = "2026-08-30";
const pageSize = 50;

const query = `
  query PublicMriDatasets($first: Int!, $after: String) {
    datasets(first: $first, after: $after, modality: "MRI", filterBy: { public: true }) {
      edges {
        cursor
        node {
          id
          name
          publishDate
          metadata {
            ages
            associatedPaperDOI
            dxStatus
            modalities
            species
            studyDesign
            studyDomain
            studyLongitudinal
            tasksCompleted
          }
          latestSnapshot {
            tag
            size
            created
            description {
              BIDSVersion
              DatasetDOI
              DatasetType
              License
              Name
              ReferencesAndLinks
            }
            summary {
              modalities
              sessions
              subjects
              tasks
            }
          }
        }
      }
      pageInfo {
        count
        endCursor
        hasNextPage
      }
    }
  }
`;

async function graphql(variables) {
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "content-type": "application/json",
          "user-agent": "Big-Data-fMRI-OpenNeuro-indexer/2.0",
        },
        body: JSON.stringify({ query, variables }),
      });
      const contentType = response.headers.get("content-type") ?? "";
      if (!response.ok || !contentType.includes("application/json")) {
        throw new Error(`OpenNeuro returned HTTP ${response.status} (${contentType || "unknown content type"})`);
      }
      const payload = await response.json();
      if (payload.errors?.length && !payload.data) throw new Error(JSON.stringify(payload.errors));
      if (payload.errors?.length) {
        const paths = payload.errors.map((item) => item.path?.join(".") ?? item.message).join(", ");
        console.warn(`OpenNeuro returned partial data; skipped unavailable fields at: ${paths}`);
      }
      return payload;
    } catch (error) {
      lastError = error;
      if (attempt < 4) await new Promise((resolve) => setTimeout(resolve, attempt * 1_500));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError;
}

const normalizeSpecies = (value) => (value ?? "").trim().toLowerCase();
const nonHumanOrNonBrainPattern = /(^|[^a-z])(mouse|mice|murine|rat|rodent|macaque|monkey|baboon|primate|pig|swine|dog|canine|cat|feline|ferret|sheep|zebrafish|drosophila|phantom|spinal(?:[ _-]?cord)?)([^a-z]|$)/i;
const isHuman = (species) => {
  const value = normalizeSpecies(species);
  if (!value) return true;
  if (/mouse|mice|rat|macaque|monkey|baboon|pig|dog|cat|non[- ]?human/.test(value)) return false;
  return /human|homo sapiens/.test(value);
};
const looksLikeHumanBrainFmri = (node) => {
  const snapshot = node.latestSnapshot;
  const searchable = [
    node.name,
    snapshot?.description?.Name,
    ...(snapshot?.description?.ReferencesAndLinks ?? []),
    ...(snapshot?.summary?.tasks ?? []),
  ].filter(Boolean).join(" ");
  return !nonHumanOrNonBrainPattern.test(searchable);
};
const obviousPlaceholderPattern = /^(?:test|demo|unnamed dataset|bids_dataset|bids pilot project)$/i;
const nonCohortExamplePattern = /^(?:example mr artifacts|example fieldmaps|test dataset for xcp software|multi-echo masking test dataset|connectomix test dataset \d+)$/i;
const hasUsableDatasetIdentity = (node) => {
  const name = (node.latestSnapshot?.description?.Name || node.name || "").trim();
  return name.length >= 4 && !obviousPlaceholderPattern.test(name) && !nonCohortExamplePattern.test(name);
};

const compact = (items) => [...new Set((items ?? []).map((item) => String(item).trim()).filter(Boolean))];
const numericAges = (items) => (items ?? []).map(Number).filter(Number.isFinite);
const yearFrom = (value) => {
  const year = Number(String(value ?? "").slice(0, 4));
  return Number.isInteger(year) && year > 1900 ? year : null;
};

const nodes = [];
let after = null;
let page = 0;
let apiVersion = "unknown";

do {
  const payload = await graphql({ first: pageSize, after });
  apiVersion = payload.extensions?.openneuro?.version ?? apiVersion;
  const connection = payload.data.datasets;
  nodes.push(...connection.edges.filter(Boolean).map((edge) => edge.node).filter(Boolean));
  after = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null;
  page += 1;
  console.log(`OpenNeuro MRI page ${page}: ${nodes.length}/${connection.pageInfo.count ?? "?"}`);
} while (after);

const datasets = nodes
  .filter((node) => /^ds\d+$/.test(node.id))
  .filter((node) => node.latestSnapshot?.summary)
  .filter((node) => compact(node.latestSnapshot?.summary?.tasks).length > 0)
  .filter((node) => isHuman(node.metadata?.species))
  .filter(looksLikeHumanBrainFmri)
  .filter(hasUsableDatasetIdentity)
  .filter((node) => node.latestSnapshot?.description?.DatasetType?.toLowerCase() !== "derivative")
  .map((node) => {
    const snapshot = node.latestSnapshot;
    const subjects = compact(snapshot.summary?.subjects);
    const tasks = compact([...(snapshot.summary?.tasks ?? []), ...(node.metadata?.tasksCompleted ?? [])]);
    const ages = numericAges(node.metadata?.ages);
    return {
      accession: node.id,
      name: snapshot.description?.Name?.trim() || node.name?.trim() || node.id,
      snapshotTag: snapshot.tag,
      snapshotCreated: snapshot.created,
      releaseYear: yearFrom(node.publishDate) ?? yearFrom(snapshot.created),
      subjects: subjects.length,
      sessions: compact(snapshot.summary?.sessions),
      tasks,
      modalities: compact([...(snapshot.summary?.modalities ?? []), ...(node.metadata?.modalities ?? [])]),
      sizeGb: Math.round((Number(snapshot.size) / 1_000_000_000) * 10) / 10,
      bidsVersion: snapshot.description?.BIDSVersion ?? null,
      datasetDoi: snapshot.description?.DatasetDOI ?? null,
      paperDoi: node.metadata?.associatedPaperDOI ?? null,
      references: compact(snapshot.description?.ReferencesAndLinks),
      license: snapshot.description?.License?.trim() || "Dataset-specific OpenNeuro license",
      ageMin: ages.length ? Math.min(...ages) : null,
      ageMax: ages.length ? Math.max(...ages) : null,
      diagnosis: node.metadata?.dxStatus?.trim() || null,
      studyDesign: node.metadata?.studyDesign?.trim() || null,
      studyDomain: node.metadata?.studyDomain?.trim() || null,
      longitudinal: node.metadata?.studyLongitudinal?.trim() || null,
    };
  })
  .filter((dataset) => dataset.subjects > 0 && dataset.tasks.length > 0)
  .sort((a, b) => b.subjects - a.subjects || a.accession.localeCompare(b.accession));

const output = {
  generatedAt: verifiedAt,
  source: endpoint,
  apiVersion,
  method: "All public OpenNeuro MRI datasets with at least one BIDS subject and one BOLD task; derivatives, non-human/non-brain records, and obvious test/demo placeholders excluded.",
  datasetCount: datasets.length,
  datasets,
};

await fs.writeFile(outputUrl, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Wrote ${datasets.length} public human fMRI candidates to ${outputUrl.pathname}`);
