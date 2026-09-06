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

export const RIO_GRANDE_COMPANY = "cmrxpjgli00yvivheorrptcgd";
export const RIO_GRANDE_PROPOSAL = "e882f7bce6a6ab08a71eb270bacd169040e9fcb925fc55a5423cf48beb4d4ab3";
export const RIO_GRANDE_GROUP = [
  { manager: "GIC", ownerId: "cmrxpk2dz01xfivhe6czef2co", recordId: "OFA-C2898B1C751B", originalRecordId: "OFA-F0BED24FBDC2", sourceId: "original-filing", fields: ["fundName"] },
  { manager: "GIP", ownerId: "cmrxpk2f101xhivhej18k131a", recordId: "OFA-EB6D1D2A0963", originalRecordId: "OFA-0A00D89C0855", sourceId: "doe", fields: ["attributedFundName", "attributionRationale", "fundName"] },
  { manager: "NextDecade Corporation", ownerId: "cmt5so2hh001z2oyyjxzfgmon", recordId: "OFA-AF6486EE91CB", originalRecordId: "OFA-REPAIR-0151-NEXTDECADE", sourceId: "doe", fields: ["attributionRationale"] },
  { manager: "TotalEnergies", ownerId: "cmt5so2hq00202oyye9cc3m3s", recordId: "OFA-AAB8D1D3AAE8", originalRecordId: "OFA-REPAIR-0151-TOTALENERGIES", sourceId: "total", fields: ["attributionRationale"] },
  { manager: "XRG P.J.S.C.", ownerId: "cmt5so2i300222oyywym8y1a1", recordId: "OFA-A00FE986CC14", originalRecordId: "OFA-REPAIR-0151-XRG", sourceId: "xrg", fields: ["attributionRationale"] },
] as const;
export const RIO_GRANDE_SOURCES = [
  { id: "original-filing", file: "original-filing.pdf", url: "https://www.energy.gov/sites/default/files/2023-08/15-190-LNG_RGLNG%20Statement%20and%20Notice%20of%20Change%20in%20Control%20(Aug.%2016%202023).pdf", sha256: "18019ef4fab630ce934826d580e6ce87a0ae1cc46379f950dd50e0a4e3f2f5ae" },
  { id: "doe", file: "doe.pdf", url: "https://www.energy.gov/sites/default/files/2026-01/Rio%20Grande%20LNG%202026%20CIC%20Response%20Letter%20-%20FINAL.pdf", sha256: "8e4960f150f9c6a47764223dc11a9dd6418d6c6f63b4ca9cb167109da092405e" },
  { id: "total", file: "total.html", url: "https://corporate.totalenergies.us/news/totalenergies-reaches-final-investment-decision-its-partners-rio-grande-lng-train-4-10-direct", sha256: "9f6b67582953e8bdaacbf76a7d73749fcb53afdea6c2d5cee102df072c44593c" },
  { id: "xrg", file: "xrg-browser.txt", url: "https://xrg.com/en/news/XRG-Strengthens-US-LNG-Position-with-Second-Rio-Grande-LNG-Transaction-Completion", sha256: "c5dbc31a86eea697deb5ee5ef52275da6479136737cc22fc1112f44b624f17ae" },
] as const;
type State = { linkedFundName: string | null; fundAttribution: string; attributedFundName: string | null; attributionConfidence: string | null; attributionRationale: string | null };
type MetadataOwner = CoastalInput["production"]["owners"][number];
type Redirect = { retiredId: string; companyId: string; reason: string; createdAt: string };
export interface RioGrandeInput extends Omit<CoastalInput, "research" | "priorAuthority" | "production"> {
  priorAuthority: Record<string, unknown> & { reportSha256: string; cumulativeCandidateFieldsAdjudicated: number; remainingCandidateFields: number };
  originalSnapshot: { stateSha256: string; production: { companies: Array<{ id: string; ownershipPeriods: MetadataOwner[] }>; redirects: Redirect[] } };
  production: CoastalInput["production"] & { redirects: Redirect[] };
  repair: CoastalInput["attribution"];
  originalFilingText: string;
  sourceVerification: unknown;
  research: { taskIndex: number; result: { ownershipResolution: { owners: Array<{ manager: string; fund: string; vehicle: string; isActive: boolean }> } } };
}
const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);
const metadata = (o: MetadataOwner) => ({ id: o.id, companyId: o.companyId, fundId: o.fundId, isActive: o.isActive,
  fundAttribution: o.fundAttribution, attributedFundName: o.attributedFundName, attributionConfidence: o.attributionConfidence, attributionRationale: o.attributionRationale });

export function proveRioGrandeFieldAuthority(input: RioGrandeInput) {
  if (input.chronology.reportSha256 !== "0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
    || hashWithoutField(input.chronology, "reportSha256") !== input.chronology.reportSha256) throw new Error("Frozen chronology changed");
  if (input.priorAuthority.reportSha256 !== "0c9a00866574eb4b2097cbec9d71cfb7286d58316855f615afc8b7b047807009"
    || hashWithoutField(input.priorAuthority, "reportSha256") !== input.priorAuthority.reportSha256
    || input.priorAuthority.cumulativeCandidateFieldsAdjudicated !== 50 || input.priorAuthority.remainingCandidateFields !== 553) throw new Error("Prior authority changed");
  if (input.chronology.candidates.length !== 277 || input.chronology.candidates.reduce((n, c) => n + c.changedFields.length, 0) !== 603) throw new Error("Candidate scope changed");
  if (input.originalSnapshot.stateSha256 !== "cf46b32ffaa2f00cc3a40f873431c08abcc15c14d0f9922fbc8c2dcbf52eb8cd"
    || sha256Canonical(input.originalSnapshot.production) !== input.originalSnapshot.stateSha256) throw new Error("Original production snapshot changed");
  if (input.sources.length !== 4 || sha256Text(input.filingText) !== "c57ba870395b4490d2ec7b934a9fc6a46d6b96a1c9f980949d31b37d40499578") throw new Error("Reviewed source scope changed");
  for (const source of RIO_GRANDE_SOURCES) {
    const matches = input.sources.filter(row => row.id === source.id);
    if (matches.length !== 1 || createHash("sha256").update(matches[0].bytes).digest("hex") !== source.sha256) throw new Error("Reviewed source bytes changed");
  }
  if (sha256Text(input.originalFilingText) !== "aedda57c38ded9fc6445e36db05be1552344cec6a10f911008976dda45f24337"
    || sha256Canonical(input.research) !== "dc354d45b4bd0627bd64d2500d064c776f7d82e9d04861f5f5e8c8251e7d2c99"
    || sha256Canonical(input.sourceVerification) !== "5eeeb40915daf1e2356b324f4b96d94be016cdc752acd83309652af0f4da1eb3") throw new Error("Complete existing research/filing boundary changed");
  const seed = verifySeedManifest(input.seed), spec = verifySeedAttributionReconciliationSpec(input.seedSpec);
  if (seed.manifestSha256 !== "cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
    || spec.specSha256 !== "418335c6c61a6ea47de9c18507eab6b4513e6d273071faf1d970d33c175db42d") throw new Error("Seed authority lineage changed");
  const proposal = verifyProposal(input.proposal), approval = verifyApproval(input.approval, proposal), batch = verifyPortCoBatchManifest(input.batch);
  const batchReceipt = verifyPortCoBatchReceipt(input.batchReceipt, batch), member = batchReceipt.members[4];
  if (proposal.proposalSha256 !== RIO_GRANDE_PROPOSAL || proposal.taskIndex !== 151 || !proposal.afterImage || proposal.afterImage.id !== RIO_GRANDE_COMPANY
    || approval.approvalSha256 !== "9c84586fc442430d977c23f851a4faafcef46be9f3b41f6edeeb3c9c7aafe644"
    || spec.batchSha256 !== batch.batchSha256 || batch.batchId !== "batch-0146-0151-v3" || member.kind !== "MUTATION" || member.taskIndex !== 151) throw new Error("Canonical batch binding changed");
  const receipt = verifyApplyReceipt(member.receipt, proposal, approval);
  if (receipt.receiptSha256 !== "ae355d94f1188d547fb5fd9e731d7731e6cff35d374330cd1006059eb5eb5e78") throw new Error("Canonical receipt changed");
  if (proposal.actions.includes("MERGE_COMPANIES") || proposal.retiredCompanyIds.length) throw new Error("No-merge canonical boundary changed");
  const chain = verifyAttributionChain(input.attribution);
  if (chain.receipt.receiptSha256 !== "779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf") throw new Error("Original attribution receipt changed");
  const repair = verifyAttributionChain(input.repair);
  if (repair.receipt.receiptSha256 !== "b9f52c2b5beda928a14451b1dfecf45630f29393144103ef4a006542749d31e6") throw new Error("Superseding attribution repair changed");
  const image = companyImageSchema.parse(input.production.image);
  const original = input.originalSnapshot.production.companies.filter(c => c.id === RIO_GRANDE_COMPANY);
  if (image.id !== RIO_GRANDE_COMPANY || image.name !== "Rio Grande LNG" || image.country !== "United States"
    || semanticCompanyImageSha256(image) !== semanticCompanyImageSha256(proposal.afterImage)
    || input.production.owners.length !== 6 || image.ownershipPeriods.length !== 6 || input.production.funds.length !== 0 || original.length !== 1 || input.production.redirects.length || image.pendingOwnershipTransactions.length
    || input.originalSnapshot.production.redirects.some(r => r.companyId === RIO_GRANDE_COMPANY || r.retiredId === RIO_GRANDE_COMPANY)
    || !same(input.production.owners.map(metadata).sort((a,b) => a.id.localeCompare(b.id)), original[0].ownershipPeriods.map(metadata).sort((a,b) => a.id.localeCompare(b.id)))) throw new Error("Full canonical company or six-owner metadata scope changed");
  const direct = (rationale: string): State => ({ linkedFundName: null, fundAttribution: "DIRECT_PROGRAM", attributedFundName: null, attributionConfidence: null, attributionRationale: rationale });
  const desired: State[] = [
    direct("The existing 2023 DOE-filed ownership notice identifies Devonshire as GIC's investment holding affiliate and GIC as manager of Singapore's foreign reserves. This supports sovereign-program attribution, not an inferred GIC Infrastructure fund. The separately verified Devonshire vehicle and all exact stake exceptions are preserved."),
    { ...direct("The existing DOE change-in-control response identifies GIP-managed Velocity acquisition and aggregator partnerships, not a separately disclosed underlying infrastructure fund. GIP V is not inferred from the SPV prefix and BlackRock GEPIF III is unsupported by the existing canonical research. Preserve the verified legal vehicles, entry economics and unavailable post-XRG residual interests."), fundAttribution: "UNRESOLVED" },
    direct("NextDecade's retained Rio Grande LNG interests are direct sponsor and corporate project ownership rather than a managed infrastructure-fund investment."),
    direct("TotalEnergies' Rio Grande LNG interests are direct strategic corporate investments held through project affiliates; no managed infrastructure fund is disclosed."),
    direct("XRG's Rio Grande LNG interests are direct strategic corporate investments held through acquisition affiliates; no managed infrastructure fund is disclosed."),
  ];
  const rows = RIO_GRANDE_GROUP.map((group, index) => {
    const candidates = input.chronology.candidates.filter(c => c.ownershipPeriodId === group.ownerId), owners = input.production.owners.filter(o => o.id === group.ownerId);
    const cores = image.ownershipPeriods.filter(o => o.id === group.ownerId), records = seed.records.filter(r => r.recordId === group.recordId), upserts = spec.upsertRecords.filter(r => r.recordId === group.recordId);
    if (candidates.length !== 1 || owners.length !== 1 || cores.length !== 1 || records.length !== 1 || upserts.length !== 1) throw new Error("Non-unique owner/seed binding");
    const candidate = candidates[0], owner = owners[0], core = cores[0], record = records[0];
    if (candidate.companyId !== RIO_GRANDE_COMPANY || candidate.recordId !== group.recordId || candidate.proposalSha256 !== RIO_GRANDE_PROPOSAL
      || owner.companyId !== RIO_GRANDE_COMPANY || owner.fundId !== null || !owner.isActive || !core.isActive || core.managerName !== group.manager || core.organizationName !== group.manager
      || core.transactionState !== "CLOSED_ACTIVE" || core.fundName !== null || core.exitYear !== null
      || !same(record, candidate.seedRecord) || !same(record, upserts[0]) || candidate.seedWrite?.specSha256 !== spec.specSha256 || !candidate.seedWrite.currentRecordMatches
      || record.investmentFirm !== group.manager || record.currentVehicleName !== core.vehicleName || record.stake !== core.stake || record.investmentYear !== core.investmentYear) throw new Error("Owner, fund or active-only seed identity changed");
    const observed: State = { linkedFundName: null, fundAttribution: owner.fundAttribution, attributedFundName: owner.attributedFundName,
      attributionConfidence: owner.attributionConfidence, attributionRationale: owner.attributionRationale };
    if (!same(observed, candidate.observed) || !same(group.fields, candidate.changedFields)) throw new Error("Metadata/candidate drift");
    const sourceChain = index < 2 ? chain : repair;
    const originalRows = sourceChain.receipt.rows.filter(r => r.ownershipPeriodId === group.ownerId);
    const latest = candidate.latestAttributionReceipt as { receiptSha256: string; after: State };
    if (originalRows.length !== 1 || originalRows[0].companyId !== RIO_GRANDE_COMPANY || originalRows[0].recordId !== group.originalRecordId
      || !latest || latest.receiptSha256 !== sourceChain.receipt.receiptSha256 || !same(latest.after, originalRows[0].after)
      || !same({ ...originalRows[0].after, linkedFundName: null }, observed)
      || (index >= 2 && chain.receipt.rows.some(r => r.ownershipPeriodId === group.ownerId))) throw new Error("Original/superseding metadata provenance changed");
    const primary = RIO_GRANDE_SOURCES.find(source => source.id === group.sourceId)!;
    const decision = (field: string, outsideOriginal603: boolean) => {
      const key = field === "fundName" ? "linkedFundName" : field as keyof State;
      return { field, outsideOriginal603, disposition: observed[key] === desired[index][key] ? "RETAIN_CURRENT_SOURCE_SUPPORTED" : "SOURCE_SUPPORTED_CORRECTION_REQUIRED_NOT_AUTHORIZED_BY_THIS_REPORT", current: observed[key], seed: candidate.diagnosticSeedExpectation[key], recommended: desired[index][key],
        primarySourceUrl: primary.url, primarySourceSha256: primary.sha256, productionWriteRequired: observed[key] !== desired[index][key], seedPersistenceRequired: candidate.diagnosticSeedExpectation[key] !== desired[index][key] };
    };
    const additional = ["fundName", "fundAttribution", "attributedFundName", "attributionConfidence", "attributionRationale"].filter(field => {
      const key = field === "fundName" ? "linkedFundName" : field as keyof State;
      return !(group.fields as readonly string[]).includes(field) && observed[key] !== desired[index][key];
    });
    return { ...group, companyId: RIO_GRANDE_COMPANY, originalAttributionCompanyId: originalRows[0].companyId, originalAttributionRecordId: originalRows[0].recordId,
      candidateSha256: sha256Canonical(candidate), current: observed, seedExpectation: candidate.diagnosticSeedExpectation,
      recommendedAttribution: desired[index], fieldDecisions: group.fields.map(field => decision(field, false)), additionalFieldDecisions: additional.map(field => decision(field, true)),
      preserves: { stake: core.stake, vehicleName: core.vehicleName, investmentYear: core.investmentYear, organizationName: core.organizationName, transactionState: core.transactionState },
      seedMatchesRecommendedAttribution: same(candidate.diagnosticSeedExpectation, desired[index]), wholeCompanyReconciled: false };
  });
  if (rows.reduce((n,r) => n+r.fieldDecisions.length,0) !== 7 || rows.reduce((n,r) => n+r.additionalFieldDecisions.length,0) !== 6) throw new Error("Adjudicated field scope changed");
  const mubadalaId = "cmrxpk2ef01xgivhe1pzzw4h7";
  const mubadala = input.production.owners.find(o => o.id === mubadalaId);
  const mubadalaSeed = seed.records.filter(r => r.recordId === "OFA-20166140109D");
  const mubadalaOriginal = chain.receipt.rows.filter(r => r.ownershipPeriodId === mubadalaId);
  if (!mubadala || mubadalaSeed.length !== 1 || mubadalaOriginal.length !== 1 || mubadalaOriginal[0].recordId !== "OFA-08D66635201C"
    || input.chronology.candidates.some(c => c.ownershipPeriodId === mubadalaId) || !same(mubadalaSeed[0], spec.upsertRecords.find(r => r.recordId === mubadalaSeed[0].recordId))) throw new Error("Preserved Mubadala boundary changed");
  const mubadalaObserved: State = { linkedFundName: null, fundAttribution: mubadala.fundAttribution, attributedFundName: mubadala.attributedFundName, attributionConfidence: mubadala.attributionConfidence, attributionRationale: mubadala.attributionRationale };
  if (!same(mubadalaObserved, mubadalaOriginal[0].after) || !same(mubadalaObserved, { linkedFundName: mubadalaSeed[0].targetLinkedFundName, fundAttribution: mubadalaSeed[0].fundAttribution, attributedFundName: mubadalaSeed[0].attributedFundName, attributionConfidence: mubadalaSeed[0].attributionConfidence, attributionRationale: mubadalaSeed[0].attributionRationale })) throw new Error("Preserved equality-blind Mubadala metadata changed");
  return { schemaVersion: 1, artifactType: "PORTCO_RIO_GRANDE_FIELD_AUTHORITY", chronologySha256: input.chronology.reportSha256, priorAuthoritySha256: input.priorAuthority.reportSha256,
    seedManifestSha256: seed.manifestSha256, seedSpecSha256: spec.specSha256, canonicalProposalSha256: proposal.proposalSha256, canonicalApprovalSha256: approval.approvalSha256,
    canonicalReceiptSha256: receipt.receiptSha256, batchReceiptSha256: batchReceipt.receiptSha256, originalAttributionReceiptSha256: chain.receipt.receiptSha256, subsequentAttributionReceiptSha256: repair.receipt.receiptSha256,
    semanticCompanySha256: semanticCompanyImageSha256(image), candidateFieldsAdjudicated: 7, cumulativeCandidateFieldsAdjudicated: 57, remainingCandidateFields: 546, additionalFieldsOutsideOriginal603: 6,
    interpretation: "GIC's sovereign reserve program is explicit; its holding subsidiary is not a managed infrastructure fund. GIP's named SPVs do not prove GIP V fund attribution. Current NextDecade/TotalEnergies/XRG corporate rationales are independently supported and retained, not accepted only because receipt-backed. One primary per owner. No physical comparisons changed.",
    qualifications: ["Authority is not persistence or write authorization. All six owner identities, legal vehicles, stakes, years, and no-redirect/no-pending boundary remain unchanged.",
      "GIP's residual after XRG sell-downs remains unavailable. Train 5 GIC/Mubadala's combined 13.2% is not allocated; aggregator ownership and Class B voting interests are not substituted for project economic stakes.",
      "The 2023 filing's generic description of GIP as an infrastructure investment fund does not name a specific managed fund. GIP V prefixes of acquisition/aggregator entities do not establish that fund.",
      "Existing research/proposal are preserved. Newly assigned NextDecade and XRG organization identities equal their managers; their proposal organizationName was null. This is a known materialization, not a new organization alias.",
      "Sidley is unavailable directly and is not used as fresh authority. The Federal Register notice's exact DOE attachment is captured instead. XRG is full rendered browser text, not raw HTTP bytes; no HTTP status is fabricated.",
      "2023/2025 announcements and January 2026 DOE response do not freshly verify September 2026 ownership, construction progress, fund economics, or closing of a new transaction."],
    separateEqualityBlindFollowup: { outsideOriginal603: true, ownershipPeriodId: mubadalaId, recordId: mubadalaSeed[0].recordId, originalRecordId: mubadalaOriginal[0].recordId, current: mubadalaObserved,
      disposition: "SEPARATE_SOURCE_BOUND_ATTRIBUTION_REVIEW_REQUIRED_NOT_ADJUDICATED_BY_THIS_REPORT",
      concern: "The unchanged seed and production metadata call MIC TI Holding LLC a disclosed fund, while canonical vehicle is MIC TI Holding Company 2 RSC Limited and existing research says fund not publicly disclosed. The reopened original filing page 6 expressly describes Mubadala sovereign capital. Review fundAttribution, attributedFundName and rationale separately; do not change the approved legal vehicle.",
      primarySourceUrl: RIO_GRANDE_SOURCES[0].url, primarySourceSha256: RIO_GRANDE_SOURCES[0].sha256, fieldsRequiringReview: ["fundAttribution", "attributedFundName", "attributionRationale"] },
    rows, databaseWrites: 0, seedChanges: 0, sourceTransitions: 0, applyAuthorized: false, completionAllowed: false };
}
