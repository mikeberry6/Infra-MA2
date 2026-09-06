/** Exact five-owner source authority; deliberately emits no apply manifest. */
import { createHash } from "node:crypto";
import { verifyProposal, verifyApproval, verifyApplyReceipt } from "./artifacts";
import { semanticCompanyImageSha256 } from "./apply-plan";
import { companyImageSchema } from "./schema";
import { hashWithoutField, sha256Canonical } from "./hash";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { verifyAttributionChain } from "./attribution-chronology";
import type { CoastalInput } from "./coastal-field-authority";

export const DATABANK_COMPANY = "cmrxpj7kw00kzivhenjb9mu5y";
export const DATABANK_PROPOSAL = "620469277d740d5970323532ca551d5f88e00b4b7cc27755fc41f86cc5f664f5";
const consortium = "Member of the 35% 2022 consortium; individual percentage not publicly disclosed";
const allFields = ["attributedFundName", "attributionConfidence", "attributionRationale", "fundAttribution", "fundName"];
export const DATABANK_GROUP = [
  { manager: "AustralianSuper", ownerId: "cmrxpjslx01hxivhery0xa53f", recordId: "OFA-03DCA6090529", originalRecordId: "OFA-B4BF8FD25402", fundId: "cmrxpj18k00bpivheqkog9qdz", sourceId: "australiansuper", year: 2024, stake: "Significant minority interest; exact percentage not publicly disclosed", fallback: "AustralianSuper Infrastructure Portfolio", fields: ["attributionConfidence", "attributionRationale"] },
  { manager: "DigitalBridge", ownerId: "cmrxpjsmy01hzivhez2e7jdnj", recordId: "OFA-B83EF29EAE12", originalRecordId: "OFA-15478CED86A0", fundId: "cmsdi3ze7004n7h4sajm63o16", sourceId: "digitalbridge", year: 2016, stake: "7.8% after the January 2025 secondary", fallback: "DigitalBridge Partners, LP", fields: ["attributionConfidence", "attributionRationale", "fundAttribution"] },
  { manager: "Northleaf Capital Partners", ownerId: "cmsydgkjw000ib46h70jf5jhl", recordId: "OFA-8CBE74D0871F", originalRecordId: null, fundId: null, sourceId: "recap-2022", year: 2022, stake: consortium, fallback: "Northleaf Capital Partners", fields: allFields },
  { manager: "Ardian", ownerId: "cmsydgkmw000jb46hyotidjx9", recordId: "OFA-07E4341A4708", originalRecordId: null, fundId: null, sourceId: "recap-2022", year: 2022, stake: consortium, fallback: "Ardian", fields: allFields },
  { manager: "CBRE Investment Management", ownerId: "cmsydgkpw000kb46hpgan1qz3", recordId: "OFA-DA47514092BE", originalRecordId: null, fundId: null, sourceId: "investors", year: null, stake: "Exact entry date, vehicle and percentage not publicly disclosed", fallback: "CBRE Investment Management", fields: allFields },
] as const;
export const DATABANK_SOURCES = [
  { id: "investors", file: "investors.html", url: "https://www.databank.com/about-databank/our-investors/", sha256: "e169acc39e0a236b59d97cfe5cebc4ff8fc817308053f5cbd114cd9affaa9004" },
  { id: "recap-2022", file: "recap-2022.html", url: "https://www.databank.com/resources/press-releases/databank-completes-first-phase-of-major-recapitalization/", sha256: "dc0dc270169029e44b66f2f58e4eaa993b2135fe45ba5887058b848c34fa25b2" },
  { id: "australiansuper", file: "australiansuper.html", url: "https://www.databank.com/resources/press-releases/databank-announces-2-0-billion-equity-raise-led-by-1-5-billion-investment-from-australiansuper/", sha256: "d3270a134090148e164613015eae27ab95d93da166faec8cc91e45a09f289c4e" },
  { id: "digitalbridge", file: "digitalbridge.html", url: "https://ir.digitalbridge.com/news-releases/news-release-details/digitalbridge-announces-participation-databank-financing", sha256: "090118578c2c40fc5b10c1a0d4740b3150a6e32a8e3757293abafb1d5bb90e37" },
] as const;
type State = { linkedFundName: string | null; fundAttribution: string; attributedFundName: string | null; attributionConfidence: string | null; attributionRationale: string | null };
type MetadataOwner = CoastalInput["production"]["owners"][number];
type Redirect = { retiredId: string; companyId: string; reason: string; createdAt: string };
export interface DatabankInput extends Omit<CoastalInput, "research" | "priorAuthority" | "production" | "seedSpec" | "batch" | "batchReceipt" | "filingText"> {
  priorAuthority: Record<string, unknown> & { reportSha256: string; cumulativeCandidateFieldsAdjudicated: number; remainingCandidateFields: number };
  originalSnapshot: { stateSha256: string; production: { companies: Array<{ id: string; ownershipPeriods: MetadataOwner[] }>; redirects: Redirect[] } };
  production: CoastalInput["production"] & { redirects: Redirect[] };
  research: unknown;
  researchBinding: unknown;
  receipt: unknown;
}
const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);
const metadata = (o: MetadataOwner) => ({ id: o.id, companyId: o.companyId, fundId: o.fundId, isActive: o.isActive,
  fundAttribution: o.fundAttribution, attributedFundName: o.attributedFundName, attributionConfidence: o.attributionConfidence, attributionRationale: o.attributionRationale });

export function proveDatabankFieldAuthority(input: DatabankInput) {
  if (input.chronology.reportSha256 !== "0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
    || hashWithoutField(input.chronology, "reportSha256") !== input.chronology.reportSha256) throw new Error("Frozen chronology changed");
  if (input.priorAuthority.reportSha256 !== "373eba1a4cc378aade9d6ce4d2e4e7c5ecff2b638cefaeedc8f42f6e58d5fc36"
    || hashWithoutField(input.priorAuthority, "reportSha256") !== input.priorAuthority.reportSha256
    || input.priorAuthority.cumulativeCandidateFieldsAdjudicated !== 30 || input.priorAuthority.remainingCandidateFields !== 573) throw new Error("Prior authority changed");
  if (input.chronology.candidates.length !== 277 || input.chronology.candidates.reduce((n, c) => n + c.changedFields.length, 0) !== 603) throw new Error("Candidate scope changed");
  if (input.originalSnapshot.stateSha256 !== "cf46b32ffaa2f00cc3a40f873431c08abcc15c14d0f9922fbc8c2dcbf52eb8cd"
    || sha256Canonical(input.originalSnapshot.production) !== input.originalSnapshot.stateSha256) throw new Error("Original production snapshot changed");
  if (input.sources.length !== 4) throw new Error("Reviewed source scope changed");
  for (const source of DATABANK_SOURCES) {
    const matches = input.sources.filter(row => row.id === source.id);
    if (matches.length !== 1 || createHash("sha256").update(matches[0].bytes).digest("hex") !== source.sha256) throw new Error("Reviewed source bytes changed");
  }
  if (sha256Canonical(input.research) !== "d550de5a0f7f6fbf88a97125e70111d1c114ec6cc9054f56a8c2093f56005354"
    || sha256Canonical(input.researchBinding) !== "bafb132a69ccdba6646ebdfce1da8fd2cf8e38a0d512a2c9a503416d169a9d5d") throw new Error("Complete existing research boundary changed");
  const seed = verifySeedManifest(input.seed);
  if (seed.manifestSha256 !== "cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257") throw new Error("Seed authority lineage changed");
  const proposal = verifyProposal(input.proposal), approval = verifyApproval(input.approval, proposal), receipt = verifyApplyReceipt(input.receipt, proposal, approval);
  if (proposal.proposalSha256 !== DATABANK_PROPOSAL || proposal.taskIndex !== 110 || !proposal.afterImage || proposal.afterImage.id !== DATABANK_COMPANY
    || approval.approvalSha256 !== "8eb8471d6d5f2f63ba925233d256fc8ed701f14d3e20f55d9ed3b45aaa155aa2"
    || receipt.receiptSha256 !== "ab17a84bafdd73520dc3562857a1dc361af4a3d82048553a07b71282d6aab128"
    || proposal.actions.includes("MERGE_COMPANIES") || proposal.retiredCompanyIds.length) throw new Error("Canonical standalone receipt/no-merge binding changed");
  const chain = verifyAttributionChain(input.attribution);
  if (chain.receipt.receiptSha256 !== "779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf") throw new Error("Original attribution receipt changed");
  const image = companyImageSchema.parse(input.production.image);
  const original = input.originalSnapshot.production.companies.filter(c => c.id === DATABANK_COMPANY);
  const oldRedirects = input.originalSnapshot.production.redirects.filter(r => r.companyId === DATABANK_COMPANY || r.retiredId === DATABANK_COMPANY);
  if (image.id !== DATABANK_COMPANY || image.name !== "DataBank" || image.country !== "United States"
    || semanticCompanyImageSha256(image) !== semanticCompanyImageSha256(proposal.afterImage)
    || input.production.owners.length !== 7 || image.ownershipPeriods.length !== 7 || input.production.funds.length !== 2 || original.length !== 1
    || image.pendingOwnershipTransactions.length || oldRedirects.length || input.production.redirects.length
    || !same(input.production.owners.map(metadata).sort((a,b) => a.id.localeCompare(b.id)), original[0].ownershipPeriods.map(metadata).sort((a,b) => a.id.localeCompare(b.id)))) throw new Error("Full canonical seven-owner company/metadata or no-redirect scope changed");
  const originalRows = chain.receipt.rows.filter(r => r.companyId === DATABANK_COMPANY);
  const originalIds = ["cmrxpjslx01hxivhery0xa53f", "cmrxpjsmg01hyivheczn6hwqa", "cmrxpjsmy01hzivhez2e7jdnj", "cmrxpjsnf01i0ivhebiyk4oiw"];
  if (originalRows.length !== 4 || !same(originalRows.map(r => r.ownershipPeriodId).sort(), [...originalIds].sort())) throw new Error("Original four-owner attribution scope changed");
  for (const row of originalRows) {
    const owner = input.production.owners.find(o => o.id === row.ownershipPeriodId)!;
    const fund = input.production.funds.find(f => f.id === owner.fundId);
    const observed = { linkedFundName: fund?.fundName ?? null, fundAttribution: owner.fundAttribution, attributedFundName: owner.attributedFundName,
      attributionConfidence: owner.attributionConfidence, attributionRationale: owner.attributionRationale };
    if (!same(row.after, observed)) throw new Error("Original attribution after-image changed");
  }
  const unlinked = (fundAttribution: string, attributionRationale: string): State => ({ linkedFundName: null, fundAttribution, attributedFundName: null, attributionConfidence: null, attributionRationale });
  const desired: State[] = [
    unlinked("DIRECT_PROGRAM", "DataBank's October 2024 announcement identifies AustralianSuper's retirement-savings investment and global real-assets portfolio. This supports pension-program attribution, not a separately disclosed AustralianSuper Infrastructure Portfolio fund or an inferred legal holding affiliate. The precise significant-minority percentage remains unavailable."),
    unlinked("DIRECT_PROGRAM", "DigitalBridge's January 30, 2025 issuer release explicitly describes its retained 7.8% position as a corporate balance-sheet investment, not DigitalBridge Partners, LP. Its December 2019 balance-sheet entry is distinct from the existing 2016 sponsor-entry year, which is preserved. This attribution review does not establish a new legal holding vehicle or closing date."),
    unlinked("UNRESOLVED", "DataBank's August 30, 2022 closing release identifies Northleaf among the four-manager consortium acquiring a combined 35%. It does not identify Northleaf's underlying fund, holding entity or individual share. Northleaf NEIF is not inferred from a manager match; the precise fund and individual-share exceptions are preserved."),
    unlinked("UNRESOLVED", "DataBank's August 30, 2022 closing release identifies Ardian among the four-manager consortium acquiring a combined 35%. Neither that release nor the investor roster identifies the underlying Ardian fund or its individual share. AAIF V is not inferred from manager, geography or vintage; the precise exceptions remain."),
    unlinked("UNRESOLVED", "DataBank's investor roster identifies CBRE Caledon and describes its fund and separate-account client business, without allocating DataBank to a named fund or account. Preserve the existing CBRE Investment Management association without inferring CBRE GIF, a holding entity, entry year or percentage."),
  ];
  const rows = DATABANK_GROUP.map((group, index) => {
    const candidates = input.chronology.candidates.filter(c => c.ownershipPeriodId === group.ownerId), owners = input.production.owners.filter(o => o.id === group.ownerId);
    const cores = image.ownershipPeriods.filter(o => o.id === group.ownerId), records = seed.records.filter(r => r.recordId === group.recordId);
    if (candidates.length !== 1 || owners.length !== 1 || cores.length !== 1 || records.length !== 1) throw new Error("Non-unique owner/seed binding");
    const candidate = candidates[0], owner = owners[0], core = cores[0], record = records[0], fund = input.production.funds.find(f => f.id === group.fundId);
    if (candidate.companyId !== DATABANK_COMPANY || candidate.recordId !== group.recordId || candidate.proposalSha256 !== DATABANK_PROPOSAL
      || owner.companyId !== DATABANK_COMPANY || owner.fundId !== group.fundId || !owner.isActive || !core.isActive || core.managerName !== group.manager || core.organizationName !== group.manager
      || core.transactionState !== "CLOSED_ACTIVE" || core.stake !== group.stake || core.investmentYear !== group.year || core.vehicleName !== null || core.exitYear !== null
      || !same(record, candidate.seedRecord) || candidate.seedWrite !== null || record.companyName !== image.name || record.country !== image.country
      || record.investmentFirm !== group.manager || record.currentVehicleName !== group.fallback || record.stake !== core.stake || record.investmentYear !== core.investmentYear
      || (group.fundId !== null && (!fund || fund.status !== "PUBLISHED" || fund.manager.name !== group.manager || fund.fundName !== core.fundName))) throw new Error("Owner, fund or active-only seed identity changed");
    const observed: State = { linkedFundName: fund?.fundName ?? null, fundAttribution: owner.fundAttribution, attributedFundName: owner.attributedFundName,
      attributionConfidence: owner.attributionConfidence, attributionRationale: owner.attributionRationale };
    if (!same(observed, candidate.observed) || !same(group.fields, candidate.changedFields)) throw new Error("Metadata/candidate drift");
    const original = originalRows.filter(r => r.ownershipPeriodId === group.ownerId);
    if (index < 2 && (original.length !== 1 || original[0].recordId !== group.originalRecordId || !same(original[0].after, observed)
      || !candidate.latestAttributionReceipt || (candidate.latestAttributionReceipt as { receiptSha256: string }).receiptSha256 !== chain.receipt.receiptSha256)) throw new Error("Original metadata provenance changed");
    if (index >= 2 && (original.length || candidate.latestAttributionReceipt !== null || core.fundName !== null)) throw new Error("New-owner absent attribution lineage changed");
    const primary = DATABANK_SOURCES.find(source => source.id === group.sourceId)!;
    const decision = (field: string, outsideOriginal603: boolean) => {
      const key = field === "fundName" ? "linkedFundName" : field as keyof State;
      return { field, outsideOriginal603, disposition: observed[key] === desired[index][key] ? "RETAIN_CURRENT_SOURCE_SUPPORTED_EXACT_EXCEPTION" : "SOURCE_SUPPORTED_CORRECTION_REQUIRED_NOT_AUTHORIZED_BY_THIS_REPORT",
        current: observed[key], seed: candidate.diagnosticSeedExpectation[key], recommended: desired[index][key],
        primarySourceUrl: primary.url, primarySourceSha256: primary.sha256, productionWriteRequired: observed[key] !== desired[index][key],
        seedPersistenceRequired: candidate.diagnosticSeedExpectation[key] !== desired[index][key] };
    };
    const additional = allFields.filter(field => {
      const key = field === "fundName" ? "linkedFundName" : field as keyof State;
      return !(group.fields as readonly string[]).includes(field) && observed[key] !== desired[index][key];
    });
    return { ...group, companyId: DATABANK_COMPANY, seedWriteBinding: null, candidateSha256: sha256Canonical(candidate), current: observed, seedExpectation: candidate.diagnosticSeedExpectation,
      recommendedAttribution: desired[index], fieldDecisions: group.fields.map(field => decision(field, false)), additionalFieldDecisions: additional.map(field => decision(field, true)),
      preserves: { stake: core.stake, vehicleName: core.vehicleName, investmentYear: core.investmentYear, organizationName: core.organizationName, transactionState: core.transactionState },
      seedMatchesRecommendedAttribution: same(candidate.diagnosticSeedExpectation, desired[index]), wholeCompanyReconciled: false };
  });
  if (rows.reduce((n,r) => n+r.fieldDecisions.length,0) !== 20 || rows.reduce((n,r) => n+r.additionalFieldDecisions.length,0) !== 5) throw new Error("Adjudicated field scope changed");
  return { schemaVersion: 1, artifactType: "PORTCO_DATABANK_FIELD_AUTHORITY", chronologySha256: input.chronology.reportSha256, priorAuthoritySha256: input.priorAuthority.reportSha256,
    seedManifestSha256: seed.manifestSha256, canonicalProposalSha256: proposal.proposalSha256, canonicalApprovalSha256: approval.approvalSha256,
    canonicalReceiptSha256: receipt.receiptSha256, originalAttributionReceiptSha256: chain.receipt.receiptSha256,
    semanticCompanySha256: semanticCompanyImageSha256(image), candidateFieldsAdjudicated: 20, cumulativeCandidateFieldsAdjudicated: 50, remainingCandidateFields: 553, additionalFieldsOutsideOriginal603: 5,
    interpretation: "AustralianSuper's pension program and DigitalBridge's corporate balance-sheet position are not specific managed funds. Northleaf, Ardian and CBRE remain unlinked UNRESOLVED with exact underlying-fund exceptions. Exactly one primary source per owner; no manager/vintage matching inference or allocation of the consortium's combined 35%.",
    qualifications: ["Authority is not persistence or write authorization; all physical comparisons remain unchanged.", "Five equality-blind fields shared unsupported fund attributions in production and seed: AustralianSuper link/name/classification and DigitalBridge link/name. They are additional to, not deductions from, the original 603.", "The October 2024 announcement expected closing by year-end; the January 2025 release expected transaction closing in February. They are not new closing proofs. DigitalBridge's 2019 balance-sheet investment is not substituted for its canonical 2016 sponsor-entry year.", "The investor roster contains dated manager biographies; it does not independently re-adjudicate all September 2026 ownership. All seven canonical periods, Swiss Life's existing GIO III disclosure, IMCO metadata and outside-universe TIAA/EDF/TJC context are preserved, not newly inferred or re-researched.", "Five seed-upsert bindings are absent and remain explicit. Different original/current seed record IDs are bound by exact identities, not a fabricated rekey history. No new fund, legal entity, global alias or economics is introduced."],
    untouchedOwnerIdsPreserved: ["cmrxpjsmg01hyivheczn6hwqa", "cmrxpjsnf01i0ivhebiyk4oiw"], rows,
    databaseWrites: 0, seedChanges: 0, sourceTransitions: 0, applyAuthorized: false, completionAllowed: false };
}
