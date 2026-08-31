export type EvidenceKind = "reported" | "calculated" | "estimated" | "unavailable";

export type Metric = {
  value: number | null;
  unit: string;
  durationSource: EvidenceKind;
  sourceUrl: string | null;
  note: string | null;
};

export type AccessType =
  | "Open download"
  | "Registration required"
  | "Data use agreement required"
  | "Application required"
  | "Controlled access"
  | "Restricted / unclear";

export type ParticipantGroup = "Healthy" | "Clinical" | "Mixed" | "Population" | "Unknown";

export type ActivityCategory =
  | "Resting-state"
  | "Task-evoked"
  | "Naturalistic"
  | "Intervention / perturbation"
  | "Repeated / longitudinal";

export type TaskDesignCategory =
  | "Attention / executive"
  | "Emotion / social"
  | "Language / reading"
  | "Memory / learning"
  | "Motor / sensory"
  | "Reward / decision"
  | "Clinical / symptom provocation"
  | "Naturalistic movie / story"
  | "Multi-domain / other";

export type CurationLevel = "Protocol reviewed" | "Repository + BOLD header verified";

export type SourceLink = {
  label: string;
  url: string;
  scope: string;
};

export type FmriDataset = {
  id: string;
  identification: {
    datasetName: string;
    abbreviation: string;
    officialWebsite: string;
    repository: string;
    datasetUrls: string[];
    primaryPaper: string | null;
    doi: string | null;
    institutionConsortium: string;
    countryRegion: string;
  };
  scale: {
    subjects: Metric;
    sessions: Metric;
    fmriRuns: Metric;
    totalFmriDurationMinutes: Metric;
    totalFmriHours: Metric;
    averageFmriHoursPerSubject: Metric;
    datasetSizeGb: Metric;
  };
  fmriComposition: {
    restingState: { available: boolean | null; durationMinutesPerRun: Metric; totalHours: Metric };
    task: { available: boolean | null; names: string[]; durationMinutesPerSubject: Metric; totalHours: Metric };
    naturalisticMovie: { available: boolean | null; names: string[]; durationMinutesPerSubject: Metric; totalHours: Metric };
    longitudinal: boolean | null;
  };
  classification: {
    activity: ActivityCategory[];
    taskDesign: TaskDesignCategory[];
    curationLevel: CurationLevel;
  };
  participants: {
    ageRange: string;
    meanAge: string;
    sexGender: string;
    healthyClinicalMixed: ParticipantGroup;
    diseaseCondition: string;
    populationDescription: string;
  };
  acquisition: {
    scannerManufacturers: string[];
    scannerModels: string[];
    fieldStrengths: string[];
    numberOfSites: Metric;
    multiSite: boolean | null;
    trMs: Metric;
    teMs: Metric;
    flipAngleDegrees: Metric;
    voxelSize: string;
    numberOfVolumes: Metric;
    multibandFactor: Metric;
  };
  additionalModalities: {
    t1w: boolean | null;
    t2w: boolean | null;
    dwiDmri: boolean | null;
    eeg: boolean | null;
    meg: boolean | null;
    pet: boolean | null;
    behavioralData: boolean | null;
    cognitiveAssessments: boolean | null;
    genetics: boolean | null;
    clinicalVariables: boolean | null;
    physiologicalRecordings: boolean | null;
    eyeTracking: boolean | null;
  };
  dataFormat: {
    bidsCompliant: boolean | null;
    nifti: boolean | null;
    rawDataAvailable: boolean | null;
    preprocessedDataAvailable: boolean | null;
    mainPreprocessingPipeline: string;
  };
  access: {
    accessType: AccessType;
    registrationRequired: boolean | null;
    applicationRequired: boolean | null;
    dataUseAgreement: boolean | null;
    costFee: string;
    license: string;
    commercialUseRestrictions: string;
  };
  release: {
    releaseVersion: string;
    releaseYear: number | null;
    lastVerified: string;
  };
  metadata: {
    keyCharacteristics: string[];
    knownLimitations: string[];
    notes: string[];
  };
  sources: SourceLink[];
};

export const unavailable = (unit: string): Metric => ({
  value: null,
  unit,
  durationSource: "unavailable",
  sourceUrl: null,
  note: null,
});

export const metric = (
  value: number,
  unit: string,
  durationSource: Exclude<EvidenceKind, "unavailable">,
  sourceUrl: string,
  note: string | null = null,
): Metric => ({ value, unit, durationSource, sourceUrl, note });

export type DatasetSeed = {
  id: string;
  name: string;
  abbreviation: string;
  officialWebsite: string;
  repository?: string;
  datasetUrls?: string[];
  primaryPaper?: string | null;
  doi?: string | null;
  institution?: string;
  countryRegion?: string;
  subjects?: Metric;
  sessions?: Metric;
  fmriRuns?: Metric;
  totalMinutes?: Metric;
  totalHours?: Metric;
  averageHours?: Metric;
  sizeGb?: Metric;
  rest?: boolean | null;
  restMinutes?: Metric;
  restHours?: Metric;
  task?: boolean | null;
  tasks?: string[];
  taskMinutes?: Metric;
  taskHours?: Metric;
  naturalistic?: boolean | null;
  naturalisticNames?: string[];
  naturalisticMinutes?: Metric;
  naturalisticHours?: Metric;
  longitudinal?: boolean | null;
  activityCategories?: ActivityCategory[];
  taskDesignCategories?: TaskDesignCategory[];
  curationLevel?: CurationLevel;
  ageRange?: string;
  meanAge?: string;
  sexGender?: string;
  group?: ParticipantGroup;
  disease?: string;
  population?: string;
  manufacturers?: string[];
  models?: string[];
  fieldStrengths?: string[];
  sites?: Metric;
  multiSite?: boolean | null;
  trMs?: Metric;
  teMs?: Metric;
  flipAngle?: Metric;
  voxelSize?: string;
  volumes?: Metric;
  multiband?: Metric;
  modalities?: Partial<FmriDataset["additionalModalities"]>;
  format?: Partial<FmriDataset["dataFormat"]>;
  accessType: AccessType;
  registration?: boolean | null;
  application?: boolean | null;
  dua?: boolean | null;
  fee?: string;
  license?: string;
  commercial?: string;
  version?: string;
  year?: number | null;
  lastVerified?: string;
  characteristics?: string[];
  limitations?: string[];
  notes?: string[];
  sources: SourceLink[];
};

const modalityDefaults: FmriDataset["additionalModalities"] = {
  t1w: null,
  t2w: null,
  dwiDmri: null,
  eeg: null,
  meg: null,
  pet: null,
  behavioralData: null,
  cognitiveAssessments: null,
  genetics: null,
  clinicalVariables: null,
  physiologicalRecordings: null,
  eyeTracking: null,
};

const formatDefaults: FmriDataset["dataFormat"] = {
  bidsCompliant: null,
  nifti: null,
  rawDataAvailable: null,
  preprocessedDataAvailable: null,
  mainPreprocessingPipeline: "Unknown",
};

function inferredTaskDesigns(seed: DatasetSeed): TaskDesignCategory[] {
  const text = [...(seed.tasks ?? []), ...(seed.naturalisticNames ?? []), seed.name].join(" ").toLowerCase();
  const categories: TaskDesignCategory[] = [];
  const add = (category: TaskDesignCategory, pattern: RegExp) => pattern.test(text) && categories.push(category);
  add("Attention / executive", /attention|stroop|stop|inhibit|go.?no.?go|n.?back|working memory|executive|cognitive control|task switch|flanker/);
  add("Emotion / social", /emotion|face|social|theory of mind|mentaliz|affect|fear|empathy|mood/);
  add("Language / reading", /language|read|word|speech|semantic|syntax|story|narrative|lexical|bilingual|multilingual|voice/);
  add("Memory / learning", /memory|learn|encoding|retrieval|recall|recognition|conditioning|habit/);
  add("Motor / sensory", /motor|finger|hand|foot|tongue|sensorimotor|visual|auditory|somatosensory|checkerboard|pain/);
  add("Reward / decision", /reward|gambl|risk|decision|monetary|incentive|bart|reinforcement|loss|choice/);
  add("Clinical / symptom provocation", /clinical|symptom|depression|anxiety|psychosis|schizophrenia|addiction|craving|aphasia|disease|patient|disorder/);
  if (seed.naturalistic || /movie|film|story|narrative|audiobook|documentary|cartoon/.test(text)) categories.push("Naturalistic movie / story");
  const classified: TaskDesignCategory[] = categories.length ? categories : ["Multi-domain / other"];
  return [...new Set(classified)];
}

function inferredActivity(seed: DatasetSeed): ActivityCategory[] {
  const text = [...(seed.tasks ?? []), ...(seed.characteristics ?? []), seed.name].join(" ").toLowerCase();
  const categories: ActivityCategory[] = [];
  if (seed.rest === true) categories.push("Resting-state");
  if (seed.task === true || (seed.tasks?.length ?? 0) > 0) categories.push("Task-evoked");
  if (seed.naturalistic === true) categories.push("Naturalistic");
  if (/intervention|treatment|training|placebo|drug|pharmac|tms|stimulation|meditation|exercise|ketosis/.test(text)) categories.push("Intervention / perturbation");
  if (seed.longitudinal === true) categories.push("Repeated / longitudinal");
  return [...new Set(categories)];
}

export function defineDataset(seed: DatasetSeed): FmriDataset {
  return {
    id: seed.id,
    identification: {
      datasetName: seed.name,
      abbreviation: seed.abbreviation,
      officialWebsite: seed.officialWebsite,
      repository: seed.repository ?? "Institutional / project portal",
      datasetUrls: seed.datasetUrls ?? [seed.officialWebsite],
      primaryPaper: seed.primaryPaper ?? null,
      doi: seed.doi ?? null,
      institutionConsortium: seed.institution ?? "Unknown",
      countryRegion: seed.countryRegion ?? "Unknown",
    },
    scale: {
      subjects: seed.subjects ?? unavailable("subjects"),
      sessions: seed.sessions ?? unavailable("sessions"),
      fmriRuns: seed.fmriRuns ?? unavailable("runs"),
      totalFmriDurationMinutes: seed.totalMinutes ?? unavailable("minutes"),
      totalFmriHours: seed.totalHours ?? unavailable("hours"),
      averageFmriHoursPerSubject: seed.averageHours ?? unavailable("hours/subject"),
      datasetSizeGb: seed.sizeGb ?? unavailable("GB"),
    },
    fmriComposition: {
      restingState: {
        available: seed.rest ?? null,
        durationMinutesPerRun: seed.restMinutes ?? unavailable("minutes/run"),
        totalHours: seed.restHours ?? unavailable("hours"),
      },
      task: {
        available: seed.task ?? null,
        names: seed.tasks ?? [],
        durationMinutesPerSubject: seed.taskMinutes ?? unavailable("minutes/subject"),
        totalHours: seed.taskHours ?? unavailable("hours"),
      },
      naturalisticMovie: {
        available: seed.naturalistic ?? null,
        names: seed.naturalisticNames ?? [],
        durationMinutesPerSubject: seed.naturalisticMinutes ?? unavailable("minutes/subject"),
        totalHours: seed.naturalisticHours ?? unavailable("hours"),
      },
      longitudinal: seed.longitudinal ?? null,
    },
    classification: {
      activity: seed.activityCategories ?? inferredActivity(seed),
      taskDesign: seed.taskDesignCategories ?? inferredTaskDesigns(seed),
      curationLevel: seed.curationLevel ?? "Protocol reviewed",
    },
    participants: {
      ageRange: seed.ageRange ?? "Unknown",
      meanAge: seed.meanAge ?? "Unknown",
      sexGender: seed.sexGender ?? "See source metadata",
      healthyClinicalMixed: seed.group ?? "Unknown",
      diseaseCondition: seed.disease ?? "None specified",
      populationDescription: seed.population ?? "See official dataset documentation",
    },
    acquisition: {
      scannerManufacturers: seed.manufacturers ?? [],
      scannerModels: seed.models ?? [],
      fieldStrengths: seed.fieldStrengths ?? [],
      numberOfSites: seed.sites ?? unavailable("sites"),
      multiSite: seed.multiSite ?? null,
      trMs: seed.trMs ?? unavailable("ms"),
      teMs: seed.teMs ?? unavailable("ms"),
      flipAngleDegrees: seed.flipAngle ?? unavailable("degrees"),
      voxelSize: seed.voxelSize ?? "Unknown",
      numberOfVolumes: seed.volumes ?? unavailable("volumes/run"),
      multibandFactor: seed.multiband ?? unavailable("factor"),
    },
    additionalModalities: { ...modalityDefaults, ...seed.modalities },
    dataFormat: { ...formatDefaults, ...seed.format },
    access: {
      accessType: seed.accessType,
      registrationRequired: seed.registration ?? null,
      applicationRequired: seed.application ?? null,
      dataUseAgreement: seed.dua ?? null,
      costFee: seed.fee ?? "No documented fee",
      license: seed.license ?? "See data-use terms",
      commercialUseRestrictions: seed.commercial ?? "Unknown / see terms",
    },
    release: {
      releaseVersion: seed.version ?? "Current public release",
      releaseYear: seed.year ?? null,
      lastVerified: seed.lastVerified ?? "2026-08-30",
    },
    metadata: {
      keyCharacteristics: seed.characteristics ?? [],
      knownLimitations: seed.limitations ?? [],
      notes: seed.notes ?? [],
    },
    sources: seed.sources,
  };
}
