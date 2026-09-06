/** Source authority only: deliberately emits no database/seed apply manifest. */
import { createHash } from "node:crypto";
import { verifyProposal, verifyApproval, verifyApplyReceipt } from "./artifacts";
import { verifyPortCoBatchManifest, verifyPortCoBatchReceipt } from "./batch-artifacts";
import { semanticCompanyImageSha256 } from "./apply-plan";
import { companyImageSchema } from "./schema";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { verifySeedAttributionReconciliationSpec } from "../portfolio-fund-attribution/reconcile-seed-manifest";
import { verifyAttributionChain } from "./attribution-chronology";

export const COASTAL_COMPANY = "cmrxpj4e100geivhe4lo6qn4w";
export const COASTAL_PROPOSAL = "d69e8a4768fb3cd51eb75527f6ff3e8d4b89404ff72d7cbff1d63db3f9f42c5d";
export const COASTAL_GROUP = [
  { manager: "AIMCo", ownerId: "cmrxpjpim01czivhefcuxtvf5", recordId: "OFA-F0034321F571", fundId: "cmrxpj0r500ayivhejf0kb254", sourceId: "tc-2019" },
  { manager: "KKR", ownerId: "cmrxpk5ra022nivhet9onm4fd", recordId: "OFA-4AF1DB01D0E6", fundId: "cmrxpj2yp00ecivheouv7ybld", sourceId: "osler" },
  { manager: "TC Energy Corporation", ownerId: "cmtikbaz3000j2u2b7ydjkmui", recordId: "OFA-E2644BC3A92F", fundId: null, sourceId: "tc-operations" },
] as const;
export const COASTAL_SOURCES = [
  { id: "tc-2019", file: "tc-2019.html", url: "https://www.tcenergy.com/announcements/2019/2019-12-26tc-energy-announces-the-partial-monetization-of-the-coastal-gaslink-pipeline-project/", sha256: "6b9866d5ef831e113a4ede940b36f7700b5f325ea0effe64667fdf7e3b7762a9" },
  { id: "osler", file: "osler.html", url: "https://www.osler.com/en/about-us/representative-work/kkr-2/", sha256: "e6abfb5a1a081a39c646c89540a1e1c11c237fb36d790fdcc046a46d6b68db4b" },
  { id: "tc-operations", file: "tc-operations.html", url: "https://www.tcenergy.com/operations/natural-gas/coastal-gaslink/", sha256: "943413af4699ba43a2092bb90dbe66d9235d7fc22a2ea33b899764aec77a5b8c" },
  { id: "tc-q2-2020", file: "tc-q2-2020.pdf", url: "https://www.tcenergy.com/siteassets/pdfs/investors/reports-and-filings/annual-and-quarterly-reports/2020/tc-2020-q2-quarterly-report.pdf", sha256: "1fa29b1961ef536c3aa8d1210e20753ff65563ec713b71cf852d5688efc79184" },
] as const;
interface State { linkedFundName: string | null; fundAttribution: string; attributedFundName: string | null; attributionConfidence: string | null; attributionRationale: string | null }
interface Candidate { companyId: string; ownershipPeriodId: string; recordId: string; proposalSha256: string; observed: State; diagnosticSeedExpectation: State; seedRecord: unknown; changedFields: string[]; seedWrite: { specSha256: string; currentRecordMatches: boolean } | null; latestAttributionReceipt: unknown }
export interface CoastalInput {
  chronology: Record<string, unknown> & { reportSha256: string; candidates: Candidate[] };
  priorAuthority: Record<string, unknown> & { reportSha256: string; candidateFieldsAdjudicated: number; remainingCandidateFields: number };
  seed: unknown; seedSpec: unknown; proposal: unknown; approval: unknown; batch: unknown; batchReceipt: unknown;
  attribution: { manifest: unknown; approval: unknown; receipt: unknown };
  research: { taskIndex: number; result: { ownershipResolution: { currentOwners: Array<{ manager: string; fund: string; vehicle: string }> } } };
  sources: Array<{ id: string; bytes: Uint8Array }>; filingText: string;
  production: { image: unknown; owners: Array<{ id: string; companyId: string; fundId: string | null; isActive: boolean; fundAttribution: string; attributedFundName: string | null; attributionConfidence: string | null; attributionRationale: string | null }>; funds: Array<{ id: string; fundName: string; status: string; manager: { name: string } }> };
}
const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);
const combined = "Part of combined 65% KKR/AIMCo interest; individual split not publicly disclosed";

export function proveCoastalFieldAuthority(input: CoastalInput) {
  if (input.chronology.reportSha256 !== "0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
    || hashWithoutField(input.chronology, "reportSha256") !== input.chronology.reportSha256) throw new Error("Frozen chronology changed");
  if (input.priorAuthority.reportSha256 !== "31d13f51c2bfc1450abba8345a692feb9a30e9717b52b9700e78ade0dce6b8ee"
    || hashWithoutField(input.priorAuthority, "reportSha256") !== input.priorAuthority.reportSha256
    || input.priorAuthority.candidateFieldsAdjudicated !== 6 || input.priorAuthority.remainingCandidateFields !== 597) throw new Error("Prior field authority changed");
  if (input.chronology.candidates.length !== 277 || input.chronology.candidates.reduce((n, c) => n + c.changedFields.length, 0) !== 603) throw new Error("Candidate scope changed");
  if (input.sources.length !== 4 || sha256Text(input.filingText) !== "cf23017c802f94c629c323b5413516aee6d772e8a4cba85592cbb704b04f81c0") throw new Error("Reviewed source scope changed");
  for (const source of COASTAL_SOURCES) {
    const matches = input.sources.filter(row => row.id === source.id);
    if (matches.length !== 1 || createHash("sha256").update(matches[0].bytes).digest("hex") !== source.sha256) throw new Error("Reviewed source bytes changed");
  }
  const kkrResearch = input.research.result.ownershipResolution.currentOwners.filter(row => row.manager === "KKR");
  if (input.research.taskIndex !== 321 || kkrResearch.length !== 1 || kkrResearch[0].fund !== "Separately managed infrastructure account"
    || kkrResearch[0].vehicle !== "KKR-Keats Pipeline Investors II (Canada) Ltd.") throw new Error("Existing research SMA/vehicle disclosure changed");
  const seed = verifySeedManifest(input.seed), spec = verifySeedAttributionReconciliationSpec(input.seedSpec);
  if (seed.manifestSha256 !== "cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
    || spec.specSha256 !== "47f7a480fc40e531460d95e8b5bfb4478e117521b88b31b7a0b1cabec0981ee1") throw new Error("Seed authority lineage changed");
  const proposal = verifyProposal(input.proposal), approval = verifyApproval(input.approval, proposal), batch = verifyPortCoBatchManifest(input.batch);
  const batchReceipt = verifyPortCoBatchReceipt(input.batchReceipt, batch), member = batchReceipt.members[2];
  if (proposal.proposalSha256 !== COASTAL_PROPOSAL || proposal.taskIndex !== 321 || !proposal.afterImage || proposal.afterImage.id !== COASTAL_COMPANY
    || approval.approvalSha256 !== "a6d8f62914c2418d3ddb60934a6a4f7df89059ad1934cbfffc512335e37f158e"
    || spec.batchSha256 !== batch.batchSha256 || batch.batchId !== "batch-0319-0323-v1" || member.kind !== "MUTATION" || member.taskIndex !== 321) throw new Error("Canonical batch binding changed");
  const receipt = verifyApplyReceipt(member.receipt, proposal, approval);
  if (receipt.receiptSha256 !== "cbf0f700c28fbbf3bfd18e4e7a3450a1856c562705106668aa4f287601e79810") throw new Error("Canonical receipt changed");
  const chain = verifyAttributionChain(input.attribution);
  if (chain.receipt.receiptSha256 !== "779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf") throw new Error("Original attribution receipt changed");
  const image = companyImageSchema.parse(input.production.image);
  if (image.id !== COASTAL_COMPANY || image.name !== "Coastal GasLink Pipeline" || image.country !== "Canada"
    || semanticCompanyImageSha256(image) !== semanticCompanyImageSha256(proposal.afterImage)
    || input.production.owners.length !== 3 || image.ownershipPeriods.length !== 3 || input.production.funds.length !== 2) throw new Error("Full canonical company or scope changed");
  const desired: State[] = [
    { linkedFundName: null, fundAttribution: "UNRESOLVED", attributedFundName: null, attributionConfidence: null,
      attributionRationale: "TC Energy identifies AIMCo acting for certain clients within the combined 65% KKR/AIMCo interest. The exact AIMCo fund, holding subsidiary and individual share are not disclosed in the reviewed sources; no curated fund is inferred." },
    { linkedFundName: null, fundAttribution: "DIRECT_PROGRAM", attributedFundName: null, attributionConfidence: null,
      attributionRationale: "Transaction counsel identifies a KKR-managed infrastructure separate account in partnership with Korea's National Pension Service. TC Energy's closing filing names KKR-Keats Pipeline Investors II (Canada) Ltd. This supports an SMA/program classification, not K-INFRA; the individual share within the combined 65% remains undisclosed." },
    { linkedFundName: null, fundAttribution: "DIRECT_PROGRAM", attributedFundName: null, attributionConfidence: null,
      attributionRationale: "TC Energy identifies its retained 35% interest in Coastal GasLink Pipeline Limited Partnership. This is a corporate investment, not a managed-fund attribution; the exact holding affiliate is not established by these disclosures." },
  ];
  const rows = COASTAL_GROUP.map((group, index) => {
    const candidates = input.chronology.candidates.filter(c => c.ownershipPeriodId === group.ownerId);
    const owners = input.production.owners.filter(o => o.id === group.ownerId);
    const canonical = image.ownershipPeriods.filter(o => o.id === group.ownerId);
    const records = seed.records.filter(r => r.recordId === group.recordId), upserts = spec.upsertRecords.filter(r => r.recordId === group.recordId);
    if (candidates.length !== 1 || owners.length !== 1 || canonical.length !== 1 || records.length !== 1 || upserts.length !== 1) throw new Error("Non-unique owner/seed binding");
    const candidate = candidates[0], owner = owners[0], core = canonical[0], record = records[0];
    const fund = input.production.funds.find(f => f.id === group.fundId);
    if (candidate.companyId !== COASTAL_COMPANY || candidate.recordId !== group.recordId || candidate.proposalSha256 !== COASTAL_PROPOSAL
      || owner.companyId !== COASTAL_COMPANY || owner.fundId !== group.fundId || !owner.isActive || !core.isActive || core.managerName !== group.manager
      || core.transactionState !== "CLOSED_ACTIVE" || core.stake !== (index === 2 ? "35%" : combined) || core.investmentYear !== (index === 2 ? 2012 : 2020)
      || !same(record, candidate.seedRecord) || !same(record, upserts[0]) || candidate.seedWrite?.specSha256 !== spec.specSha256 || !candidate.seedWrite.currentRecordMatches
      || record.investmentFirm !== group.manager || record.currentVehicleName !== core.vehicleName || record.stake !== core.stake || record.investmentYear !== core.investmentYear
      || (group.fundId !== null && (!fund || fund.status !== "PUBLISHED" || fund.manager.name !== group.manager || fund.fundName !== core.fundName))) throw new Error("Owner, fund or active-only seed identity changed");
    const observed: State = { linkedFundName: fund?.fundName ?? null, fundAttribution: owner.fundAttribution, attributedFundName: owner.attributedFundName,
      attributionConfidence: owner.attributionConfidence, attributionRationale: owner.attributionRationale };
    const fields = index === 2 ? ["attributionRationale", "fundAttribution"] : ["attributedFundName", "attributionConfidence", "attributionRationale", "fundAttribution", "fundName"];
    if (!same(observed, candidate.observed) || !same(fields, candidate.changedFields)) throw new Error("Metadata/candidate drift");
    const original = chain.receipt.rows.filter(r => r.ownershipPeriodId === group.ownerId);
    if (index < 2 && (original.length !== 1 || original[0].companyId !== COASTAL_COMPANY || !same(original[0].after, observed))) throw new Error("Original metadata provenance changed");
    if (index === 2 && (original.length !== 0 || candidate.latestAttributionReceipt !== null || core.fundName !== null)) throw new Error("New TC owner lineage changed");
    const primary = COASTAL_SOURCES.find(source => source.id === group.sourceId)!;
    return { ...group, companyId: COASTAL_COMPANY, candidateSha256: sha256Canonical(candidate), current: observed, seedExpectation: candidate.diagnosticSeedExpectation,
      recommendedAttribution: desired[index], fieldDecisions: fields.map(field => {
        const key = field === "fundName" ? "linkedFundName" : field as keyof State;
        return { field, disposition: "SOURCE_SUPPORTED_CORRECTION_REQUIRED_NOT_AUTHORIZED_BY_THIS_REPORT", current: observed[key], seed: candidate.diagnosticSeedExpectation[key], recommended: desired[index][key],
          primarySourceUrl: primary.url, primarySourceSha256: primary.sha256, productionWriteRequired: observed[key] !== desired[index][key] };
      }),
      preserves: { stake: core.stake, vehicleName: core.vehicleName, investmentYear: core.investmentYear, transactionState: core.transactionState },
      seedMatchesRecommendedAttribution: same(candidate.diagnosticSeedExpectation, desired[index]), wholeCompanyReconciled: false };
  });
  return { schemaVersion: 1, artifactType: "PORTCO_COASTAL_FIELD_AUTHORITY", chronologySha256: input.chronology.reportSha256, priorAuthoritySha256: input.priorAuthority.reportSha256,
    seedManifestSha256: seed.manifestSha256, seedSpecSha256: spec.specSha256, canonicalProposalSha256: proposal.proposalSha256, canonicalApprovalSha256: approval.approvalSha256,
    canonicalReceiptSha256: receipt.receiptSha256, batchReceiptSha256: batchReceipt.receiptSha256, originalAttributionReceiptSha256: chain.receipt.receiptSha256,
    semanticCompanySha256: semanticCompanyImageSha256(image), candidateFieldsAdjudicated: 12, cumulativeCandidateFieldsAdjudicated: 18, remainingCandidateFields: 585,
    interpretation: "AIMCo's named client mandate does not establish the inferred curated fund. KKR's explicitly disclosed SMA is a direct/program investment under the existing classification contract, not K-INFRA and not the seed's blanket unresolved characterization. TC's retained corporate interest supports direct/program. One primary source per owner; the filing separately corroborates closing and vehicle. Unknown individual shares and the canonical pending Indigenous option are unchanged.",
    vehicleFollowup: { outsideOriginal603: true, ownershipPeriodId: COASTAL_GROUP[1].ownerId, currentVehicleName: "n.a.", disclosedClosingVehicle: "KKR-Keats Pipeline Investors II (Canada) Ltd.",
      disposition: "SEPARATE_CANONICAL_PERSISTENCE_REVIEW_REQUIRED_NO_CHANGE_AUTHORIZED", sourceUrl: COASTAL_SOURCES[3].url, sourceSha256: COASTAL_SOURCES[3].sha256, oneBasedPage: 35,
      qualification: "Existing accepted research already contains this filing-supported closing vehicle; its later canonical proposal retained n.a. Do not silently change owner identity, organization or vehicle through an attribution-only apply. No current legal-entity continuity beyond the existing research cutoff is claimed." },
    rows, databaseWrites: 0, seedChanges: 0, sourceTransitions: 0, applyAuthorized: false, completionAllowed: false };
}
