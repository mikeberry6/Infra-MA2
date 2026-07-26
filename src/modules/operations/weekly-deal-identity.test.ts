import { describe, expect, it } from "vitest";
import {
  assertGeneratedWeeklyCardCollisionSafe,
  assertWeeklyProposalIdentitySnapshot,
  findWeeklySeedDeal,
  isOrdinalWeeklyLegacyId,
  resolveWeeklyProposalIdentity,
  resolveWeeklySeedDeal,
  resolveWeeklyProposalMatch,
  stableWeeklyProposalLegacyId,
  weeklyDealIsCoveredByPersisted,
  weeklyDealIdentitiesMatch,
  weeklyLegacyIdCollides,
  weeklyProposalDisposition,
} from "@/modules/operations/weekly-deal-identity";

const issueDate = "2026-07-03T23:00:00.000Z";

describe("weekly deal durable identity", () => {
  it("does not accept a matching ordinal ID for a different transaction", () => {
    const weekly = {
      id: "WB-2026-07-03-004",
      target: "SK / KKR Korea renewables platform",
      date: issueDate,
      sourceUrl: "https://example.test/sk-kkr",
    };
    const persisted = {
      legacyId: "WB-2026-07-03-004",
      target: "Kallista Energy",
      date: issueDate,
      sourceUrls: ["https://example.test/kallista"],
    };

    expect(weeklyDealIdentitiesMatch(weekly, persisted)).toBe(false);
    expect(weeklyLegacyIdCollides(weekly, persisted)).toBe(true);
  });

  it("requires target/date agreement even when the source matches", () => {
    expect(weeklyDealIdentitiesMatch(
      {
        target: "Nordergrunde offshore wind farm",
        date: issueDate,
        sourceUrl: "https://example.test/nordergrunde#announcement",
      },
      {
        target: "Completely renamed target",
        date: "2020-01-01T00:00:00.000Z",
        sourceUrls: ["https://example.test/nordergrunde"],
      },
    )).toBe(false);
    expect(weeklyDealIdentitiesMatch(
      {
        target: "Nordergründe Offshore Wind Farm",
        date: issueDate,
        sourceUrl: "https://example.test/nordergrunde#announcement",
      },
      {
        target: "Nordergrunde offshore wind farm",
        date: "2026-06-30T12:00:00.000Z",
        sourceUrls: ["https://example.test/nordergrunde"],
      },
    )).toBe(true);
  });

  it.each([
    ["Platform (US)", "Platform (UK)"],
    ["Vehicle (JV A)", "Vehicle (JV B)"],
  ])("preserves identity-bearing parentheticals: %s / %s", (leftTarget, rightTarget) => {
    const left = {
      id: "WB-2026-07-03-001",
      target: leftTarget,
      date: issueDate,
      sourceUrl: "https://example.test/shared-announcement",
    };
    const right = {
      ...left,
      id: "WB-2026-07-03-002",
      target: rightTarget,
    };

    expect(weeklyDealIdentitiesMatch(left, right)).toBe(false);
    expect(stableWeeklyProposalLegacyId(left))
      .not.toBe(stableWeeklyProposalLegacyId(right));
  });

  it("still matches explicit acronym and geographic qualifier variants", () => {
    expect(weeklyDealIdentitiesMatch(
      {
        target: "HyCC (Hydrogen Chemistry Company)",
        date: issueDate,
        sourceUrl: "https://example.test/hycc",
      },
      {
        target: "HyCC",
        date: issueDate,
        sourceUrl: "https://example.test/hycc",
      },
    )).toBe(true);
    expect(weeklyDealIdentitiesMatch(
      {
        target: "48.4 MW Community Solar Portfolio (NM)",
        date: issueDate,
        sourceUrl: "https://example.test/solar",
      },
      {
        target: "48.4 MW Community Solar Portfolio (New Mexico)",
        date: issueDate,
        sourceUrl: "https://example.test/solar",
      },
    )).toBe(true);
  });

  it("normalizes LinkedIn share-slug punctuation by activity ID", () => {
    const weekly = {
      target: "Groupe Santé Sedna",
      date: "2026-06-12T14:00:00.000Z",
      sourceUrl: "https://www.linkedin.com/posts/ken-brooks_example-activity-7470473843157929984-Sbp",
    };
    const persisted = {
      target: weekly.target,
      date: weekly.date,
      sourceUrl: "https://linkedin.com/posts/ken-brooks_example-activity-7470473843157929984-Sbp_",
    };
    expect(weeklyDealIdentitiesMatch(weekly, persisted)).toBe(true);
    expect(weeklyDealIdentitiesMatch(weekly, {
      ...persisted,
      sourceUrl: "https://linkedin.com/posts/ken-brooks_example-activity-7470473843157929985-Sbp_",
    })).toBe(false);
  });

  it("resolves a shifted seed identity instead of an unrelated exact ordinal", () => {
    const weekly = {
      id: "WB-2026-07-03-004",
      target: "SK / KKR Korea renewables platform",
      date: issueDate,
      sourceUrl: "https://example.test/sk-kkr",
    };
    const candidates = [
      {
        id: "WB-2026-07-03-004",
        target: "Kallista Energy",
        date: issueDate,
        sourceUrl: "https://example.test/kallista",
      },
      {
        id: "WB-2026-07-03-022",
        target: weekly.target,
        date: issueDate,
        sourceUrl: weekly.sourceUrl,
      },
    ];

    expect(resolveWeeklySeedDeal(weekly, candidates).id).toBe("WB-2026-07-03-022");
  });

  it("disambiguates two transactions announced by the same source", () => {
    const sharedSource = "https://example.test/platform-and-portfolio";
    const weekly = {
      id: "WB-2026-03-07-014",
      target: "Sierra Railroad Company",
      date: "2026-03-07T12:00:00.000Z",
      sourceUrl: sharedSource,
    };
    const candidates = [
      {
        id: "INF-2026-120",
        target: weekly.target,
        date: "2026-03-06T12:00:00.000Z",
        sourceUrl: sharedSource,
      },
      {
        id: "INF-2026-121",
        target: "Central Valley Ag Transport",
        date: "2026-03-06T12:00:00.000Z",
        sourceUrl: sharedSource,
      },
    ];

    expect(resolveWeeklySeedDeal(weekly, candidates).id).toBe("INF-2026-120");
  });

  it("accepts a curated seed ID with an exact target/date after source replacement", () => {
    const weekly = {
      id: "WB-2026-02-14-001",
      target: "Contact Energy",
      date: "2026-02-20T08:00:00.000Z",
      sourceUrl: "https://example.test/weekly-source",
    };
    const seed = {
      id: "INF-2026-012",
      target: weekly.target,
      date: "2026-02-16T08:00:00.000Z",
      sourceUrl: "https://example.test/canonical-source",
    };
    const persisted = {
      legacyId: seed.id,
      target: seed.target,
      date: seed.date,
      sourceUrls: ["https://example.test/reviewed-primary-source"],
    };

    expect(weeklyDealIsCoveredByPersisted(weekly, [persisted], [seed])).toBe(false);
    expect(weeklyDealIsCoveredByPersisted(
      weekly,
      [persisted],
      [seed],
      { [weekly.id]: seed.id },
    )).toBe(true);
  });

  it("does not infer lineage from a sole target/date match with conflicting sources", () => {
    const weekly = {
      id: "WB-2026-07-03-010",
      target: "Repeat Infrastructure Platform",
      date: issueDate,
      sourceUrl: "https://example.test/new-transaction",
    };
    const priorSeed = {
      id: "INF-2026-190",
      target: weekly.target,
      date: "2026-06-25T12:00:00.000Z",
      sourceUrl: "https://example.test/prior-transaction",
    };
    const persisted = {
      legacyId: priorSeed.id,
      target: priorSeed.target,
      date: priorSeed.date,
      sourceUrls: [priorSeed.sourceUrl],
    };

    expect(findWeeklySeedDeal(weekly, [priorSeed])).toBeNull();
    expect(weeklyDealIsCoveredByPersisted(
      weekly,
      [persisted],
      [priorSeed],
    )).toBe(false);

    const sourceLessPriorSeed = {
      ...priorSeed,
      id: "INF-2026-191",
      sourceUrl: "",
    };
    expect(findWeeklySeedDeal(weekly, [sourceLessPriorSeed])).toBeNull();
    expect(weeklyDealIdentitiesMatch(weekly, sourceLessPriorSeed)).toBe(false);
    expect(weeklyDealIsCoveredByPersisted(
      weekly,
      [{
        ...persisted,
        legacyId: sourceLessPriorSeed.id,
        sourceUrls: [],
      }],
      [sourceLessPriorSeed],
    )).toBe(false);
  });

  it("does not let one shared-source seed hide a second transaction", () => {
    const sourceUrl = "https://example.test/shared-announcement";
    const first = {
      id: "INF-2026-120",
      target: "Sierra Railroad Company",
      date: issueDate,
      sourceUrl,
    };
    const second = {
      id: "INF-2026-121",
      target: "Central Valley Ag Transport",
      date: issueDate,
      sourceUrl,
    };
    const persistedFirst = {
      legacyId: first.id,
      target: first.target,
      date: first.date,
      sourceUrls: [sourceUrl],
    };

    expect(weeklyDealIsCoveredByPersisted(
      second,
      [persistedFirst],
      [first, second],
    )).toBe(false);
  });

  it("fails closed when an ordinal collision has no durable identity match", () => {
    expect(() => resolveWeeklySeedDeal(
      {
        id: "WB-2026-07-03-004",
        target: "SK / KKR Korea renewables platform",
        date: issueDate,
      },
      [{ id: "WB-2026-07-03-004", target: "Kallista Energy", date: issueDate }],
    )).toThrow("Weekly legacy ID collision");
  });

  it("generates the same proposal ID after an ordinal insertion", () => {
    const identity = {
      target: "SK / KKR Korea renewables platform",
      date: issueDate,
      sourceUrl: "https://example.test/sk-kkr",
    };
    const first = stableWeeklyProposalLegacyId({
      ...identity,
      id: "WB-2026-07-03-004",
    });
    const shifted = stableWeeklyProposalLegacyId({
      ...identity,
      id: "WB-2026-07-03-009",
    });

    expect(first).toBe(shifted);
    expect(first).toMatch(/^WB-2026-07-03-H[0-9a-f]{24}$/);
    expect(isOrdinalWeeklyLegacyId(first)).toBe(false);
    expect(isOrdinalWeeklyLegacyId("WB-2026-07-03-004")).toBe(true);
  });

  it("fails closed when distinct cards resolve to the same generated proposal ID", () => {
    const generatedId = stableWeeklyProposalLegacyId({
      id: "WB-2026-07-03-001",
      target: "Same Target",
      date: issueDate,
      sourceUrl: "https://example.test/same-announcement",
    });
    expect(() => assertGeneratedWeeklyCardCollisionSafe(
      generatedId,
      ["WB-2026-07-03-001"],
      ["WB-2026-07-03-002"],
    )).toThrow("Different weekly cards resolved");
    expect(() => assertGeneratedWeeklyCardCollisionSafe(
      generatedId,
      ["WB-2026-07-03-001"],
      ["WB-2026-07-03-001"],
    )).not.toThrow();
    expect(() => assertGeneratedWeeklyCardCollisionSafe(
      "INF-2026-120",
      ["WB-2026-07-03-001"],
      ["WB-2026-07-03-002"],
    )).not.toThrow();
  });

  it("normalizes source ordering when generating a proposal ID", () => {
    const first = stableWeeklyProposalLegacyId({
      id: "WB-2026-07-03-004",
      target: "Example Platform",
      date: issueDate,
      sourceUrls: [
        "https://example.test/b#section",
        "https://example.test/a/",
      ],
    });
    const reordered = stableWeeklyProposalLegacyId({
      id: "WB-2026-07-03-020",
      target: "Example Platform",
      date: "2026-07-03T01:00:00.000Z",
      sourceUrls: [
        "https://example.test/a",
        "https://example.test/b",
      ],
    });

    expect(first).toBe(reordered);
  });

  it("requires a source before generating a proposal ID", () => {
    expect(() => stableWeeklyProposalLegacyId({
      id: "WB-2026-07-03-024",
      target: "Avenue aviation portfolio",
      date: issueDate,
      sourceUrl: "#",
    })).toThrow("without a source");
  });

  it("reuses exactly one matching proposal identity", () => {
    const weekly = {
      target: "Avenue aviation portfolio",
      date: issueDate,
      sourceUrl: "https://example.test/avenue",
    };
    const match = {
      legacyId: "WB-2026-07-03-H0123456789abcdef01234567",
      target: weekly.target,
      date: issueDate,
      sourceUrls: [weekly.sourceUrl],
    };

    expect(resolveWeeklyProposalMatch(weekly, [match])).toBe(match);
  });

  it("does not treat a shared source as the identity of another target", () => {
    expect(resolveWeeklyProposalMatch(
      {
        target: "Central Valley Ag Transport",
        date: issueDate,
        sourceUrl: "https://example.test/shared",
      },
      [{
        legacyId: "INF-2026-120",
        target: "Sierra Railroad Company",
        date: issueDate,
        sourceUrls: ["https://example.test/shared"],
      }],
    )).toBeNull();
  });

  it("rejects exact target/date matches with different nonempty sources", () => {
    expect(() => resolveWeeklyProposalMatch(
      {
        target: "Avenue aviation portfolio",
        date: issueDate,
        sourceUrl: "https://example.test/avenue-a",
      },
      [{
        legacyId: "INF-2026-120",
        target: "Avenue aviation portfolio",
        date: issueDate,
        sourceUrls: ["https://example.test/avenue-b"],
      }],
    )).toThrow("associated with a different source");
  });

  it("fails closed when multiple proposal records match", () => {
    const weekly = {
      target: "Avenue aviation portfolio",
      date: issueDate,
      sourceUrl: "https://example.test/avenue",
    };
    expect(() => resolveWeeklyProposalMatch(weekly, [
      { ...weekly, legacyId: "draft-a" },
      { ...weekly, legacyId: "draft-b" },
    ])).toThrow("Multiple proposal records");
  });

  it("does not overwrite July 3's persisted ordinal collision", () => {
    const weekly = {
      id: "WB-2026-07-03-004",
      target: "SK / KKR Korea renewables platform",
      date: issueDate,
      sourceUrl: "https://example.test/sk-kkr",
    };
    const persisted = [{
      legacyId: "WB-2026-07-03-004",
      target: "Kallista Energy",
      date: issueDate,
      sourceUrls: ["https://example.test/kallista"],
      status: "PUBLISHED",
    }];

    const resolved = resolveWeeklyProposalIdentity(weekly, persisted, [weekly]);
    expect(resolved.legacyId).toMatch(/^WB-2026-07-03-H[0-9a-f]{24}$/);
    expect(resolved.legacyId).not.toBe(weekly.id);
  });

  it("reuses an existing matching DRAFT without renaming it", () => {
    const weekly = {
      id: "WB-2026-07-03-004",
      target: "SK / KKR Korea renewables platform",
      date: issueDate,
      sourceUrl: "https://example.test/sk-kkr",
    };
    const draft = {
      legacyId: "WB-2026-07-03-H0123456789abcdef01234567",
      target: weekly.target,
      date: issueDate,
      sourceUrls: [weekly.sourceUrl],
      status: "DRAFT",
    };

    expect(resolveWeeklyProposalIdentity(weekly, [draft], [weekly])).toMatchObject({
      legacyId: draft.legacyId,
      persisted: draft,
    });
  });

  it.each(["IN_REVIEW", "PUBLISHED", "ARCHIVED"])(
    "returns a matching protected %s record for tracked no-op handling",
    (status) => {
    const weekly = {
      id: "WB-2026-07-03-004",
      target: "SK / KKR Korea renewables platform",
      date: issueDate,
      sourceUrl: "https://example.test/sk-kkr",
    };
    const protectedRecord = {
      legacyId: "INF-2026-200",
      target: weekly.target,
      date: issueDate,
      sourceUrls: [weekly.sourceUrl],
      status,
    };
    expect(resolveWeeklyProposalIdentity(
      weekly,
      [protectedRecord],
      [weekly],
    )).toMatchObject({
      legacyId: protectedRecord.legacyId,
      persisted: protectedRecord,
    });
    },
  );

  it.each(["IN_REVIEW", "ARCHIVED"])(
    "tracks a hashed %s proposal after editorial source replacement",
    (status) => {
      const weekly = {
        id: "WB-2026-07-03-024",
        target: "Genus Power Infrastructures",
        date: issueDate,
        sourceUrl: "https://example.test/secondary-discovery-source",
      };
      const protectedRecord = {
        legacyId: stableWeeklyProposalLegacyId(weekly),
        target: weekly.target,
        date: issueDate,
        sourceUrls: ["https://example.test/reviewed-primary-filing"],
        status,
      };
      const resolved = resolveWeeklyProposalIdentity(
        weekly,
        [protectedRecord],
        [weekly],
      );

      expect(resolved.persisted).toBe(protectedRecord);
      expect(weeklyProposalDisposition(resolved.persisted)).toBe("TRACKED");
    },
  );

  it("covers a published hashed proposal after editorial source replacement", () => {
    const weekly = {
      id: "WB-2026-07-03-024",
      target: "Genus Power Infrastructures",
      date: issueDate,
      sourceUrl: "https://example.test/secondary-discovery-source",
    };
    expect(weeklyDealIsCoveredByPersisted(
      weekly,
      [{
        legacyId: stableWeeklyProposalLegacyId(weekly),
        target: weekly.target,
        date: issueDate,
        sourceUrls: ["https://example.test/reviewed-primary-filing"],
      }],
      [weekly],
    )).toBe(true);
  });

  it("covers a seedless published proposal by its deterministic hashed lineage", () => {
    const weekly = {
      id: "WB-2026-07-03-024",
      target: "Genus Power Infrastructures",
      date: issueDate,
      sourceUrl: "https://example.test/secondary-discovery-source",
    };
    expect(weeklyDealIsCoveredByPersisted(
      weekly,
      [{
        legacyId: stableWeeklyProposalLegacyId(weekly),
        target: "Genus Power Infrastructures Limited",
        date: "2026-07-08T12:00:00.000Z",
        sourceUrls: ["https://example.test/reviewed-primary-filing"],
      }],
      [],
    )).toBe(true);
  });

  it.each([
    [null, "SYNC"],
    [{ status: "DRAFT" }, "SYNC"],
    [{ status: "IN_REVIEW" }, "TRACKED"],
    [{ status: "PUBLISHED" }, "TRACKED"],
    [{ status: "ARCHIVED" }, "TRACKED"],
  ] as const)("classifies protected proposal status as a no-op: %o", (value, expected) => {
    const persisted = value
      ? {
          legacyId: "proposal-id",
          target: "Target",
          date: issueDate,
          status: value.status,
        }
      : null;
    expect(weeklyProposalDisposition(persisted)).toBe(expected);
  });

  it("preserves a matching non-ordinal canonical seed ID", () => {
    const weekly = {
      id: "WB-2026-07-03-004",
      target: "SK / KKR Korea renewables platform",
      date: issueDate,
      sourceUrl: "https://example.test/sk-kkr",
    };
    const seed = { ...weekly, id: "INF-2026-250" };

    expect(resolveWeeklyProposalIdentity(weekly, [], [seed])).toMatchObject({
      legacyId: seed.id,
      seed,
    });
  });

  it("requires a source even when a non-ordinal seed matches", () => {
    const weekly = {
      id: "WB-2026-07-03-024",
      target: "Avenue aviation portfolio",
      date: issueDate,
      sourceUrl: "#",
    };
    expect(() => resolveWeeklyProposalIdentity(
      weekly,
      [],
      [{ ...weekly, id: "INF-2026-260" }],
    )).toThrow("without a source");
  });

  it("fails closed if a generated proposal ID is occupied", () => {
    const weekly = {
      id: "WB-2026-07-03-004",
      target: "SK / KKR Korea renewables platform",
      date: issueDate,
      sourceUrl: "https://example.test/sk-kkr",
    };
    const generated = stableWeeklyProposalLegacyId(weekly);

    expect(() => resolveWeeklyProposalIdentity(weekly, [{
      legacyId: generated,
      target: "Unrelated Target",
      date: "2020-01-01T00:00:00.000Z",
      sourceUrls: ["https://example.test/unrelated"],
      status: "DRAFT",
    }], [weekly])).toThrow("already occupied");
  });

  it("rejects a proposal deleted after planning", () => {
    const weekly = {
      id: "WB-2026-07-03-004",
      target: "SK / KKR Korea renewables platform",
      date: issueDate,
      sourceUrl: "https://example.test/sk-kkr",
    };
    const expected = {
      legacyId: "WB-2026-07-03-H0123456789abcdef01234567",
      target: weekly.target,
      date: issueDate,
      sourceUrls: [weekly.sourceUrl],
      status: "DRAFT",
      updatedAt: "2026-07-03T23:30:00.000Z",
    };
    expect(() => assertWeeklyProposalIdentitySnapshot(
      weekly,
      expected.legacyId,
      expected,
      [],
    )).toThrow("changed after planning");
  });

  it("rejects a status transition after planning", () => {
    const weekly = {
      id: "WB-2026-07-03-004",
      target: "SK / KKR Korea renewables platform",
      date: issueDate,
      sourceUrl: "https://example.test/sk-kkr",
    };
    const expected = {
      legacyId: "WB-2026-07-03-H0123456789abcdef01234567",
      target: weekly.target,
      date: issueDate,
      sourceUrls: [weekly.sourceUrl],
      status: "DRAFT",
      updatedAt: "2026-07-03T23:30:00.000Z",
    };
    expect(() => assertWeeklyProposalIdentitySnapshot(
      weekly,
      expected.legacyId,
      expected,
      [{ ...expected, status: "IN_REVIEW" }],
    )).toThrow("changed after planning");
  });

  it("rejects a matching proposal created after planning", () => {
    const weekly = {
      id: "WB-2026-07-03-004",
      target: "SK / KKR Korea renewables platform",
      date: issueDate,
      sourceUrl: "https://example.test/sk-kkr",
    };
    expect(() => assertWeeklyProposalIdentitySnapshot(
      weekly,
      stableWeeklyProposalLegacyId(weekly),
      null,
      [{
        legacyId: "another-proposal-id",
        target: weekly.target,
        date: issueDate,
        sourceUrls: [weekly.sourceUrl],
        status: "DRAFT",
        updatedAt: "2026-07-03T23:30:00.000Z",
      }],
    )).toThrow("appeared after planning");
  });
});
