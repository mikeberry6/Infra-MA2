import { describe, expect, it } from "vitest";
import { shouldAcceptPublicNewsMatch } from "./news-search-eligibility";

const base = {
  confidence: "HIGH" as const,
  category: "INVESTMENT_FIRM_NEWS",
  officialSource: false,
  strongEventSignal: false,
};

describe("public-news search eligibility", () => {
  it("rejects low-confidence and partial short-name collisions", () => {
    expect(shouldAcceptPublicNewsMatch({
      ...base,
      entityLabel: "Tiger Infrastructure Partners",
      title: "Cubs on cams lift hope for higher Sundarbans tiger count",
      summary: "Wildlife officials discussed carrying capacity.",
    })).toBe(false);

    expect(shouldAcceptPublicNewsMatch({
      ...base,
      entityLabel: "Northampton Capital Partners",
      title: "Small housing project wraps up in Northampton",
      summary: "A local infill development has completed.",
    })).toBe(false);

    expect(shouldAcceptPublicNewsMatch({
      ...base,
      confidence: "LOW",
      category: "LOW_CONFIDENCE_NEEDS_REVIEW",
      entityLabel: "Ares",
      title: "Ares weather warning",
      summary: "A low-confidence name collision.",
    })).toBe(false);
  });

  it("keeps exact multi-word, distinctive brand, official, and event matches", () => {
    expect(shouldAcceptPublicNewsMatch({
      ...base,
      entityLabel: "Gateway Fiber",
      title: "Gateway Fiber expands its community network",
      summary: "The company announced a regional expansion.",
    })).toBe(true);

    expect(shouldAcceptPublicNewsMatch({
      ...base,
      entityLabel: "AustralianSuper",
      title: "AustralianSuper promotes two equities leaders",
      summary: "The investment manager announced the appointments.",
    })).toBe(true);

    expect(shouldAcceptPublicNewsMatch({
      ...base,
      entityLabel: "Aberdeen",
      title: "Aberdeen announces an infrastructure update",
      summary: "Published by the manager.",
      officialSource: true,
    })).toBe(true);

    expect(shouldAcceptPublicNewsMatch({
      ...base,
      entityLabel: "Ares",
      title: "Ares enters takeover talks",
      summary: "The firm is considering an acquisition.",
      strongEventSignal: true,
    })).toBe(true);
  });
});
