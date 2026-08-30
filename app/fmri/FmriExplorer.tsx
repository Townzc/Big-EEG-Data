"use client";

import { useEffect, useMemo, useState } from "react";
import { fmriDatasets } from "../../data/fmri-catalog";
import type { FmriDataset, Metric } from "../../data/fmri-schema";

type SortKey = "subjects" | "hours" | "hoursPerSubject" | "size" | "year" | "name";

const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

function metricText(metricValue: Metric, compact = false) {
  if (metricValue.value === null) return "N/A";
  const formatted = compact && Math.abs(metricValue.value) >= 1000
    ? new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(metricValue.value)
    : decimal.format(metricValue.value);
  const suffix = metricValue.unit.startsWith("hours") ? " h"
    : metricValue.unit === "GB" ? " GB"
    : metricValue.unit.startsWith("minutes") ? " min"
    : metricValue.unit === "ms" ? " ms"
    : metricValue.unit === "degrees" ? "°"
    : metricValue.unit === "factor" ? "×"
    : "";
  return `${formatted}${suffix}`;
}

function evidenceLabel(kind: Metric["durationSource"]) {
  return ({ reported: "reported", calculated: "calculated", estimated: "estimated", unavailable: "unavailable" })[kind];
}

function yesNo(value: boolean | null) {
  return value === null ? "Unknown" : value ? "Yes" : "No";
}

function sumKnown(pick: (dataset: FmriDataset) => Metric) {
  const values = fmriDatasets.map(pick).filter((item) => item.value !== null);
  return {
    value: values.reduce((sum, item) => sum + (item.value ?? 0), 0),
    known: values.length,
  };
}

function MetricEvidence({ label, value }: { label: string; value: Metric }) {
  return (
    <div className="detail-metric">
      <dt>{label}</dt>
      <dd>{metricText(value)}</dd>
      <span className={`evidence evidence-${value.durationSource}`}>{evidenceLabel(value.durationSource)}</span>
      {value.note && <p>{value.note}</p>}
      {value.sourceUrl && <a href={value.sourceUrl} target="_blank" rel="noreferrer">metric source ↗</a>}
    </div>
  );
}

function DatasetDetail({ dataset, onClose }: { dataset: FmriDataset; onClose: () => void }) {
  const modalities = Object.entries(dataset.additionalModalities)
    .filter(([, available]) => available === true)
    .map(([name]) => ({
      t1w: "T1w", t2w: "T2w", dwiDmri: "DWI / dMRI", eeg: "EEG", meg: "MEG", pet: "PET",
      behavioralData: "Behavioral", cognitiveAssessments: "Cognitive assessments", genetics: "Genetics",
      clinicalVariables: "Clinical variables", physiologicalRecordings: "Physiology", eyeTracking: "Eye tracking",
    }[name] ?? name));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("modal-open");
    };
  }, [onClose]);

  return (
    <div className="detail-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dataset-detail" role="dialog" aria-modal="true" aria-labelledby="dataset-detail-title">
        <div className="detail-topbar">
          <div>
            <p className="eyebrow">{dataset.identification.abbreviation} · {dataset.id}</p>
            <h2 id="dataset-detail-title">{dataset.identification.datasetName}</h2>
          </div>
          <button className="detail-close" type="button" onClick={onClose} aria-label="关闭数据集详情">×</button>
        </div>

        <div className="detail-summary-grid">
          <MetricEvidence label="Subjects" value={dataset.scale.subjects} />
          <MetricEvidence label="Total fMRI hours" value={dataset.scale.totalFmriHours} />
          <MetricEvidence label="Hours / subject" value={dataset.scale.averageFmriHoursPerSubject} />
          <MetricEvidence label="Dataset size" value={dataset.scale.datasetSizeGb} />
        </div>

        <div className="detail-grid">
          <article className="detail-card">
            <h3>Dataset overview</h3>
            <dl className="detail-list">
              <div><dt>Institution / consortium</dt><dd>{dataset.identification.institutionConsortium}</dd></div>
              <div><dt>Country / region</dt><dd>{dataset.identification.countryRegion}</dd></div>
              <div><dt>Repository</dt><dd>{dataset.identification.repository}</dd></div>
              <div><dt>Release</dt><dd>{dataset.release.releaseVersion}{dataset.release.releaseYear ? ` · ${dataset.release.releaseYear}` : ""}</dd></div>
              <div><dt>Last verified</dt><dd>{dataset.release.lastVerified}</dd></div>
            </dl>
          </article>

          <article className="detail-card">
            <h3>Subject population</h3>
            <dl className="detail-list">
              <div><dt>Population</dt><dd>{dataset.participants.populationDescription}</dd></div>
              <div><dt>Age range</dt><dd>{dataset.participants.ageRange}</dd></div>
              <div><dt>Mean age</dt><dd>{dataset.participants.meanAge}</dd></div>
              <div><dt>Sex / gender</dt><dd>{dataset.participants.sexGender}</dd></div>
              <div><dt>Group</dt><dd>{dataset.participants.healthyClinicalMixed}</dd></div>
              <div><dt>Disease / condition</dt><dd>{dataset.participants.diseaseCondition}</dd></div>
            </dl>
          </article>

          <article className="detail-card detail-card-wide">
            <h3>fMRI composition & duration</h3>
            <div className="detail-duration-grid">
              <MetricEvidence label="Sessions" value={dataset.scale.sessions} />
              <MetricEvidence label="fMRI runs" value={dataset.scale.fmriRuns} />
              <MetricEvidence label="Rest duration / run" value={dataset.fmriComposition.restingState.durationMinutesPerRun} />
              <MetricEvidence label="Rest total" value={dataset.fmriComposition.restingState.totalHours} />
              <MetricEvidence label="Task duration / subject" value={dataset.fmriComposition.task.durationMinutesPerSubject} />
              <MetricEvidence label="Task total" value={dataset.fmriComposition.task.totalHours} />
              <MetricEvidence label="Naturalistic duration / subject" value={dataset.fmriComposition.naturalisticMovie.durationMinutesPerSubject} />
              <MetricEvidence label="Naturalistic total" value={dataset.fmriComposition.naturalisticMovie.totalHours} />
            </div>
            <dl className="detail-list compact-list">
              <div><dt>Resting-state</dt><dd>{yesNo(dataset.fmriComposition.restingState.available)}</dd></div>
              <div><dt>Task fMRI</dt><dd>{yesNo(dataset.fmriComposition.task.available)}</dd></div>
              <div><dt>Tasks</dt><dd>{dataset.fmriComposition.task.names.join(" · ") || "None documented"}</dd></div>
              <div><dt>Naturalistic / movie</dt><dd>{yesNo(dataset.fmriComposition.naturalisticMovie.available)}{dataset.fmriComposition.naturalisticMovie.names.length ? ` · ${dataset.fmriComposition.naturalisticMovie.names.join(" · ")}` : ""}</dd></div>
              <div><dt>Longitudinal</dt><dd>{yesNo(dataset.fmriComposition.longitudinal)}</dd></div>
            </dl>
          </article>

          <article className="detail-card">
            <h3>Acquisition</h3>
            <dl className="detail-list">
              <div><dt>Scanner</dt><dd>{[...dataset.acquisition.scannerManufacturers, ...dataset.acquisition.scannerModels].join(" · ") || "Unknown"}</dd></div>
              <div><dt>Field strength</dt><dd>{dataset.acquisition.fieldStrengths.join(" · ") || "Unknown"}</dd></div>
              <div><dt>Sites</dt><dd>{metricText(dataset.acquisition.numberOfSites)} · {dataset.acquisition.multiSite === null ? "site design unknown" : dataset.acquisition.multiSite ? "multi-site" : "single-site"}</dd></div>
              <div><dt>TR / TE</dt><dd>{metricText(dataset.acquisition.trMs)} / {metricText(dataset.acquisition.teMs)}</dd></div>
              <div><dt>Flip angle</dt><dd>{metricText(dataset.acquisition.flipAngleDegrees)}</dd></div>
              <div><dt>Voxel size</dt><dd>{dataset.acquisition.voxelSize}</dd></div>
              <div><dt>Volumes</dt><dd>{metricText(dataset.acquisition.numberOfVolumes)}</dd></div>
              <div><dt>Multiband</dt><dd>{metricText(dataset.acquisition.multibandFactor)}</dd></div>
            </dl>
          </article>

          <article className="detail-card">
            <h3>Formats & other modalities</h3>
            <dl className="detail-list">
              <div><dt>BIDS</dt><dd>{yesNo(dataset.dataFormat.bidsCompliant)}</dd></div>
              <div><dt>NIfTI</dt><dd>{yesNo(dataset.dataFormat.nifti)}</dd></div>
              <div><dt>Raw / preprocessed</dt><dd>{yesNo(dataset.dataFormat.rawDataAvailable)} / {yesNo(dataset.dataFormat.preprocessedDataAvailable)}</dd></div>
              <div><dt>Main pipeline</dt><dd>{dataset.dataFormat.mainPreprocessingPipeline}</dd></div>
              <div><dt>Additional modalities</dt><dd>{modalities.join(" · ") || "Unknown"}</dd></div>
            </dl>
          </article>

          <article className="detail-card detail-card-wide access-detail">
            <h3>Access & official links</h3>
            <dl className="detail-list compact-list">
              <div><dt>Access type</dt><dd><span className={`access-pill access-${dataset.access.accessType.toLowerCase().replaceAll(/[^a-z]+/g, "-")}`}>{dataset.access.accessType}</span></dd></div>
              <div><dt>Registration / application / DUA</dt><dd>{yesNo(dataset.access.registrationRequired)} / {yesNo(dataset.access.applicationRequired)} / {yesNo(dataset.access.dataUseAgreement)}</dd></div>
              <div><dt>Cost / fee</dt><dd>{dataset.access.costFee}</dd></div>
              <div><dt>License</dt><dd>{dataset.access.license}</dd></div>
              <div><dt>Commercial use</dt><dd>{dataset.access.commercialUseRestrictions}</dd></div>
            </dl>
            <div className="official-links">
              <a href={dataset.identification.officialWebsite} target="_blank" rel="noreferrer">Official website ↗</a>
              {dataset.identification.datasetUrls.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer">Access location {index + 1} ↗</a>)}
              {dataset.identification.doi && <a href={`https://doi.org/${dataset.identification.doi}`} target="_blank" rel="noreferrer">Primary paper DOI ↗</a>}
            </div>
          </article>

          <article className="detail-card detail-card-wide">
            <h3>Notes, limitations & provenance</h3>
            {dataset.metadata.keyCharacteristics.length > 0 && <><h4>Key characteristics</h4><ul>{dataset.metadata.keyCharacteristics.map((item) => <li key={item}>{item}</li>)}</ul></>}
            {dataset.metadata.knownLimitations.length > 0 && <><h4>Known limitations</h4><ul>{dataset.metadata.knownLimitations.map((item) => <li key={item}>{item}</li>)}</ul></>}
            {dataset.metadata.notes.length > 0 && <><h4>Notes</h4><ul>{dataset.metadata.notes.map((item) => <li key={item}>{item}</li>)}</ul></>}
            <h4>Sources</h4>
            <ul className="source-list">{dataset.sources.map((item) => <li key={`${item.label}-${item.url}`}><a href={item.url} target="_blank" rel="noreferrer">{item.label} ↗</a><span>{item.scope}</span></li>)}</ul>
          </article>
        </div>
      </section>
    </div>
  );
}

export function FmriExplorer() {
  const [query, setQuery] = useState("");
  const [minSubjects, setMinSubjects] = useState("");
  const [minHours, setMinHours] = useState("");
  const [minHoursPerSubject, setMinHoursPerSubject] = useState("");
  const [minSize, setMinSize] = useState("");
  const [paradigm, setParadigm] = useState("all");
  const [group, setGroup] = useState("all");
  const [disease, setDisease] = useState("all");
  const [age, setAge] = useState("");
  const [field, setField] = useState("all");
  const [siteDesign, setSiteDesign] = useState("all");
  const [bids, setBids] = useState("all");
  const [access, setAccess] = useState("all");
  const [longitudinal, setLongitudinal] = useState("all");
  const [sort, setSort] = useState<SortKey>("subjects");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<FmriDataset | null>(null);
  const updateFilter = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    setPage(1);
  };

  const subjectAggregate = useMemo(() => sumKnown((dataset) => dataset.scale.subjects), []);
  const hourAggregate = useMemo(() => sumKnown((dataset) => dataset.scale.totalFmriHours), []);
  const sizeAggregate = useMemo(() => sumKnown((dataset) => dataset.scale.datasetSizeGb), []);
  const openCount = fmriDatasets.filter((dataset) => dataset.access.accessType === "Open download").length;
  const diseases = useMemo(() => Array.from(new Set(fmriDatasets.map((dataset) => dataset.participants.diseaseCondition).filter((item) => item !== "None specified"))).sort(), []);
  const fields = useMemo(() => Array.from(new Set(fmriDatasets.flatMap((dataset) => dataset.acquisition.fieldStrengths))).sort(), []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const ageQuery = age.trim().toLowerCase();
    const minSubjectValue = minSubjects === "" ? null : Number(minSubjects);
    const minHourValue = minHours === "" ? null : Number(minHours);
    const minHourPerSubjectValue = minHoursPerSubject === "" ? null : Number(minHoursPerSubject);
    const minSizeValue = minSize === "" ? null : Number(minSize);

    const result = fmriDatasets.filter((dataset) => {
      const haystack = [
        dataset.identification.datasetName,
        dataset.identification.abbreviation,
        dataset.id,
        dataset.identification.institutionConsortium,
        dataset.identification.repository,
        dataset.participants.populationDescription,
        dataset.participants.diseaseCondition,
        dataset.fmriComposition.task.names.join(" "),
        dataset.fmriComposition.naturalisticMovie.names.join(" "),
      ].join(" ").toLowerCase();
      if (normalizedQuery && !haystack.includes(normalizedQuery)) return false;
      if (minSubjectValue !== null && (dataset.scale.subjects.value === null || dataset.scale.subjects.value < minSubjectValue)) return false;
      if (minHourValue !== null && (dataset.scale.totalFmriHours.value === null || dataset.scale.totalFmriHours.value < minHourValue)) return false;
      if (minHourPerSubjectValue !== null && (dataset.scale.averageFmriHoursPerSubject.value === null || dataset.scale.averageFmriHoursPerSubject.value < minHourPerSubjectValue)) return false;
      if (minSizeValue !== null && (dataset.scale.datasetSizeGb.value === null || dataset.scale.datasetSizeGb.value < minSizeValue)) return false;
      if (paradigm === "rest" && dataset.fmriComposition.restingState.available !== true) return false;
      if (paradigm === "task" && dataset.fmriComposition.task.available !== true) return false;
      if (paradigm === "naturalistic" && dataset.fmriComposition.naturalisticMovie.available !== true) return false;
      if (group !== "all" && dataset.participants.healthyClinicalMixed !== group) return false;
      if (disease !== "all" && dataset.participants.diseaseCondition !== disease) return false;
      if (ageQuery && !dataset.participants.ageRange.toLowerCase().includes(ageQuery)) return false;
      if (field !== "all" && !dataset.acquisition.fieldStrengths.includes(field)) return false;
      if (siteDesign === "single" && dataset.acquisition.multiSite !== false) return false;
      if (siteDesign === "multi" && dataset.acquisition.multiSite !== true) return false;
      if (bids === "yes" && dataset.dataFormat.bidsCompliant !== true) return false;
      if (bids === "no" && dataset.dataFormat.bidsCompliant !== false) return false;
      if (access === "open" && dataset.access.accessType !== "Open download") return false;
      if (access === "registration" && dataset.access.accessType !== "Registration required") return false;
      if (access === "controlled" && !["Controlled access", "Application required", "Data use agreement required", "Restricted / unclear"].includes(dataset.access.accessType)) return false;
      if (longitudinal === "yes" && dataset.fmriComposition.longitudinal !== true) return false;
      if (longitudinal === "no" && dataset.fmriComposition.longitudinal !== false) return false;
      return true;
    });

    const metricFor = (dataset: FmriDataset) => ({
      subjects: dataset.scale.subjects.value,
      hours: dataset.scale.totalFmriHours.value,
      hoursPerSubject: dataset.scale.averageFmriHoursPerSubject.value,
      size: dataset.scale.datasetSizeGb.value,
      year: dataset.release.releaseYear,
      name: null,
    })[sort];

    return result.sort((left, right) => {
      if (sort === "name") return left.identification.datasetName.localeCompare(right.identification.datasetName);
      const leftValue = metricFor(left);
      const rightValue = metricFor(right);
      if (leftValue === null && rightValue === null) return left.identification.datasetName.localeCompare(right.identification.datasetName);
      if (leftValue === null) return 1;
      if (rightValue === null) return -1;
      return rightValue - leftValue;
    });
  }, [query, minSubjects, minHours, minHoursPerSubject, minSize, paradigm, group, disease, age, field, siteDesign, bids, access, longitudinal, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const reset = () => {
    setQuery(""); setMinSubjects(""); setMinHours(""); setMinHoursPerSubject(""); setMinSize("");
    setParadigm("all"); setGroup("all"); setDisease("all"); setAge(""); setField("all");
    setSiteDesign("all"); setBids("all"); setAccess("all"); setLongitudinal("all"); setSort("subjects");
  };

  return (
    <>
      <section className="fmri-summary" aria-label="fMRI 目录聚合统计">
        <article><span>Total datasets</span><strong>{integer.format(fmriDatasets.length)}</strong><small>canonical, deduplicated rows</small></article>
        <article><span>Subject entries</span><strong>{new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(subjectAggregate.value)}</strong><small>known for {subjectAggregate.known}/{fmriDatasets.length}; not cross-dataset unique</small></article>
        <article><span>Total fMRI hours</span><strong>{new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(hourAggregate.value)} h</strong><small>known for {hourAggregate.known}/{fmriDatasets.length}; missing is not zero</small></article>
        <article><span>Direct open download</span><strong>{openCount}</strong><small>registration/DUA datasets counted separately</small></article>
        <article><span>Known data size</span><strong>{new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(sizeAggregate.value)} GB</strong><small>known for {sizeAggregate.known}/{fmriDatasets.length}</small></article>
      </section>

      <section className="fmri-explorer" aria-labelledby="fmri-table-title">
        <div className="fmri-filters">
          <label className="filter-wide"><span>Dataset / institution / task</span><input type="search" value={query} onChange={(event) => updateFilter(setQuery, event.target.value)} placeholder="Search HCP, language, depression…" /></label>
          <label><span>Min subjects</span><input type="number" min="0" value={minSubjects} onChange={(event) => updateFilter(setMinSubjects, event.target.value)} placeholder="e.g. 500" /></label>
          <label><span>Min total hours</span><input type="number" min="0" step="0.1" value={minHours} onChange={(event) => updateFilter(setMinHours, event.target.value)} placeholder="known only" /></label>
          <label><span>Min hours / subject</span><input type="number" min="0" step="0.1" value={minHoursPerSubject} onChange={(event) => updateFilter(setMinHoursPerSubject, event.target.value)} placeholder="known only" /></label>
          <label><span>Paradigm</span><select value={paradigm} onChange={(event) => updateFilter(setParadigm, event.target.value)}><option value="all">All paradigms</option><option value="rest">Resting-state</option><option value="task">Task fMRI</option><option value="naturalistic">Movie / naturalistic</option></select></label>
          <label><span>Population</span><select value={group} onChange={(event) => updateFilter(setGroup, event.target.value)}><option value="all">All populations</option><option value="Healthy">Healthy</option><option value="Clinical">Clinical</option><option value="Mixed">Mixed</option><option value="Population">Population cohort</option><option value="Unknown">Unknown</option></select></label>
          <label><span>Disease / condition</span><select value={disease} onChange={(event) => updateFilter(setDisease, event.target.value)}><option value="all">All conditions</option>{diseases.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Age range contains</span><input value={age} onChange={(event) => updateFilter(setAge, event.target.value)} placeholder="child, adult, 18–…" /></label>
          <label><span>Field strength</span><select value={field} onChange={(event) => updateFilter(setField, event.target.value)}><option value="all">All field strengths</option>{fields.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Site design</span><select value={siteDesign} onChange={(event) => updateFilter(setSiteDesign, event.target.value)}><option value="all">Single + multi + unknown</option><option value="single">Single-site</option><option value="multi">Multi-site</option></select></label>
          <label><span>BIDS</span><select value={bids} onChange={(event) => updateFilter(setBids, event.target.value)}><option value="all">All BIDS states</option><option value="yes">BIDS: Yes</option><option value="no">BIDS: No</option></select></label>
          <label><span>Access</span><select value={access} onChange={(event) => updateFilter(setAccess, event.target.value)}><option value="all">All access types</option><option value="open">Open download</option><option value="registration">Registration required</option><option value="controlled">DUA / application / controlled</option></select></label>
          <label><span>Longitudinal</span><select value={longitudinal} onChange={(event) => updateFilter(setLongitudinal, event.target.value)}><option value="all">All designs</option><option value="yes">Longitudinal</option><option value="no">Cross-sectional</option></select></label>
          <label><span>Min size (GB)</span><input type="number" min="0" value={minSize} onChange={(event) => updateFilter(setMinSize, event.target.value)} placeholder="known only" /></label>
          <label><span>Sort by</span><select value={sort} onChange={(event) => updateFilter(setSort, event.target.value as SortKey)}><option value="subjects">Subjects ↓</option><option value="hours">Total hours ↓</option><option value="hoursPerSubject">Hours / subject ↓</option><option value="size">Dataset size ↓</option><option value="year">Release year ↓</option><option value="name">Dataset name A–Z</option></select></label>
          <button className="reset fmri-reset" type="button" onClick={reset}>Reset filters</button>
        </div>

        <div className="result-line">
          <div><h2 id="fmri-table-title">Canonical fMRI datasets</h2><p>{filtered.length} of {fmriDatasets.length} datasets · unknown metrics do not pass numeric filters</p></div>
          <label className="rows-per-page"><span>Rows</span><select value={pageSize} onChange={(event) => updateFilter(setPageSize, Number(event.target.value))}><option value="25">25</option><option value="50">50</option><option value="100">100</option></select></label>
        </div>

        <div className="fmri-table-wrap">
          <table className="fmri-table">
            <thead><tr><th>Dataset</th><th>Subjects</th><th>Total hours</th><th>h / subject</th><th>Composition</th><th>Population</th><th>Field / sites</th><th>Access</th><th>Size</th><th>Year</th></tr></thead>
            <tbody>
              {visibleRows.map((dataset) => (
                <tr key={dataset.id}>
                  <td><button className="dataset-name" type="button" onClick={() => setSelected(dataset)}><strong>{dataset.identification.datasetName}</strong><span>{dataset.identification.abbreviation} · {dataset.identification.repository}</span></button></td>
                  <td><strong>{dataset.scale.subjects.value === null ? "N/A" : integer.format(dataset.scale.subjects.value)}</strong><small>{evidenceLabel(dataset.scale.subjects.durationSource)}</small></td>
                  <td><strong>{metricText(dataset.scale.totalFmriHours)}</strong><small>{evidenceLabel(dataset.scale.totalFmriHours.durationSource)}</small></td>
                  <td>{metricText(dataset.scale.averageFmriHoursPerSubject)}</td>
                  <td><div className="paradigm-pills">{dataset.fmriComposition.restingState.available === true && <span>Rest</span>}{dataset.fmriComposition.task.available === true && <span>Task</span>}{dataset.fmriComposition.naturalisticMovie.available === true && <span>Movie</span>}{dataset.fmriComposition.longitudinal === true && <span>Long.</span>}</div></td>
                  <td><strong>{dataset.participants.healthyClinicalMixed}</strong><small>{dataset.participants.diseaseCondition}</small></td>
                  <td><strong>{dataset.acquisition.fieldStrengths.join(" · ") || "Unknown"}</strong><small>{dataset.acquisition.multiSite === null ? "site unknown" : dataset.acquisition.multiSite ? "multi-site" : "single-site"}</small></td>
                  <td><span className={`access-pill access-${dataset.access.accessType.toLowerCase().replaceAll(/[^a-z]+/g, "-")}`}>{dataset.access.accessType}</span></td>
                  <td>{metricText(dataset.scale.datasetSizeGb, true)}</td>
                  <td>{dataset.release.releaseYear ?? "N/A"}</td>
                </tr>
              ))}
              {visibleRows.length === 0 && <tr><td className="empty-table" colSpan={10}>No datasets match these filters. Unknown numeric values are intentionally excluded from minimum-value filters.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>← Previous</button>
          <span>Page {page} / {pageCount}</span>
          <button type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={page === pageCount}>Next →</button>
        </div>
      </section>
      {selected && <DatasetDetail dataset={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
