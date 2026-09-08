import { readHistoricalAuditFileSync as readFileSync } from "../portco-completion/historical-fixtures";
import { describe, expect, it } from "vitest";
import { verifyAttributionChain, verifyAttributionDatabaseHistory } from "./attribution-chronology";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";

const directory = "audits/portco-reconciliation/2026-09-06/attribution-chronology";
const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const report = json(`${directory}/chronology.json`);
const snapshot = json(`${directory}/production-snapshot.json`);
const capture = json(`${directory}/capture-verification.json`);
const references: Array<{ sourceFiles: Array<{ path: string; fileSha256: string }> }> = report.receiptReferences;
const chains = references.map((reference) => {
  const [manifest, approval, receipt] = reference.sourceFiles.map((file) => json(file.path));
  return verifyAttributionChain({ manifest, approval, receipt });
});
const input = { chains, pipelines: snapshot.production.pipelines, revisions: snapshot.production.revisions, redirects: snapshot.production.redirects };

describe("receipt-backed attribution chronology (read only)", () => {
  it("verifies all 46 retained/recovered chains and exact frozen dependencies", () => {
    expect(hashWithoutField(report, "reportSha256")).toBe(capture.reportSha256);
    expect(report.reportSha256).toBe("0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac");
    expect(sha256Canonical(snapshot.production)).toBe(report.productionSnapshotSha256);
    expect(sha256Canonical({ companies: snapshot.production.companies, redirects: snapshot.production.redirects })).toBe(report.coreStateSha256);
    expect(chains).toHaveLength(46);
    for (const reference of references) for (const file of reference.sourceFiles) expect(sha256Text(readFileSync(file.path, "utf8"))).toBe(file.fileSha256);
    for (const dependency of capture.dependencies) expect(sha256Text(readFileSync(dependency.path, "utf8"))).toBe(dependency.sha256);
    const initial = chains.find((chain) => chain.receipt.pipelineRunId === "cmsxywrmw0000fn6hw9gllg6y")!;
    expect(initial.receipt.receiptSha256).toBe("779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf");
    expect(initial.receipt.rows).toHaveLength(1264);
    const recovery = json(`${directory}/recovered-initial-apply/recovery-provenance.json`);
    expect(recovery.receiptSha256).toBe(initial.receipt.receiptSha256);
    expect(recovery.githubArtifactDigest).toBe(`sha256:${recovery.downloadedArchiveSha256}`);
    expect(recovery.workflowRunId).toBe(32087303941);
  });

  it("reproduces every surviving revision, including 44 relocated company histories", () => {
    const before = sha256Canonical(input);
    const result = verifyAttributionDatabaseHistory(input);
    expect(sha256Canonical(input)).toBe(before);
    expect(result.revisionBindings).toEqual(report.revisionBindings);
    expect(result.revisionBindings).toHaveLength(1199);
    expect(result.revisionBindings.reduce((sum, row) => sum + row.ownershipRows, 0)).toBe(1451);
    const initial = result.revisionBindings.filter((row) => row.pipelineRunId === "cmsxywrmw0000fn6hw9gllg6y");
    expect(initial).toHaveLength(1088);
    expect(initial.flatMap((row) => row.originalCompanies)).toHaveLength(1131);
    expect(initial.flatMap((row) => row.originalCompanies).filter((row) => row.redirects.length)).toHaveLength(44);
    expect(initial.filter((row) => row.originalCompanies.length > 1)).toHaveLength(28);
  });

  it("retains every candidate without treating historical writes as current repair authority", () => {
    const { latest } = verifyAttributionDatabaseHistory(input);
    expect(report.candidates).toHaveLength(277);
    expect(report.candidates.reduce((sum: number, row: { changedFields: unknown[] }) => sum + row.changedFields.length, 0)).toBe(603);
    for (const row of report.candidates) {
      const last = latest.get(row.ownershipPeriodId);
      expect(last?.receipt.receiptSha256 ?? null).toBe(row.latestAttributionReceipt?.receiptSha256 ?? null);
      expect(row.adjudication).toBe("REVIEW_REQUIRED_NO_MUTATION_AUTHORIZED");
      expect(row.canonicalFundMatchesProduction).toBe(true);
      if (last) {
        expect(last.row.after).toEqual(row.latestAttributionReceipt.after);
        expect(sha256Canonical(row.observed) === sha256Canonical(last.row.after)).toBe(row.latestAttributionReceipt.productionMatches);
        for (const field of ["fundAttribution", "attributedFundName", "attributionConfidence", "attributionRationale"] as const) expect(row.observed[field]).toEqual(last.row.after[field]);
      }
    }
    expect(report.counts.ownersWithLatestReceipt).toBe(144);
    expect(report.counts.ownersMatchingLatestReceipt).toBe(121);
    expect(report.counts.ownersMatchingLastSeedWrite).toBe(252);
    expect([report.databaseWrites, report.seedChanges, report.sourceTransitions, report.completionAllowed]).toEqual([0, 0, 0, false]);
  });

  it("rejects missing/duplicate receipt coverage and unbound production runs", () => {
    expect(() => verifyAttributionDatabaseHistory({ ...input, chains: chains.slice(1) })).toThrow(/coverage/);
    expect(() => verifyAttributionDatabaseHistory({ ...input, chains: [...chains, chains[0]] })).toThrow(/coverage/);
    const pipelines = structuredClone(input.pipelines);
    pipelines[0].metadata = { environment: "production" };
    expect(() => verifyAttributionDatabaseHistory({ ...input, pipelines })).toThrow(/Unbound/);
    pipelines[0] = { ...input.pipelines[0], status: "FAILED" };
    expect(() => verifyAttributionDatabaseHistory({ ...input, pipelines })).toThrow(/Unbound/);
  });

  it("rejects tampered immutable artifacts and approvals", () => {
    const changed = structuredClone(chains[0]);
    changed.receipt.rows[0].after.attributedFundName = "Invented fund";
    expect(() => verifyAttributionChain(changed)).toThrow();
    const approval = structuredClone(chains[0].approval);
    approval.approver = "Unapproved actor";
    expect(() => verifyAttributionChain({ ...chains[0], approval })).toThrow();
  });

  it("rejects missing revision rows, duplicated rows, altered payload and incorrect fields", () => {
    const revisionId = report.revisionBindings[0].revisionId;
    expect(() => verifyAttributionDatabaseHistory({ ...input, revisions: input.revisions.filter((row: { id: string }) => row.id !== revisionId) })).toThrow(/coverage/);
    for (const change of ["payload", "duplicate", "fields", "approver"] as const) {
      const revisions = structuredClone(input.revisions);
      const row = revisions.find((row: { id: string }) => row.id === revisionId);
      if (change === "payload") row.afterJson[0].attributedFundName = "Invented fund";
      if (change === "duplicate") row.afterJson.push(row.afterJson[0]);
      if (change === "fields") row.changedFields = [];
      if (change === "approver") row.approver = "Unapproved actor";
      expect(() => verifyAttributionDatabaseHistory({ ...input, revisions })).toThrow(/revision/i);
    }
  });

  it("permits only exact relocation through later canonical redirects", () => {
    const relocated = report.revisionBindings.flatMap((row: { originalCompanies: Array<{ redirects: Array<{ retiredId: string }> }> }) => row.originalCompanies).find((row: { redirects: unknown[] }) => row.redirects.length).redirects[0];
    expect(() => verifyAttributionDatabaseHistory({ ...input, redirects: input.redirects.filter((row: { retiredId: string }) => row.retiredId !== relocated.retiredId) })).toThrow(/coverage|unique/);
    expect(() => verifyAttributionDatabaseHistory({ ...input, redirects: [...input.redirects, input.redirects[0]] })).toThrow(/Duplicate/);
    for (const change of ["cycle", "date", "reason"] as const) {
      const redirects = structuredClone(input.redirects);
      const row = redirects.find((row: { retiredId: string }) => row.retiredId === relocated.retiredId);
      if (change === "cycle") row.companyId = row.retiredId;
      if (change === "date") row.createdAt = "2000-01-01T00:00:00.000Z";
      if (change === "reason") row.reason = "UNVERIFIED_ALIAS";
      expect(() => verifyAttributionDatabaseHistory({ ...input, redirects })).toThrow(/redirect|relocation/i);
    }
  });

  it("allows merged revision row ordering but never drops row multiplicity", () => {
    const revisions = structuredClone(input.revisions);
    const grouped = report.revisionBindings.find((row: { originalCompanies: unknown[] }) => row.originalCompanies.length > 1);
    const row = revisions.find((row: { id: string }) => row.id === grouped.revisionId);
    row.beforeJson.reverse();
    row.afterJson.reverse();
    expect(verifyAttributionDatabaseHistory({ ...input, revisions }).revisionBindings).toEqual(report.revisionBindings);
    row.afterJson.pop();
    expect(() => verifyAttributionDatabaseHistory({ ...input, revisions })).toThrow(/differs/);
  });
});
