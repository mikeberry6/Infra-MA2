/** Read-only authority judgments. This module deliberately emits no apply manifest. */
import { createHash } from "node:crypto";
import { verifyProposal, verifyApproval, verifyApplyReceipt } from "./artifacts";
import { verifyPortCoBatchManifest, verifyPortCoBatchReceipt } from "./batch-artifacts";
import { semanticCompanyImageSha256 } from "./apply-plan";
import { companyImageSchema } from "./schema";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { verifySeedAttributionReconciliationSpec } from "../portfolio-fund-attribution/reconcile-seed-manifest";
import { verifyAttributionChain } from "./attribution-chronology";
import type { CoastalInput } from "./coastal-field-authority";

export const PUGET_COMPANY = "cmrxpj4fp00ghivhebe9bfh5k";
export const PUGET_PROPOSAL = "c579f09caa89779cb49d9aecada0638377ed8aab7d30989af7357ce54d604036";
export const PUGET_GROUP = [
  { manager: "AIMCo", organization: "AIMCo", ownerId: "cmrxpjpk701d2ivhenespe9dw", recordId: "OFA-D35FDD5B1C59", fundId: "cmrxpj0r500ayivhejf0kb254", sourceId: "aimco", year: 2009, stake: "13.6% current; 7.6% before the April 2019 increase", vehicle: null, fallback: "AIMCo Direct Infrastructure Investment", fields: ["attributionRationale"] },
  { manager: "BCI", organization: "BCI", ownerId: "cmrxpjpks01d3ivhe9nm9wwth", recordId: "OFA-B32ACD1095C3", fundId: "cmrxpj1av00btivhe22q21yhy", sourceId: "bci-program", year: 2009, stake: "20.9% current; 16.9% before the April 2019 increase", vehicle: null, fallback: "Infrastructure & Renewable Resources", fields: ["attributionRationale"] },
  { manager: "Macquarie Asset Management", organization: "Macquarie Asset Management", ownerId: "cmrxpk6fp023pivhewnh4gzo7", recordId: "OFA-B38829EB9593", fundId: null, sourceId: "macquarie", year: 2022, stake: "15.8%", vehicle: "Macquarie Washington Clean Energy Investment, L.P. (Macquarie Global Infrastructure Fund)", fallback: "Macquarie Washington Clean Energy Investment, L.P. (Macquarie Global Infrastructure Fund)", fields: ["attributedFundName", "attributionRationale"] },
  { manager: "Ontario Teachers' Pension Plan", organization: "Ontario Teachers' Pension Plan", ownerId: "cmrxpk6gd023qivheeomwf03t", recordId: "OFA-0B8B1AE10C1F", fundId: null, sourceId: "otpp", year: 2022, stake: "15.8%", vehicle: null, fallback: "Ontario Teachers' Pension Plan", fields: ["attributionRationale"] },
  { manager: "OMERS Infrastructure", organization: "OMERS", ownerId: "cmrxpk6gr023rivhel4dhkwrw", recordId: "OFA-FA0DF294D006", fundId: "cmrxpj3fm00f1ivhehhc270qc", sourceId: "omers", year: 2019, stake: "23.9%", vehicle: null, fallback: "OMERS Infrastructure", fields: ["attributionConfidence", "attributionRationale", "fundAttribution"] },
  { manager: "PGGM", organization: "PGGM", ownerId: "cmrxpk6id023uivheusj162vx", recordId: "OFA-64641AF45D30", fundId: null, sourceId: "pggm", year: 2019, stake: "10.0%", vehicle: null, fallback: "PGGM", fields: ["attributionRationale"] },
] as const;
export const PUGET_SOURCES = [
  { id: "aimco", file: "aimco.html", url: "https://www.aimco.ca/insights/aimco-increases-stake-in-puget-sound-energy", sha256: "8467fef5a91222eeb398f36b65cbb2a67c23533fd498645e8b31bf935d56755d" },
  { id: "bci", file: "bci.html", url: "https://www.bci.ca/powering-the-pacific-northwest-bcis-strategic-investment-in-puget-sound-energy/", sha256: "cf698abd82e053340efa746f1487ee79b7f19ae5d9cece542bdfb4b6381d774c" },
  { id: "bci-program", file: "bci-program.pdf", url: "https://www.bci.ca/wp-content/uploads/2024/08/IRR-Program-FS-2024_Secured.pdf", sha256: "25c6d351d5642f2f4119cfc04568a0dbeb64016bd33bb97c2d54007c270f7e39" },
  { id: "macquarie", file: "macquarie.html", url: "https://www.macquarie.com/us/en/about/news/2022/macquarie-asset-management-and-ontario-teachers-complete-acquisition-of-stake-in-puget-holdings.html", sha256: "88c8495b622b6a7e436a26ebfc22b2574c06c0f3c53af810464e6935790285ca" },
  { id: "otpp", file: "otpp.html", url: "https://www.otpp.com/en-ca/about-us/news-and-insights/2022/macquarie-asset-management-and-ontario-teachers--complete-acquis/", sha256: "b82f7ba7f42940fbb9f9ab183578efa8c28fbae9b9a48a78d6219f3c9d0d1197" },
  { id: "omers", file: "omers.html", url: "https://www.omers.com/news/omers-infrastructure-announces-investment-in-puget-sound-energy", sha256: "ec776c2f1f111abbd91d2db7b7a4864cbd15bae92d4127604ec3c9a49b295d9f" },
  { id: "pggm", file: "pggm.html", url: "https://pggm.nl/en/press/puget-sound-energy-welcomes-new-investment", sha256: "f69a6a92eebb4e2f91a879cd02343eb237f0f78cddc48488f57f5b31b81d8f88" },
] as const;
type State = { linkedFundName: string | null; fundAttribution: string; attributedFundName: string | null; attributionConfidence: string | null; attributionRationale: string | null };
type MetadataOwner = CoastalInput["production"]["owners"][number];
type Redirect = { retiredId: string; companyId: string; reason: string; createdAt: string };
export interface PugetInput extends Omit<CoastalInput, "research" | "priorAuthority" | "production"> {
  priorAuthority: Record<string, unknown> & { reportSha256: string; cumulativeCandidateFieldsAdjudicated: number; remainingCandidateFields: number };
  originalSnapshot: { stateSha256: string; production: { companies: Array<{ id: string; ownershipPeriods: MetadataOwner[] }>; redirects: Redirect[] } };
  production: CoastalInput["production"] & { redirects: Redirect[] };
  research: { taskIndex: number; result: { ownershipResolution: { owners: Array<{ manager: string; fund: string; vehicle: string; isActive: boolean }> } } };
}
const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);
const metadata = (o: MetadataOwner) => ({ id: o.id, companyId: o.companyId, fundId: o.fundId, isActive: o.isActive,
  fundAttribution: o.fundAttribution, attributedFundName: o.attributedFundName, attributionConfidence: o.attributionConfidence, attributionRationale: o.attributionRationale });

export function provePugetFieldAuthority(input: PugetInput) {
  if (input.chronology.reportSha256 !== "0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
    || hashWithoutField(input.chronology, "reportSha256") !== input.chronology.reportSha256) throw new Error("Frozen chronology changed");
  if (input.priorAuthority.reportSha256 !== "54b46da42be290050fecd7c0abacab26b2b718a124f770eb20fc44371b4c6e32"
    || hashWithoutField(input.priorAuthority, "reportSha256") !== input.priorAuthority.reportSha256
    || input.priorAuthority.cumulativeCandidateFieldsAdjudicated !== 18 || input.priorAuthority.remainingCandidateFields !== 585) throw new Error("Prior authority changed");
  if (input.chronology.candidates.length !== 277 || input.chronology.candidates.reduce((n, c) => n + c.changedFields.length, 0) !== 603) throw new Error("Candidate scope changed");
  if (input.originalSnapshot.stateSha256 !== "cf46b32ffaa2f00cc3a40f873431c08abcc15c14d0f9922fbc8c2dcbf52eb8cd"
    || sha256Canonical(input.originalSnapshot.production) !== input.originalSnapshot.stateSha256) throw new Error("Original production snapshot changed");
  if (input.sources.length !== 7 || sha256Text(input.filingText) !== "c84ee17ed2b89eef749deae5b8b69453fd25c7ee85f93db25d4a5eb8f165b129") throw new Error("Reviewed source scope changed");
  for (const source of PUGET_SOURCES) {
    const matches = input.sources.filter(row => row.id === source.id);
    if (matches.length !== 1 || createHash("sha256").update(matches[0].bytes).digest("hex") !== source.sha256) throw new Error("Reviewed source bytes changed");
  }
  const researchers = input.research.result.ownershipResolution.owners;
  if (input.research.taskIndex !== 128 || researchers.length !== 8
    || researchers.find(r => r.manager === "BCI")?.fund !== "Infrastructure & Renewable Resources Program"
    || researchers.find(r => r.manager === "Macquarie Asset Management" && r.isActive)?.fund !== "Macquarie Global Infrastructure Fund"
    || researchers.filter(r => r.isActive && r.vehicle === "NOT_PUBLICLY_DISCLOSED").length !== 5) throw new Error("Existing research boundary changed");
  const seed = verifySeedManifest(input.seed), spec = verifySeedAttributionReconciliationSpec(input.seedSpec);
  if (seed.manifestSha256 !== "cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
    || spec.specSha256 !== "8d3334535f7f81dca230a9104c69a82fe0e299f5978d4bbf2f43a39092d2a67d") throw new Error("Seed authority lineage changed");
  const proposal = verifyProposal(input.proposal), approval = verifyApproval(input.approval, proposal), batch = verifyPortCoBatchManifest(input.batch);
  const batchReceipt = verifyPortCoBatchReceipt(input.batchReceipt, batch), member = batchReceipt.members[2];
  if (proposal.proposalSha256 !== PUGET_PROPOSAL || proposal.taskIndex !== 128 || !proposal.afterImage || proposal.afterImage.id !== PUGET_COMPANY
    || approval.approvalSha256 !== "cfdff69e5a30ec8011584f24c515830c64309a2b7985572714f2a9f556226f9b"
    || spec.batchSha256 !== batch.batchSha256 || batch.batchId !== "batch-0126-0130-v1" || member.kind !== "MUTATION" || member.taskIndex !== 128) throw new Error("Canonical batch binding changed");
  const receipt = verifyApplyReceipt(member.receipt, proposal, approval);
  if (receipt.receiptSha256 !== "038ba0356997af25395a8b9a7158261e2cb7db4378a8bcfa184d10b9db7c3869") throw new Error("Canonical receipt changed");
  const retiredId = "cmrxpjkcr014rivhero16klvt";
  const oldRedirects = input.originalSnapshot.production.redirects.filter(r => r.companyId === PUGET_COMPANY || r.retiredId === PUGET_COMPANY || r.retiredId === retiredId);
  if (!proposal.actions.includes("MERGE_COMPANIES") || !same(proposal.retiredCompanyIds, [retiredId]) || oldRedirects.length !== 1
    || oldRedirects[0].retiredId !== retiredId || oldRedirects[0].companyId !== PUGET_COMPANY || oldRedirects[0].reason !== "CANONICAL_MERGE"
    || !same(input.production.redirects, oldRedirects)) throw new Error("Approved retirement/redirect provenance changed");
  const chain = verifyAttributionChain(input.attribution);
  if (chain.receipt.receiptSha256 !== "779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf") throw new Error("Original attribution receipt changed");
  const image = companyImageSchema.parse(input.production.image);
  const original = input.originalSnapshot.production.companies.filter(c => c.id === PUGET_COMPANY);
  if (image.id !== PUGET_COMPANY || image.name !== "Puget Energy, Inc." || image.country !== "United States"
    || semanticCompanyImageSha256(image) !== semanticCompanyImageSha256(proposal.afterImage)
    || input.production.owners.length !== 8 || image.ownershipPeriods.length !== 8 || input.production.funds.length !== 3 || original.length !== 1
    || !same(input.production.owners.map(metadata).sort((a,b) => a.id.localeCompare(b.id)), original[0].ownershipPeriods.map(metadata).sort((a,b) => a.id.localeCompare(b.id)))) throw new Error("Full canonical company or eight-owner metadata scope changed");
  const direct = (rationale: string): State => ({ linkedFundName: null, fundAttribution: "DIRECT_PROGRAM", attributedFundName: null, attributionConfidence: null, attributionRationale: rationale });
  const desired: State[] = [
    { ...direct("AIMCo's existing investment announcement identifies it acting on behalf of certain clients. The reviewed disclosure does not identify the exact underlying fund or holding entity; a manager-matched curated vehicle is not inferred."), fundAttribution: "UNRESOLVED" },
    direct("BCI's 2024 combined program financial statements report Puget at 20.9% through intermediary holding corporations. Note 1 distinguishes the Infrastructure & Renewable Resources program from its constituent funds and states the combined program is not a legal entity. This supports program attribution, not a disclosed specific fund or inferred constituent fund; the exact Puget holding vehicle remains unestablished."),
    { linkedFundName: null, fundAttribution: "DISCLOSED", attributedFundName: "Macquarie Global Infrastructure Fund", attributionConfidence: null,
      attributionRationale: "Macquarie's February 22, 2022 closing announcement expressly identifies investment via Macquarie Global Infrastructure Fund. It does not name the Washington holding SPV. The existing separately sourced canonical vehicle and 15.8% stake are preserved; this review neither creates nor infers a curated fund link." },
    direct("Ontario Teachers' February 22, 2022 closing announcement identifies the pension plan board as co-buyer and places the investment within its infrastructure portfolio. This supports pension-program attribution; no specific managed fund or legal holding vehicle is established by the reviewed announcement."),
    direct("OMERS' 2018 investment announcement identifies OMERS Infrastructure as the investment manager acting for the OMERS defined-benefit pension plan. This supports pension-program attribution, not a separately disclosed managed fund. The canonical 23.9% stake and 2019 closing year are preserved, not inferred from the announcement's approximate 24%."),
    direct("The Puget announcement hosted by PGGM identifies PGGM's proposed 10% interest and explicitly describes its use of long-term pension capital. This supports pension-program attribution without inferring a specific fund or holding entity. The canonical 2019 closing and 10.0% stake remain unchanged."),
  ];
  const rows = PUGET_GROUP.map((group, index) => {
    const candidates = input.chronology.candidates.filter(c => c.ownershipPeriodId === group.ownerId), owners = input.production.owners.filter(o => o.id === group.ownerId);
    const cores = image.ownershipPeriods.filter(o => o.id === group.ownerId), records = seed.records.filter(r => r.recordId === group.recordId), upserts = spec.upsertRecords.filter(r => r.recordId === group.recordId);
    if (candidates.length !== 1 || owners.length !== 1 || cores.length !== 1 || records.length !== 1 || upserts.length !== 1) throw new Error("Non-unique owner/seed binding");
    const candidate = candidates[0], owner = owners[0], core = cores[0], record = records[0], fund = input.production.funds.find(f => f.id === group.fundId);
    if (candidate.companyId !== PUGET_COMPANY || candidate.recordId !== group.recordId || candidate.proposalSha256 !== PUGET_PROPOSAL
      || owner.companyId !== PUGET_COMPANY || owner.fundId !== group.fundId || !owner.isActive || !core.isActive || core.managerName !== group.manager || core.organizationName !== group.organization
      || core.transactionState !== "CLOSED_ACTIVE" || core.stake !== group.stake || core.investmentYear !== group.year || core.vehicleName !== group.vehicle || core.exitYear !== null
      || !same(record, candidate.seedRecord) || !same(record, upserts[0]) || candidate.seedWrite?.specSha256 !== spec.specSha256 || !candidate.seedWrite.currentRecordMatches
      || record.investmentFirm !== group.organization || record.currentVehicleName !== group.fallback || record.stake !== core.stake || record.investmentYear !== core.investmentYear
      || (group.fundId !== null && (!fund || fund.status !== "PUBLISHED" || fund.manager.name !== group.manager || fund.fundName !== core.fundName))) throw new Error("Owner, fund or active-only seed identity changed");
    const observed: State = { linkedFundName: fund?.fundName ?? null, fundAttribution: owner.fundAttribution, attributedFundName: owner.attributedFundName,
      attributionConfidence: owner.attributionConfidence, attributionRationale: owner.attributionRationale };
    if (!same(observed, candidate.observed) || !same(group.fields, candidate.changedFields)) throw new Error("Metadata/candidate drift");
    const originalRows = chain.receipt.rows.filter(r => r.ownershipPeriodId === group.ownerId);
    const originalRecordIds = ["OFA-30619CCCD06F", "OFA-89EEEA108D30", "OFA-D39A931E35F3", "OFA-D37B39DB8B5E", "OFA-AEEF6AFB0807", "OFA-061F8A64D323"];
    if (originalRows.length !== 1 || originalRows[0].companyId !== (index < 2 ? PUGET_COMPANY : retiredId)
      || originalRows[0].recordId !== originalRecordIds[index] || !same(originalRows[0].after, observed)) throw new Error("Original metadata provenance changed");
    const primary = PUGET_SOURCES.find(source => source.id === group.sourceId)!;
    const decision = (field: string, outsideOriginal603: boolean) => {
      const key = field === "fundName" ? "linkedFundName" : field as keyof State;
      return { field, outsideOriginal603, disposition: "SOURCE_SUPPORTED_CORRECTION_REQUIRED_NOT_AUTHORIZED_BY_THIS_REPORT", current: observed[key], seed: candidate.diagnosticSeedExpectation[key], recommended: desired[index][key],
        primarySourceUrl: primary.url, primarySourceSha256: primary.sha256, productionWriteRequired: observed[key] !== desired[index][key] };
    };
    const additional = ["fundName", "fundAttribution", "attributedFundName", "attributionConfidence", "attributionRationale"].filter(field => {
      const key = field === "fundName" ? "linkedFundName" : field as keyof State;
      return !(group.fields as readonly string[]).includes(field) && observed[key] !== desired[index][key];
    });
    return { ...group, companyId: PUGET_COMPANY, originalAttributionCompanyId: originalRows[0].companyId, originalAttributionRecordId: originalRows[0].recordId,
      candidateSha256: sha256Canonical(candidate), current: observed, seedExpectation: candidate.diagnosticSeedExpectation,
      recommendedAttribution: desired[index], fieldDecisions: group.fields.map(field => decision(field, false)), additionalFieldDecisions: additional.map(field => decision(field, true)),
      preserves: { stake: core.stake, vehicleName: core.vehicleName, investmentYear: core.investmentYear, organizationName: core.organizationName, transactionState: core.transactionState },
      seedMatchesRecommendedAttribution: same(candidate.diagnosticSeedExpectation, desired[index]), wholeCompanyReconciled: false };
  });
  if (rows.reduce((n,r) => n+r.fieldDecisions.length,0) !== 9 || rows.reduce((n,r) => n+r.additionalFieldDecisions.length,0) !== 9) throw new Error("Adjudicated field scope changed");
  return { schemaVersion: 1, artifactType: "PORTCO_PUGET_FIELD_AUTHORITY", chronologySha256: input.chronology.reportSha256, priorAuthoritySha256: input.priorAuthority.reportSha256,
    seedManifestSha256: seed.manifestSha256, seedSpecSha256: spec.specSha256, canonicalProposalSha256: proposal.proposalSha256, canonicalApprovalSha256: approval.approvalSha256,
    canonicalReceiptSha256: receipt.receiptSha256, batchReceiptSha256: batchReceipt.receiptSha256, originalAttributionReceiptSha256: chain.receipt.receiptSha256,
    semanticCompanySha256: semanticCompanyImageSha256(image), candidateFieldsAdjudicated: 9, cumulativeCandidateFieldsAdjudicated: 27, remainingCandidateFields: 576, additionalFieldsOutsideOriginal603: 9,
    interpretation: "BCI expressly distinguishes its combined program from constituent funds and legal entities. OMERS identifies a pension investment manager. Neither supports treating the program/manager name as a disclosed specific fund. AIMCo's clients are not a named fund. MGIF's expanded name is expressly disclosed. OTPP/PGGM pension programs remain unlinked. Exactly one primary source per owner; existing stakes, dates, legal-vehicle unknowns and both historical owners remain unchanged.",
    qualifications: ["Authority is not persistence or write authorization; all physical comparisons remain unchanged.", "The equality-only diagnostic missed nine related fields where seed and production share unsupported attribution. They are tracked separately and do not reduce the original remaining count.", "BCI's December 2024 reporting boundary and September 2025 insight do not newly verify September 2026 ownership. The 2018 announcements are not closing proof. Existing protected source task128 is preserved.", "No Bolsena or other constituent fund is inferred. Seed display fallbacks are not canonical legal vehicles. No fund economics, fund creation or global manager alias is adjudicated."],
    historicalOwnerIdsPreserved: ["cmt5g4mw40011xryyp7vt8jcj", "cmt5g4mz30012xryyfmtirsji"], rows,
    databaseWrites: 0, seedChanges: 0, sourceTransitions: 0, applyAuthorized: false, completionAllowed: false };
}
