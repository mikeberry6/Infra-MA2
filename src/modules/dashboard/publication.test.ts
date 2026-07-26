import { describe, expect, it } from "vitest";
import { isPublicDashboardSignal } from "@/modules/dashboard/publication";
import {
  DASHBOARD_METHODOLOGY_VERSIONS,
  FEDERAL_REGISTER_METHODOLOGY_DOCUMENT_TYPES,
} from "@/modules/dashboard/methodology-cutover";
import { signalContentHash } from "@/modules/dashboard/sync";
import { buildDashboardView } from "@/modules/dashboard/view-model";
import type { DashboardObservation, DashboardSignal } from "@/modules/dashboard/types";

const observation: DashboardObservation = {
  metricId: "federal_register_infra_notices",
  sourceId: "federal-register",
  observedAt: "2026-07-22T00:00:00.000Z",
  periodEnd: "2026-07-22T00:00:00.000Z",
  value: 5,
  unit: "count",
  status: "LIVE",
  metadata: {
    methodologyVersion: DASHBOARD_METHODOLOGY_VERSIONS.federalRegisterInfraNotices,
    deduplicatedBy: "document_number",
    documentTypes: [...FEDERAL_REGISTER_METHODOLOGY_DOCUMENT_TYPES],
  },
};

function signal(
  index: number,
  reviewStatus: DashboardSignal["reviewStatus"],
  direction: DashboardSignal["direction"] = "needs_review",
): DashboardSignal {
  const item: DashboardSignal = {
    signalKey: `notice-${index}`,
    section: "policy-regulatory",
    title: `Notice ${index}`,
    summary: "Fixture",
    direction,
    severity: 1,
    observedAt: "2026-07-22T00:00:00.000Z",
    sourceId: "federal-register",
    sourceName: "Federal Register",
    reviewStatus,
    contentHash: "",
    reviewedContentHash: null,
  };
  const contentHash = signalContentHash(item);
  return {
    ...item,
    contentHash,
    reviewedContentHash: reviewStatus === "APPROVED" ? contentHash : null,
  };
}

describe("dashboard signal publication gate", () => {
  it("requires approval of the current content hash", () => {
    expect(isPublicDashboardSignal(signal(1, "PENDING"))).toBe(false);
    expect(isPublicDashboardSignal(signal(1, "REJECTED"))).toBe(false);
    expect(isPublicDashboardSignal({ ...signal(1, "APPROVED"), reviewedContentHash: "older" })).toBe(false);
    expect(isPublicDashboardSignal(signal(1, "APPROVED"))).toBe(true);
    expect(isPublicDashboardSignal({ ...signal(1, "APPROVED"), summary: "Changed after approval" })).toBe(false);
  });

  it("rejects approved legacy sample rows by source identity or metadata", () => {
    const approved = signal(1, "APPROVED");
    expect(isPublicDashboardSignal({ ...approved, sourceId: "sample" })).toBe(false);
    expect(isPublicDashboardSignal({ ...approved, sourceName: "Dashboard Sample Data" })).toBe(false);
    expect(isPublicDashboardSignal({ ...approved, metadata: { sample: true } })).toBe(false);
    expect(isPublicDashboardSignal({ ...approved, metadata: { sourceKind: "sample" } })).toBe(false);
    expect(isPublicDashboardSignal({ ...approved, metadata: { sample: false } })).toBe(true);
  });

  it("rejects approved signals outside the active reviewed-source allowlist", () => {
    const approved = signal(1, "APPROVED");
    expect(isPublicDashboardSignal({ ...approved, sourceId: "manual-import", sourceName: "Manual Import" })).toBe(false);
    expect(isPublicDashboardSignal({ ...approved, sourceId: "unknown-source" })).toBe(false);
  });

  it("keeps approval for unchanged public content and invalidates changed interpretations", () => {
    const current = signal(1, "APPROVED");
    expect(signalContentHash(current)).toBe(signalContentHash({ ...current, metadata: { refreshed: true } }));
    expect(signalContentHash(current)).not.toBe(signalContentHash({ ...current, summary: "Changed interpretation" }));
  });

  it("excludes pending restrictive signals from both public sections and risk scoring", () => {
    const pending = Array.from({ length: 10 }, (_, index) => signal(index, "PENDING", "restrictive"));
    const approved = Array.from({ length: 10 }, (_, index) => signal(index, "APPROVED", "restrictive"));
    const base = {
      observations: [observation],
      sourceHealth: [],
      generatedAt: "2026-07-22T12:00:00.000Z",
      hasDatabaseData: true,
    };

    const pendingView = buildDashboardView({ ...base, signals: pending });
    const approvedView = buildDashboardView({ ...base, signals: approved });
    const pendingSection = pendingView.sections.find((section) => section.section === "policy-regulatory");
    const approvedSection = approvedView.sections.find((section) => section.section === "policy-regulatory");

    expect(pendingSection?.signals).toHaveLength(0);
    expect(approvedSection?.signals).toHaveLength(10);
    expect(approvedView.scorecard.score).toBe(pendingView.scorecard.score - 4);
  });

  it("does not score raw notice volume or approved needs-review matches as restrictive", () => {
    const needsReview = Array.from({ length: 10 }, (_, index) => signal(index, "APPROVED"));
    const base = {
      observations: [observation],
      sourceHealth: [],
      generatedAt: "2026-07-22T12:00:00.000Z",
      hasDatabaseData: true,
    };

    const noSignalsView = buildDashboardView({ ...base, signals: [] });
    const needsReviewView = buildDashboardView({ ...base, signals: needsReview });
    expect(needsReviewView.scorecard.score).toBe(noSignalsView.scorecard.score);
    expect(needsReviewView.scorecard.negativeContributors).toHaveLength(0);
  });

  it("excludes approved sample signals from both sections and scoring", () => {
    const approved = Array.from({ length: 10 }, (_, index) => signal(index, "APPROVED", "restrictive"));
    const samples = approved.map((item) => ({ ...item, metadata: { sample: true } }));
    const base = {
      observations: [observation],
      sourceHealth: [],
      generatedAt: "2026-07-22T12:00:00.000Z",
      hasDatabaseData: true,
    };

    const safeView = buildDashboardView({ ...base, signals: approved });
    const sampleView = buildDashboardView({ ...base, signals: samples });
    expect(sampleView.sections.find((section) => section.section === "policy-regulatory")?.signals).toHaveLength(0);
    expect(sampleView.scorecard.score).toBe(safeView.scorecard.score + 4);
  });

  it("does not treat unreviewed keyword-screen award counts as supportive demand", () => {
    const view = buildDashboardView({
      observations: [{
        metricId: "usaspending_infra_awards_30d",
        sourceId: "usaspending",
        observedAt: "2026-07-22T00:00:00.000Z",
        periodEnd: "2026-07-22T00:00:00.000Z",
        value: 2_724,
        unit: "count",
        status: "LIVE",
        metadata: {
          methodologyVersion: DASHBOARD_METHODOLOGY_VERSIONS.usaSpendingAwards30d,
          countEndpoint: true,
        },
      }],
      signals: [],
      sourceHealth: [],
      generatedAt: "2026-07-22T12:00:00.000Z",
      hasDatabaseData: true,
    });

    expect(view.scorecard.score).toBe(50);
    expect(view.scorecard.positiveContributors).toHaveLength(0);
  });
});
