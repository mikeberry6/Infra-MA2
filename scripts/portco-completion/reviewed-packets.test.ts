import { describe, expect, it } from "vitest";
import { seal } from "./batch";
import { assertMatchingAuthorityImages, combineReports, normalizeReport, verifyHistoricalTestMigration } from "./reviewed-packets";

const H = "a".repeat(64), source = { primarySourceUrl: "https://example.org/filing", primarySourceSha256: H };
const current = { linkedFundName: null, fundAttribution: "INFERRED", attributedFundName: "Unsupported", attributionConfidence: "LOW", attributionRationale: "Old evidence." };
function row(id: string) { return { companyId: "c1", ownerId: id, recordId: `r-${id}`, current,
  recommendedAttribution: { fundAttribution: "DIRECT_PROGRAM" },
  fieldDecisions: [{ field: "fundAttribution", recommended: "DIRECT_PROGRAM", ...source }] }; }
function report(content: object) { return seal({ productionSnapshotSha256: H, executionManifestSha256: H, ledgerSha256: H, chronologySha256: H, dependencies: [], ...content }, "reportSha256"); }
function pair() {
  const first = report({ rows: [row("o1"), row("o2")] });
  const { ownerId, ...single } = row("o3");
  const second = report({ ...single, ownershipPeriodId: ownerId });
  return { first, second, choice: { companyId: "c1", reportSha256s: [first.reportSha256, second.reportSha256], reason: "Audited disjoint owner packets for the same canonical company." } };
}
describe("shared historical authority packet adapter", () => {
  it("requires identical complete canonical images across packets", () => {
    const image = { id: "c1", owners: [{ id: "o1", stake: "Unknown" }], citations: [source] };
    expect(() => assertMatchingAuthorityImages([image, structuredClone(image)])).not.toThrow();
    expect(() => assertMatchingAuthorityImages([image, { ...image, owners: [] }])).toThrow(/Incompatible/);
    expect(() => assertMatchingAuthorityImages([image, undefined])).toThrow(/Incompatible/);
  });
  it("permits only the exact historical-reader import migration, preserving every assertion", () => {
    const original = 'import { readFileSync } from "node:fs";\nexpect(value).toBe(1);\n';
    const current = 'import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";\nexpect(value).toBe(1);\n';
    expect(() => verifyHistoricalTestMigration(original, current)).not.toThrow();
    expect(() => verifyHistoricalTestMigration(original, current.replace("toBe(1)", "toBe(2)"))).toThrow(/exceeds/);
    expect(() => verifyHistoricalTestMigration(original, current + "// unrelated\n")).toThrow(/exceeds/);
  });
  it("retains all disjoint owners and individual reports across both historical shapes", () => {
    const { first, second, choice } = pair();
    const result = combineReports("c1", [first, second], choice);
    expect(result.map(p => p.report.reportSha256)).toEqual(choice.reportSha256s);
    expect(result.flatMap(p => p.rows.map(r => r.ownerId))).toEqual(["o1", "o2", "o3"]);
    expect(result[1].rows[0].recommended.fundAttribution).toBe("DIRECT_PROGRAM");
  });
  it("requires explicit exact packet membership", () => {
    const { first, second, choice } = pair();
    expect(() => combineReports("c1", [first, second])).toThrow();
    expect(() => combineReports("c1", [first, second], { ...choice, reportSha256s: [H, second.reportSha256] })).toThrow(/membership/);
    expect(() => combineReports("c1", [first], choice)).toThrow(/Unused/);
  });
  it("rejects changed hashes and incompatible source boundaries", () => {
    const { first, second, choice } = pair();
    expect(() => combineReports("c1", [{ ...first, chronologySha256: "b".repeat(64) }, second], choice)).toThrow();
    const changed = report({ ...row("o3"), ownershipPeriodId: "o3", chronologySha256: "b".repeat(64) });
    expect(() => combineReports("c1", [first, changed], { ...choice, reportSha256s: [first.reportSha256, changed.reportSha256] })).toThrow(/Incompatible/);
  });
  it("rejects overlapping owners and seed records instead of silently deduplicating", () => {
    const first = report({ rows: [row("o1")] });
    for (const duplicate of [row("o1"), { ...row("o2"), recordId: "r-o1" }]) {
      const second = report({ rows: [duplicate], extra: "distinct packet" });
      expect(() => combineReports("c1", [first, second], { companyId: "c1", reportSha256s: [first.reportSha256, second.reportSha256], reason: "Attempt to combine conflicting authority packets." })).toThrow(/Overlapping/);
    }
  });
  it("rejects duplicate reports and wrong companies", () => {
    const { first, choice } = pair();
    expect(() => combineReports("c1", [first, first], choice)).toThrow(/Duplicate/);
    expect(() => normalizeReport(first, "other")).toThrow(/missing/);
  });
  it("rejects contradictory aliases, field recommendations and unsupported changes", () => {
    expect(() => normalizeReport(report({ rows: [{ ...row("o1"), recommended: { fundAttribution: "UNRESOLVED" } }] }), "c1")).toThrow(/aliases/);
    expect(() => normalizeReport(report({ rows: [{ ...row("o1"), fieldDecisions: [{ field: "fundAttribution", recommended: "UNRESOLVED" }] }] }), "c1")).toThrow(/field recommendation/);
    expect(() => normalizeReport(report({ rows: [{ ...row("o1"), fieldDecisions: [{ field: "stake", recommended: "100%" }] }] }), "c1")).toThrow(/Unsupported/);
  });
  it("preserves no-op values and explicit nulls without wording harmonization", () => {
    const r = row("o1");
    const result = normalizeReport(report({ rows: [{ ...r, recommendedAttribution: {}, fieldDecisions: [
      { field: "attributionRationale", productionValue: current.attributionRationale, ...source },
      { field: "fundName", recommended: null, ...source }] }] }), "c1");
    expect(result.rows[0].recommended).toEqual({ attributionRationale: current.attributionRationale, linkedFundName: null });
  });
});
