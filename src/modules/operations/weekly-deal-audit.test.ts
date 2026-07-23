import { describe, expect, it } from "vitest";
import {
  weeklyProposalChangedFields,
  type WeeklyProposalAuditState,
} from "./weekly-deal-audit";

function state(
  overrides: Partial<WeeklyProposalAuditState> = {},
): WeeklyProposalAuditState {
  return {
    record: {
      legacyId: "WB-2026-07-18-01",
      title: "Infrastructure proposal",
      status: "DRAFT",
    },
    participants: [{
      organizationName: "Infrastructure Partners",
      role: "BUYER",
      displayName: "Infrastructure Partners",
    }],
    citations: [{
      sourceUrl: "https://example.com/proposal",
      isPrimary: true,
    }],
    ...overrides,
  };
}

describe("weekly proposal audit changed-field summaries", () => {
  it("lists created record and populated relation fields without values", () => {
    const fields = weeklyProposalChangedFields(null, state());

    expect(fields).toEqual([
      "citations",
      "legacyId",
      "participants",
      "status",
      "title",
    ]);
    expect(JSON.stringify(fields)).not.toContain("Infrastructure proposal");
    expect(JSON.stringify(fields)).not.toContain("example.com");
  });

  it("detects exact record, participant, and citation changes", () => {
    const existing = state();
    const proposed = state({
      record: { ...existing.record, title: "Revised proposal" },
      participants: [{
        organizationName: "Infrastructure Partners",
        role: "SELLER",
        displayName: "Infrastructure Partners",
      }],
      citations: [{
        sourceUrl: "https://example.com/revised",
        isPrimary: true,
      }],
    });

    expect(weeklyProposalChangedFields(existing, proposed)).toEqual([
      "citations",
      "participants",
      "title",
    ]);
  });

  it("ignores relation ordering and reports the actual timestamp-only write", () => {
    const existing = state({
      participants: [
        {
          organizationName: "Buyer B",
          role: "BUYER",
          displayName: null,
        },
        {
          organizationName: "Buyer A",
          role: "BUYER",
          displayName: null,
        },
      ],
    });
    const proposed = state({
      participants: [...existing.participants].reverse(),
    });

    expect(weeklyProposalChangedFields(existing, proposed)).toEqual(["updatedAt"]);
  });
});
