"use client";

import { useEffect, useMemo, useState } from "react";
import { fmriDatasets } from "../../data/fmri-catalog";
import type { ActivityCategory, FmriDataset, Metric, TaskDesignCategory } from "../../data/fmri-schema";

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
              <div><dt>Curation level</dt><dd>{dataset.classification.curationLevel}</dd></div>
              <div><dt>Activity class</dt><dd>{dataset.classification.activity.join(" · ") || "Unknown"}</dd></div>
              <div><dt>Task-design class</dt><dd>{dataset.classification.taskDesign.join(" · ")}</dd></div>
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

const activityOptions: ActivityCategory[] = [
  "Resting-state", "Task-evoked", "Naturalistic", "Intervention / perturbation", "Repeated / longitudinal",
];

const activityLabels: Record<ActivityCategory, string> = {
  "Resting-state": "静息态",
  "Task-evoked": "任务态",
  Naturalistic: "自然刺激",
  "Intervention / perturbation": "干预 / 扰动",
  "Repeated / longitudinal": "重复 / 纵向",
};

const taskDesignOptions: TaskDesignCategory[] = [
  "Attention / executive", "Emotion / social", "Language / reading", "Memory / learning",
  "Motor / sensory", "Reward / decision", "Clinical / symptom provocation",
  "Naturalistic movie / story", "Multi-domain / other",
];

export function FmriExplorer() {
  const [query, setQuery] = useState("");
  const [minSubjects, setMinSubjects] = useState("");
  const [minHours, setMinHours] = useState("");
  const [minHoursPerSubject, setMinHoursPerSubject] = useState("");
  const [minSize, setMinSize] = useState("");
  const [activity, setActivity] = useState<"all" | ActivityCategory>("all");
  const [taskDesign, setTaskDesign] = useState<"all" | TaskDesignCategory>("all");
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
  const [pageSize, setPageSize] = useState(20);
  const [selected, setSelected] = useState<FmriDataset | null>(null);
  const updateFilter = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    setPage(1);
  };

  const subjectAggregate = useMemo(() => sumKnown((dataset) => dataset.scale.subjects), []);
  const hourAggregate = useMemo(() => sumKnown((dataset) => dataset.scale.totalFmriHours), []);
  const sizeAggregate = useMemo(() => sumKnown((dataset) => dataset.scale.datasetSizeGb), []);
  const openCount = fmriDatasets.filter((dataset) => dataset.access.accessType === "Open download").length;
  const durationEvidence = useMemo(() => ({
    reported: fmriDatasets.filter((dataset) => dataset.scale.totalFmriHours.durationSource === "reported").length,
    calculated: fmriDatasets.filter((dataset) => dataset.scale.totalFmriHours.durationSource === "calculated").length,
    estimated: fmriDatasets.filter((dataset) => dataset.scale.totalFmriHours.durationSource === "estimated").length,
  }), []);
  const activityCounts = useMemo(() => Object.fromEntries(activityOptions.map((item) => [item, fmriDatasets.filter((dataset) => dataset.classification.activity.includes(item)).length])) as Record<ActivityCategory, number>, []);
  const diseases = useMemo(() => Array.from(new Set(fmriDatasets.map((dataset) => dataset.participants.diseaseCondition).filter((item) => item !== "None specified"))).sort(), []);
  const fields = useMemo(() => Array.from(new Set(fmriDatasets.flatMap((dataset) => dataset.acquisition.fieldStrengths))).sort(), []);

  const activeAdvancedCount = [minSubjects, minHours, minHoursPerSubject, minSize, disease !== "all" ? disease : "", age, field !== "all" ? field : "", siteDesign !== "all" ? siteDesign : "", bids !== "all" ? bids : "", longitudinal !== "all" ? longitudinal : ""].filter(Boolean).length;

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const ageQuery = age.trim().toLowerCase();
    const minSubjectValue = minSubjects === "" ? null : Number(minSubjects);
    const minHourValue = minHours === "" ? null : Number(minHours);
    const minHourPerSubjectValue = minHoursPerSubject === "" ? null : Number(minHoursPerSubject);
    const minSizeValue = minSize === "" ? null : Number(minSize);

    const result = fmriDatasets.filter((dataset) => {
      const haystack = [
        dataset.identification.datasetName, dataset.identification.abbreviation, dataset.id,
        dataset.identification.institutionConsortium, dataset.identification.repository,
        dataset.participants.populationDescription, dataset.participants.diseaseCondition,
        dataset.fmriComposition.task.names.join(" "), dataset.fmriComposition.naturalisticMovie.names.join(" "),
        dataset.classification.activity.join(" "), dataset.classification.taskDesign.join(" "),
      ].join(" ").toLowerCase();
      if (normalizedQuery && !haystack.includes(normalizedQuery)) return false;
      if (activity !== "all" && !dataset.classification.activity.includes(activity)) return false;
      if (taskDesign !== "all" && !dataset.classification.taskDesign.includes(taskDesign)) return false;
      if (group !== "all" && dataset.participants.healthyClinicalMixed !== group) return false;
      if (access === "open" && dataset.access.accessType !== "Open download") return false;
      if (access === "registration" && dataset.access.accessType !== "Registration required") return false;
      if (access === "controlled" && !["Controlled access", "Application required", "Data use agreement required", "Restricted / unclear"].includes(dataset.access.accessType)) return false;
      if (minSubjectValue !== null && (dataset.scale.subjects.value === null || dataset.scale.subjects.value < minSubjectValue)) return false;
      if (minHourValue !== null && (dataset.scale.totalFmriHours.value === null || dataset.scale.totalFmriHours.value < minHourValue)) return false;
      if (minHourPerSubjectValue !== null && (dataset.scale.averageFmriHoursPerSubject.value === null || dataset.scale.averageFmriHoursPerSubject.value < minHourPerSubjectValue)) return false;
      if (minSizeValue !== null && (dataset.scale.datasetSizeGb.value === null || dataset.scale.datasetSizeGb.value < minSizeValue)) return false;
      if (disease !== "all" && dataset.participants.diseaseCondition !== disease) return false;
      if (ageQuery && !dataset.participants.ageRange.toLowerCase().includes(ageQuery)) return false;
      if (field !== "all" && !dataset.acquisition.fieldStrengths.includes(field)) return false;
      if (siteDesign === "single" && dataset.acquisition.multiSite !== false) return false;
      if (siteDesign === "multi" && dataset.acquisition.multiSite !== true) return false;
      if (bids === "yes" && dataset.dataFormat.bidsCompliant !== true) return false;
      if (bids === "no" && dataset.dataFormat.bidsCompliant !== false) return false;
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
  }, [query, minSubjects, minHours, minHoursPerSubject, minSize, activity, taskDesign, group, disease, age, field, siteDesign, bids, access, longitudinal, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const reset = () => {
    setQuery(""); setMinSubjects(""); setMinHours(""); setMinHoursPerSubject(""); setMinSize("");
    setActivity("all"); setTaskDesign("all"); setGroup("all"); setDisease("all"); setAge(""); setField("all");
    setSiteDesign("all"); setBids("all"); setAccess("all"); setLongitudinal("all"); setSort("subjects"); setPage(1);
  };

  return (
    <>
      <section className="fmri-summary" aria-label="fMRI 目录聚合统计">
        <article><span>Datasets</span><strong>{integer.format(fmriDatasets.length)}</strong><small>去重后的 canonical 队列</small></article>
        <article><span>Subject entries</span><strong>{new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(subjectAggregate.value)}</strong><small>{subjectAggregate.known}/{fmriDatasets.length} 已知；跨数据集不去重</small></article>
        <article className="summary-hours"><span>Total fMRI hours</span><strong>{new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(hourAggregate.value)} h</strong><small>{hourAggregate.known}/{fmriDatasets.length} 有时长 · {durationEvidence.reported + durationEvidence.calculated} 报告/可复算 · {durationEvidence.estimated} 估计</small></article>
        <article><span>Direct open</span><strong>{openCount}</strong><small>注册、DUA 与受控访问单列</small></article>
        <p className="summary-footnote">已知数据体积：<strong>{new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(sizeAggregate.value)} GB</strong>（{sizeAggregate.known}/{fmriDatasets.length}）· 缺失值不按 0 计入</p>
      </section>

      <nav className="fmri-activity-nav" aria-label="按被试活动状态分类">
        <button type="button" className={activity === "all" ? "active" : ""} onClick={() => updateFilter(setActivity, "all")}><span>全部</span><strong>{fmriDatasets.length}</strong></button>
        {activityOptions.map((item) => <button type="button" key={item} className={activity === item ? "active" : ""} onClick={() => updateFilter(setActivity, item)}><span>{activityLabels[item]}</span><strong>{activityCounts[item]}</strong></button>)}
      </nav>

      <section className="fmri-explorer" aria-labelledby="fmri-table-title">
        <div className="fmri-primary-filters">
          <label className="filter-search"><span>搜索数据集 / 机构 / 任务</span><input type="search" value={query} onChange={(event) => updateFilter(setQuery, event.target.value)} placeholder="HCP、language、depression…" /></label>
          <label><span>任务设计</span><select value={taskDesign} onChange={(event) => updateFilter(setTaskDesign, event.target.value as "all" | TaskDesignCategory)}><option value="all">全部任务设计</option>{taskDesignOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>人群</span><select value={group} onChange={(event) => updateFilter(setGroup, event.target.value)}><option value="all">全部人群</option><option value="Healthy">Healthy</option><option value="Clinical">Clinical</option><option value="Mixed">Mixed</option><option value="Population">Population cohort</option><option value="Unknown">Unknown</option></select></label>
          <label><span>访问方式</span><select value={access} onChange={(event) => updateFilter(setAccess, event.target.value)}><option value="all">全部访问方式</option><option value="open">Open download</option><option value="registration">Registration required</option><option value="controlled">DUA / application / controlled</option></select></label>
          <label><span>排序</span><select value={sort} onChange={(event) => updateFilter(setSort, event.target.value as SortKey)}><option value="subjects">Subjects ↓</option><option value="hours">Total hours ↓</option><option value="hoursPerSubject">Hours / subject ↓</option><option value="size">Dataset size ↓</option><option value="year">Release year ↓</option><option value="name">Dataset name A–Z</option></select></label>
        </div>

        <details className="fmri-advanced">
          <summary><span>高级筛选</span><small>{activeAdvancedCount ? `${activeAdvancedCount} 项已启用` : "人数、时长、年龄、场强、BIDS 等"}</small></summary>
          <div className="fmri-advanced-grid">
            <label><span>最少受试者</span><input type="number" min="0" value={minSubjects} onChange={(event) => updateFilter(setMinSubjects, event.target.value)} placeholder="e.g. 500" /></label>
            <label><span>最少总时长 (h)</span><input type="number" min="0" step="0.1" value={minHours} onChange={(event) => updateFilter(setMinHours, event.target.value)} placeholder="仅已知值" /></label>
            <label><span>最少人均时长 (h)</span><input type="number" min="0" step="0.1" value={minHoursPerSubject} onChange={(event) => updateFilter(setMinHoursPerSubject, event.target.value)} placeholder="仅已知值" /></label>
            <label><span>疾病 / 状况</span><select value={disease} onChange={(event) => updateFilter(setDisease, event.target.value)}><option value="all">全部状况</option>{diseases.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>年龄范围包含</span><input value={age} onChange={(event) => updateFilter(setAge, event.target.value)} placeholder="child、adult、18–…" /></label>
            <label><span>场强</span><select value={field} onChange={(event) => updateFilter(setField, event.target.value)}><option value="all">全部场强</option>{fields.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>站点设计</span><select value={siteDesign} onChange={(event) => updateFilter(setSiteDesign, event.target.value)}><option value="all">全部 / 未知</option><option value="single">Single-site</option><option value="multi">Multi-site</option></select></label>
            <label><span>BIDS</span><select value={bids} onChange={(event) => updateFilter(setBids, event.target.value)}><option value="all">全部 BIDS 状态</option><option value="yes">BIDS: Yes</option><option value="no">BIDS: No</option></select></label>
            <label><span>纵向设计</span><select value={longitudinal} onChange={(event) => updateFilter(setLongitudinal, event.target.value)}><option value="all">全部设计</option><option value="yes">Longitudinal</option><option value="no">Cross-sectional</option></select></label>
            <label><span>最小体积 (GB)</span><input type="number" min="0" value={minSize} onChange={(event) => updateFilter(setMinSize, event.target.value)} placeholder="仅已知值" /></label>
            <button className="reset fmri-reset" type="button" onClick={reset}>清除全部筛选</button>
          </div>
        </details>

        <div className="result-line">
          <div><h2 id="fmri-table-title">fMRI 数据集</h2><p>显示 {filtered.length} / {fmriDatasets.length} · 数值筛选会排除 Unknown</p></div>
          <label className="rows-per-page"><span>每页</span><select value={pageSize} onChange={(event) => updateFilter(setPageSize, Number(event.target.value))}><option value="20">20</option><option value="40">40</option><option value="80">80</option></select></label>
        </div>

        <div className="fmri-result-list">
          {visibleRows.map((dataset) => (
            <article className="fmri-dataset-card" key={dataset.id}>
              <div className="dataset-card-head">
                <div className="dataset-card-identity">
                  <p><span>{dataset.identification.abbreviation}</span><span>{dataset.identification.repository}</span><span>{dataset.classification.curationLevel}</span></p>
                  <button className="dataset-name" type="button" onClick={() => setSelected(dataset)}><strong>{dataset.identification.datasetName}</strong></button>
                </div>
                <div className="dataset-card-access"><span className={`access-pill access-${dataset.access.accessType.toLowerCase().replaceAll(/[^a-z]+/g, "-")}`}>{dataset.access.accessType}</span><small>{dataset.release.releaseYear ?? "Year N/A"}</small></div>
              </div>

              <dl className="dataset-card-metrics">
                <div><dt>Subjects</dt><dd>{dataset.scale.subjects.value === null ? "N/A" : integer.format(dataset.scale.subjects.value)}</dd><small>{evidenceLabel(dataset.scale.subjects.durationSource)}</small></div>
                <div><dt>Total fMRI</dt><dd>{metricText(dataset.scale.totalFmriHours, true)}</dd><small>{evidenceLabel(dataset.scale.totalFmriHours.durationSource)}</small></div>
                <div><dt>Hours / subject</dt><dd>{metricText(dataset.scale.averageFmriHoursPerSubject)}</dd><small>{evidenceLabel(dataset.scale.averageFmriHoursPerSubject.durationSource)}</small></div>
                <div><dt>Data size</dt><dd>{metricText(dataset.scale.datasetSizeGb, true)}</dd><small>{evidenceLabel(dataset.scale.datasetSizeGb.durationSource)}</small></div>
              </dl>

              <div className="dataset-card-context">
                <div><span className="context-label">活动状态</span><div className="paradigm-pills">{dataset.classification.activity.map((item) => <span key={item}>{activityLabels[item]}</span>)}</div></div>
                <div><span className="context-label">实验设计</span><div className="task-design-pills">{dataset.classification.taskDesign.slice(0, 4).map((item) => <span key={item}>{item}</span>)}</div></div>
                <div className="population-copy"><span className="context-label">人群 / 状况</span><strong>{dataset.participants.healthyClinicalMixed}</strong><p>{dataset.participants.diseaseCondition}</p></div>
              </div>

              <div className="dataset-card-foot">
                <span>{dataset.participants.ageRange}</span>
                <span>{dataset.acquisition.fieldStrengths.join(" · ") || "Field strength unknown"}</span>
                <button type="button" onClick={() => setSelected(dataset)}>查看协议、来源与限制 →</button>
              </div>
            </article>
          ))}
          {visibleRows.length === 0 && <div className="empty-card">没有符合当前条件的数据集。数值为 Unknown 的条目不会通过最小值筛选。</div>}
        </div>

        <div className="pagination">
          <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>← 上一页</button>
          <span>第 {page} / {pageCount} 页</span>
          <button type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={page === pageCount}>下一页 →</button>
        </div>
      </section>
      {selected && <DatasetDetail dataset={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
