import { describe, expect, it } from "vitest";
import { evaluateAdditionSizeGate } from "./addition-size-gate";
import { buildLineageRelease } from "./promote-lineage-additions";
import {
  canonicalManagerKey,
  normalizeIdentity,
  validateFundEvidenceManifest,
  validateFundRefreshCandidate,
} from "../fund-refresh/lib";

const INCLUDED_IDS = [
  "FUND-151",
  "FUND-152",
  "FUND-153",
  "FUND-154",
  "FUND-155",
  "FUND-159",
  "FUND-160",
  "FUND-161",
  "FUND-164",
  "FUND-165",
  "FUND-166",
  "FUND-167",
  "FUND-169",
  "FUND-170",
  "FUND-171",
];

describe("same-lineage fund additions", () => {
  it("materializes exactly 15 additions into a 194-fund manifest", () => {
    const release = buildLineageRelease();
    expect(release.baselineManifest.funds).toHaveLength(179);
    expect(release.candidates.map((candidate) => candidate.identity.legacyId))
      .toEqual(INCLUDED_IDS);
    expect(release.manifest.funds).toHaveLength(194);
    expect(release.candidates.every((candidate) => candidate.action === "CREATE"))
      .toBe(true);
  });

  it("keeps all managers inside the reviewed baseline universe", () => {
    const release = buildLineageRelease();
    const baselineManagers = new Set(
      release.baselineManifest.funds.map((fund) =>
        canonicalManagerKey(fund.managerName)
      ),
    );
    for (const candidate of release.candidates) {
      expect(baselineManagers.has(canonicalManagerKey(candidate.identity.managerName)))
        .toBe(true);
    }
  });

  it("keeps every addition at or above the approximately $1B evidence gate", () => {
    const release = buildLineageRelease();
    for (const candidate of release.candidates) {
      expect(evaluateAdditionSizeGate(candidate.after!, 1000).eligible).toBe(true);
    }
  });

  it("passes the candidate and evidence-manifest contracts", () => {
    const release = buildLineageRelease();
    for (const candidate of release.candidates) {
      const result = validateFundRefreshCandidate(candidate);
      expect(result.zodIssues).toBeUndefined();
      expect(result.issues.filter((issue) => issue.severity === "error"))
        .toEqual([]);
    }
    expect(
      validateFundEvidenceManifest(release.evidenceManifest)
        .filter((issue) => issue.severity === "error"),
    ).toEqual([]);
  });

  it("contains no duplicate manager/fund identity", () => {
    const release = buildLineageRelease();
    const keys = release.manifest.funds.map((fund) =>
      `${canonicalManagerKey(fund.managerName)}\u0000${normalizeIdentity(fund.fundName)}`
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("locks the corrected material draft facts", () => {
    const release = buildLineageRelease();
    const byId = new Map(release.candidates.map((candidate) => [
      candidate.identity.legacyId,
      candidate.after!,
    ]));
    expect(byId.get("FUND-166")).toMatchObject({
      size: "$8.3B final close",
      sizeUsdMm: 8300,
      vintage: "2020",
    });
    expect(byId.get("FUND-169")).toMatchObject({
      sizeUsdMm: 1000,
      sizeBasis: "COMMITMENTS",
      vintage: "2024",
    });
    expect(byId.get("FUND-171")).toMatchObject({
      strategies: ["Value-Add"],
      vintage: "2020",
    });
    expect(byId.get("FUND-164")).toMatchObject({
      sizeNativeCurrency: "EUR",
      sizeNativeAmount: "2000000000",
      sizeBasis: "FINAL_CLOSE",
    });
  });
});
