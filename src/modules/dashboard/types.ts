export type DashboardSection =
  | "capital-markets"
  | "macro-backdrop"
  | "sector-micro"
  | "policy-regulatory"
  | "deal-friction";

export type DashboardSourceKind =
  | "official"
  | "api-key"
  | "manual"
  | "sample"
  | "placeholder";

export type DashboardObservationStatus =
  | "LIVE"
  | "CACHED"
  | "MANUAL"
  | "SAMPLE"
  | "UNAVAILABLE"
  | "NEEDS_REVIEW";

export type DashboardRunStatus =
  | "SUCCESS"
  | "PARTIAL"
  | "SKIPPED"
  | "FAILED";

export type DashboardRiskDirection =
  | "supportive"
  | "neutral"
  | "restrictive"
  | "needs_review";

export type DashboardStance = "Risk-On" | "Neutral" | "Risk-Off";

export type DashboardMetricFormat =
  | "number"
  | "percent"
  | "basis-points"
  | "index"
  | "currency"
  | "count"
  | "text";

export interface DashboardSource {
  id: string;
  name: string;
  kind: DashboardSourceKind;
  url?: string;
  cadence: string;
  requiresKey?: string;
  notes?: string;
}

export interface DashboardMetric {
  id: string;
  label: string;
  section: DashboardSection;
  group: string;
  unit?: string;
  format: DashboardMetricFormat;
  cadence: string;
  source: DashboardSource;
  description: string;
  staleAfterDays: number;
}

export interface DashboardObservation {
  metricId: string;
  sourceId: string;
  sourceRunId?: string;
  observedAt: string;
  periodEnd: string;
  value?: number | null;
  textValue?: string | null;
  unit?: string | null;
  status: DashboardObservationStatus;
  metadata?: Record<string, unknown>;
}

export interface DashboardSignal {
  id?: string;
  signalKey: string;
  section: DashboardSection;
  title: string;
  summary: string;
  direction: DashboardRiskDirection;
  severity: number;
  observedAt: string;
  sourceId: string;
  sourceName: string;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardSeries {
  metric: DashboardMetric;
  observations: DashboardObservation[];
  latest?: DashboardObservation;
  previous?: DashboardObservation;
  dailyChange?: number | null;
  weeklyChange?: number | null;
  stale: boolean;
  unavailable: boolean;
}

export interface DashboardRunSummary {
  id?: string;
  sourceId: string;
  sourceName: string;
  status: DashboardRunStatus;
  startedAt: string;
  endedAt?: string | null;
  observationsFetched: number;
  observationsUpserted: number;
  signalsFetched: number;
  signalsUpserted: number;
  error?: string | null;
  metadata?: Record<string, unknown>;
}

export interface DashboardScoreContribution {
  key: string;
  label: string;
  points: number;
  direction: DashboardRiskDirection;
  detail: string;
}

export interface DashboardScorecard {
  stance: DashboardStance;
  score: number;
  explanations: string[];
  positiveContributors: DashboardScoreContribution[];
  negativeContributors: DashboardScoreContribution[];
  freshnessWarnings: string[];
}

export interface DashboardSectionView {
  section: DashboardSection;
  title: string;
  summary: string;
  series: DashboardSeries[];
  signals: DashboardSignal[];
}

export interface DashboardView {
  generatedAt: string;
  hasDatabaseData: boolean;
  scorecard: DashboardScorecard;
  sections: DashboardSectionView[];
  sourceHealth: DashboardRunSummary[];
  allSeries: DashboardSeries[];
}

export interface DashboardProviderResult {
  observations: DashboardObservation[];
  signals?: DashboardSignal[];
  warnings?: string[];
}

export interface DashboardProvider {
  source: DashboardSource;
  fetch(): Promise<DashboardProviderResult>;
}
