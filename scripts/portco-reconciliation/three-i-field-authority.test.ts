import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import { describe, expect, it } from "vitest";
import { proveThreeIFieldAuthority, THREE_I_GROUP, type ThreeIAuthorityInput } from "./three-i-field-authority";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";

const out = "audits/portco-reconciliation/2026-09-06/attribution-field-authority/three-i";
const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const chronology = json("audits/portco-reconciliation/2026-09-06/attribution-chronology/chronology.json");
const report = json(`${out}/authority.json`), snapshot = json(`${out}/production-snapshot.json`);
const execution = json("audits/portco-reconciliation/2026-08-03/execution-v1/manifest.json");
const reference = chronology.receiptReferences.find((row: { pipelineRunId: string }) => row.pipelineRunId === "cmsxywrmw0000fn6hw9gllg6y");
const [manifest, approval, receipt] = reference.sourceFiles.map((file: { path: string }) => json(file.path));
const input: ThreeIAuthorityInput = {
  chronology, production: snapshot.production,
  seed: json("prisma/seed-data/ownership-attributions.manifest.json"),
  seedFund: json("prisma/seed-data/funds.manifest.json").funds.find((fund: { id: string }) => fund.id === "FUND-002"),
  sourcePdf: readFileSync(`${out}/source.pdf`), sourceText: readFileSync(`${out}/source-pages-21-22.txt`, "utf8"),
  attribution: { manifest, approval, receipt },
  proofs: THREE_I_GROUP.map((group) => {
    const task = execution.tasks.find((row: { sequence: number }) => row.sequence === group.sequence);
    return { proposal: json(task.artifacts.proposal.location), approval: json(task.artifacts.approval.location), receipt: json(task.artifacts.applyReceipt.location) };
  }),
};

describe("three 3i companies: field authority, not a write authorization", () => {
  it("binds the reviewed PDF, issuer footnote, source/seed/canonical receipts and exact current production", () => {
    const before = sha256Canonical({ ...input, sourcePdf: [...input.sourcePdf] });
    const result = proveThreeIFieldAuthority(input);
    expect(report.reportSha256).toBe("31d13f51c2bfc1450abba8345a692feb9a30e9717b52b9700e78ade0dce6b8ee");
    expect(hashWithoutField(report, "reportSha256")).toBe(report.reportSha256);
    expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    for (const file of report.dependencies) expect(sha256Text(readFileSync(file.path, "utf8"))).toBe(file.sha256);
    expect(result.rows).toEqual(report.rows);
    expect(result.candidateFieldsAdjudicated).toBe(6);
    expect(result.remainingCandidateFields).toBe(597);
    expect(result.additionalRationaleCorrectionsRequired).toBe(3);
    expect(sha256Canonical({ ...input, sourcePdf: [...input.sourcePdf] })).toBe(before);
  });

  it("does not treat matching stale rationale as resolved or authorize a seed/database write", () => {
    const result = proveThreeIFieldAuthority(input);
    expect([result.databaseWrites, result.seedChanges, result.sourceTransitions, result.applyAuthorized, result.completionAllowed]).toEqual([0, 0, 0, false, false]);
    expect(result.rows.every((row) => !row.wholeCompanyAdjudicationComplete && row.rationaleFollowup.outsideOriginal603)).toBe(true);
    expect(result.rows[2].rationaleFollowup.currentValue).toContain("100%");
    expect(result.rows[2].rationaleFollowup.reason).toContain("Preserve the null stake");
    expect(result.rows.flatMap((row) => row.fieldDecisions).every((field) => !field.productionWriteRequired)).toBe(true);
    expect(result).not.toHaveProperty("mutations");
  });

  it.each(["pdf", "text", "chronology", "seed", "receipt", "approval"] as const)("rejects altered %s authority", (field) => {
    const changed = structuredClone(input);
    if (field === "pdf") changed.sourcePdf[20] ^= 1;
    if (field === "text") changed.sourceText += "Altered source";
    if (field === "chronology") changed.chronology.candidates[0].canonicalFundName = "Invented fund";
    if (field === "seed") (changed.seed as { recordCount: number }).recordCount--;
    if (field === "receipt") (changed.attribution.receipt as { changed: number }).changed++;
    if (field === "approval") (changed.proofs[0].approval as { reviewedBy: string }).reviewedBy = "Different reviewer";
    expect(() => proveThreeIFieldAuthority(changed)).toThrow();
  });

  it.each(["fund", "manager", "owner", "active", "metadata", "scope", "stake"] as const)("rejects changed current %s state", (field) => {
    const changed = structuredClone(input);
    if (field === "fund") changed.production.fund.id = "different-fund";
    if (field === "manager") changed.production.fund.manager.name = "Different manager";
    if (field === "owner") changed.production.owners[0].companyId = "different-company";
    if (field === "active") changed.production.owners[0].isActive = false;
    if (field === "metadata") changed.production.owners[0].attributionRationale = "Different state";
    if (field === "scope") changed.production.owners.push(changed.production.owners[0]);
    if (field === "stake") (changed.production.images[2] as { ownershipPeriods: Array<{ stake: string | null }> }).ownershipPeriods[0].stake = "100%";
    expect(() => proveThreeIFieldAuthority(changed)).toThrow();
  });
});
