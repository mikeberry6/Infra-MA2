/** Source-backed read-only authority, never an apply manifest. */
import { createHash } from "node:crypto";
import { verifyProposal, verifyApproval, verifyApplyReceipt } from "./artifacts";
import { semanticCompanyImageSha256 } from "./apply-plan";
import { companyImageSchema } from "./schema";
import { hashWithoutField, sha256Canonical } from "./hash";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { verifyAttributionChain } from "./attribution-chronology";
import type { UsdInput } from "./usd-field-authority";

export const CHIEF = { companyId: "cmsqy1iqt0000ee4s76s3uleu", fundId: "cmsdi3o8c002x7h4spgye7z2d",
  fundName: "ArcLight Energy Partners Fund V, L.P.", proposalSha256: "448ebd890fa1fa623fe6197c6992ae894d623197b9fb2fee1b538cf1f87f35d0" };
export const CHIEF_OWNERS = [
  { ownerId: "cmsqy1ks0000hee4s99nkni2v", recordId: "OFA-C5C4181CF197", originalRecordId: "OFA-7CC0DE2F9E89", year: 2014, confidence: "MEDIUM",
    vehicle: "Chief Power Transfer Parent, LLC / Chief Power Finance, LLC residual tranche",
    stake: "Approximately 3% interest retained after the 2020 lender restructuring; exact economic percentage not publicly disclosed" },
  { ownerId: "cmsqy1l04000iee4sludeh502", recordId: "OFA-44F1F236D9F0", originalRecordId: "OFA-F75D67E0FA03", year: 2019, confidence: "LOW",
    vehicle: "Chief Power Finance II, LLC",
    stake: "Greater than 10% voting interest in each of Chief Conemaugh Power II, LLC and Chief Keystone Power II, LLC; exact economic percentage not publicly disclosed" },
] as const;
export const CHIEF_SOURCES = [
  { id: "arclight-esg", file: "arclight-esg.pdf", url: "https://arclight.com/wp-content/uploads/2025/10/2025-ArcLight-ESG-Report.pdf", sha256: "8d3e46c68bcac5a02e01a9710e711d366c68f351a3a380c0933919c763f24902" },
  { id: "ny-dps", file: "ny-dps.pdf", url: "https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7B909B109C-0000-C03B-9B29-CBFAE3D27AD9%7D&DocTitle=2026+Annual+Report+of+Cricket+Valley+Energy+Center%2C+LLC%2C+et+al.", sha256: "3112aeab0239a1c414019b66172cbb38a3bb2536bb00d9e353d93d7b6b3572f5" },
  { id: "ferc-mirror", file: "ferc-mirror.html", url: "https://www.docketalarm.com/cases/FERC/ER19-2231-010/Chief_Conemaugh_Power_II_LLC/20241031-5380/", sha256: "c2b16ccb3fb2aef1c3e8629692c1b953bf8c1015b470b03adb1642fb6cef6364" },
] as const;
export const CHIEF_TEXT = [
  { id: "esg-text", file: "arclight-esg.txt", sha256: "1a14e3e6cbb9d4ed8d9ccfa9d3a02ea644ab53be2a804f40ff6450b401dfbc6b" },
  { id: "ny-text", file: "ny-dps.txt", sha256: "7740ecde7bea184c20a4feee3fb2c5b35f510fa30d56eb7c1f8b37376629ea1f" },
] as const;
export interface ChiefInput extends UsdInput { seedOverlay: Array<{ proposalSha256: string; approvalSha256: string; afterImageSha256: string; canonicalAfterImage?: unknown }> }
const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);

export function proveChiefPowerFieldAuthority(input: ChiefInput) {
  if (input.chronology.reportSha256 !== "0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
    || hashWithoutField(input.chronology, "reportSha256") !== input.chronology.reportSha256
    || input.chronology.candidates.length !== 277 || input.chronology.candidates.reduce((n,c) => n+c.changedFields.length, 0) !== 603) throw new Error("Frozen chronology changed");
  if (input.priorAuthority.reportSha256 !== "3bd1bd20057948a1d10a666792afc99b90b01b7d4ad892856e201a6d5903bee9"
    || hashWithoutField(input.priorAuthority, "reportSha256") !== input.priorAuthority.reportSha256
    || input.priorAuthority.cumulativeCandidateFieldsAdjudicated !== 57 || input.priorAuthority.remainingCandidateFields !== 546) throw new Error("Prior authority changed");
  if (input.sources.length !== 5) throw new Error("Source scope changed");
  for (const source of [...CHIEF_SOURCES, ...CHIEF_TEXT]) {
    const rows = input.sources.filter(row => row.id === source.id);
    if (rows.length !== 1 || createHash("sha256").update(rows[0].bytes).digest("hex") !== source.sha256) throw new Error("Reviewed source bytes changed");
  }
  const seed = verifySeedManifest(input.seed), chain = verifyAttributionChain(input.attribution);
  if (seed.manifestSha256 !== "cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
    || chain.receipt.receiptSha256 !== "779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf") throw new Error("Seed/original attribution chain changed");
  const proposal = verifyProposal(input.proposal), approval = verifyApproval(input.approval, proposal), receipt = verifyApplyReceipt(input.receipt, proposal, approval);
  if (proposal.proposalSha256 !== CHIEF.proposalSha256 || proposal.taskIndex !== 66 || !proposal.afterImage || proposal.afterImage.id !== null
    || receipt.companyId !== CHIEF.companyId || approval.approvalSha256 !== "ef99ee6ddaf130bcfd4e5d5e5b6b3a82f581b6f2048ff551edaef82e0f8c651d"
    || receipt.receiptSha256 !== "2995b86d14934b256a698b44bf8e5ac6a40f9884d2622dcdc6c75099449823e6") throw new Error("Canonical task66 receipt chain changed");
  const overlay = input.seedOverlay.filter(row => row.proposalSha256 === CHIEF.proposalSha256);
  if (overlay.length !== 1 || overlay[0].approvalSha256 !== approval.approvalSha256 || overlay[0].afterImageSha256 !== proposal.afterImageSha256
    || !same(overlay[0].canonicalAfterImage, proposal.afterImage)) throw new Error("Canonical seed overlay changed");
  const fund = input.production.fund;
  if (fund.id !== CHIEF.fundId || fund.fundName !== CHIEF.fundName || fund.status !== "PUBLISHED" || fund.manager.name !== "ArcLight Capital Partners"
    || input.seedFund.id !== "FUND-152" || input.seedFund.fundName !== fund.fundName || input.seedFund.managerName !== fund.manager.name) throw new Error("Existing fund identity changed");
  if (input.production.images.length !== 1 || input.production.owners.length !== 3 || input.production.redirects.length !== 0) throw new Error("Scoped company/owner/redirect cardinality changed");
  const image = companyImageSchema.parse(input.production.images[0]);
  if (image.id !== CHIEF.companyId || image.name !== "Chief Power" || image.country !== "United States"
    || semanticCompanyImageSha256(image) !== semanticCompanyImageSha256(proposal.afterImage)
    || image.ownershipPeriods.length !== 3 || image.pendingOwnershipTransactions.length !== 0) throw new Error("Full canonical company changed");
  const historical = input.production.owners.filter(row => row.id === "cmsqy1kj9000gee4svk29j3v4");
  if (historical.length !== 1 || historical[0].companyId !== CHIEF.companyId || historical[0].isActive || historical[0].fundId !== CHIEF.fundId
    || historical[0].fundAttribution !== "UNRESOLVED" || historical[0].attributedFundName !== null || historical[0].attributionConfidence !== null || historical[0].attributionRationale !== null) throw new Error("Historical owner must remain unchanged");
  const rows = CHIEF_OWNERS.map(group => {
    const candidates = input.chronology.candidates.filter(row => row.ownershipPeriodId === group.ownerId);
    const records = seed.records.filter(row => row.recordId === group.recordId);
    const owners = input.production.owners.filter(row => row.id === group.ownerId);
    const cores = image.ownershipPeriods.filter(row => row.id === group.ownerId);
    if (candidates.length !== 1 || records.length !== 1 || owners.length !== 1 || cores.length !== 1) throw new Error("Owner/seed collision or missing binding");
    const candidate = candidates[0], record = records[0], owner = owners[0], core = cores[0];
    if (candidate.companyId !== CHIEF.companyId || candidate.recordId !== group.recordId || candidate.proposalSha256 !== CHIEF.proposalSha256
      || !same(candidate.changedFields, ["attributionConfidence", "attributionRationale", "fundAttribution"]) || candidate.seedWrite !== null || !same(record, candidate.seedRecord)
      || owner.companyId !== CHIEF.companyId || owner.fundId !== CHIEF.fundId || !owner.isActive || !core.isActive
      || core.managerName !== fund.manager.name || core.organizationName !== fund.manager.name || core.fundName !== fund.fundName
      || core.vehicleName !== group.vehicle || core.stake !== group.stake || core.investmentYear !== group.year || core.exitYear !== null || core.transactionState !== "CLOSED_ACTIVE"
      || record.companyName !== image.name || record.country !== image.country || record.investmentFirm !== core.managerName
      || record.currentVehicleName !== core.vehicleName || record.investmentYear !== core.investmentYear || record.stake !== core.stake
      || seed.records.filter(row => row.companyName === image.name && row.country === image.country && row.currentVehicleName === core.vehicleName).length !== 1) throw new Error("Active canonical/seed identity changed");
    const observed = { linkedFundName: fund.fundName, fundAttribution: owner.fundAttribution, attributedFundName: owner.attributedFundName,
      attributionConfidence: owner.attributionConfidence, attributionRationale: owner.attributionRationale };
    const original = chain.receipt.rows.filter(row => row.ownershipPeriodId === owner.id);
    const mutations = chain.manifest.mutations.filter(row => row.ownershipPeriodId === owner.id);
    if (original.length !== 1 || mutations.length !== 1 || original[0].companyId !== CHIEF.companyId || original[0].recordId !== group.originalRecordId
      || mutations[0].recordId !== group.originalRecordId || mutations[0].companyName !== image.name || mutations[0].country !== image.country
      || mutations[0].investmentFirm !== core.managerName || mutations[0].currentVehicleName !== core.vehicleName
      || mutations[0].stake !== core.stake || mutations[0].investmentYear !== core.investmentYear
      || !same(original[0].after, observed) || !same(candidate.observed, observed) || candidate.canonicalFundName !== CHIEF.fundName
      || observed.fundAttribution !== "INFERRED" || observed.attributedFundName !== CHIEF.fundName || observed.attributionConfidence !== group.confidence) throw new Error("Original/current metadata changed");
    const rationale = "ArcLight's 2025 ESG Report, page 18, explicitly lists Chief Power under Fund V as of December 31, 2024. This is disclosed fund attribution, not a vintage/mandate estimate. Preserve the separately verified "
      + (group.year === 2014 ? "residual-tranche vehicle, 2014 entry and approximately 3% retained-interest text; exact economic percentage remains unavailable."
        : "Chief Power Finance II vehicle, 2019 entry and greater-than-10% voting-interest text for each II plant owner; exact economic percentage remains unavailable.");
    const recommended = { linkedFundName: CHIEF.fundName, fundAttribution: "DISCLOSED", attributedFundName: CHIEF.fundName, attributionConfidence: null, attributionRationale: rationale };
    return { ...group, companyId: CHIEF.companyId, candidateSha256: sha256Canonical(candidate), current: observed, seedExpectation: candidate.diagnosticSeedExpectation, recommended,
      fieldDecisions: (["fundAttribution", "attributionConfidence", "attributionRationale"] as const).map(field => ({ field, outsideOriginal603: false,
        disposition: "SOURCE_SUPPORTED_CORRECTION_REQUIRED_NOT_AUTHORIZED_BY_THIS_REPORT", current: observed[field], seed: candidate.diagnosticSeedExpectation[field], recommended: recommended[field],
        productionWriteRequired: observed[field] !== recommended[field], seedPersistenceRequired: candidate.diagnosticSeedExpectation[field] !== recommended[field],
        primarySourceUrl: CHIEF_SOURCES[0].url, primarySourceSha256: CHIEF_SOURCES[0].sha256, primaryOneBasedPage: 18 })),
      preserves: core, missingSeedUpsertBinding: true, wholeCompanyReconciled: false };
  });
  return { schemaVersion: 1, artifactType: "PORTCO_CHIEF_POWER_FIELD_AUTHORITY", chronologySha256: input.chronology.reportSha256,
    priorAuthoritySha256: input.priorAuthority.reportSha256, seedManifestSha256: seed.manifestSha256,
    canonicalProposalSha256: proposal.proposalSha256, canonicalApprovalSha256: approval.approvalSha256, canonicalReceiptSha256: receipt.receiptSha256,
    canonicalSeedOverlaySha256: sha256Canonical(overlay[0]), originalAttributionReceiptSha256: chain.receipt.receiptSha256, semanticCompanySha256: semanticCompanyImageSha256(image),
    candidateFieldsAdjudicated: 6, cumulativeCandidateFieldsAdjudicated: 63, remainingCandidateFields: 540, additionalFieldsOutsideOriginal603: 0,
    productionFieldsRequiringCorrection: 6, seedFieldsRequiringCorrection: 2, missingSeedUpsertBindings: 2, rows,
    interpretation: "The issuer's exact Chief Power / Power / Fund V row in its 2025 ESG appendix establishes disclosed attribution. The existing Fund V link/name are retained for the two separately verified active tranches; classification, confidence and rationale require correction, without redoing company research.",
    qualifications: ["The sole primary per field is ArcLight's existing ESG report page 18, headed investments as of December 31, 2024. The report does not establish a new September 2026 lifecycle outcome or precise tranche economics.",
      "The existing October 31, 2024 FERC notice is reopened through its Docket Alarm mirror; its page 4 names Fund V and greater-than-10% voting interests in the two II entities. It is supporting evidence, not a direct regulator-hosted capture.",
      "The existing January 30, 2026 New York filing page 2 footnotes corroborate ArcLight's 3% Chief Power JV interest and the plant-level percentages. It does not name Fund V; no exact economic stake, new holder, or multiplied plant interest is inferred.",
      "The old canonical task directory contains proposal, approval, context and immutable receipt but no standalone research/ChatGPT packet. That absence is explicit, not filled with a fabricated packet or a repeated conversation. The completed source outcome is unchanged.",
      "Both absent latest seed-upsert bindings remain explicit; the frozen seed records, approved canonical overlay and original attribution history are bound without inventing rekey lineage.",
      "The historical 2014-2020 ownership period is preserved, not adjudicated as an active candidate. Fund vintage, fund economics, vehicle names, stakes, dates, citations, redirects and pending-transaction states are not changed.",
      "Six production fields and two seed rationales need separate protected persistence; these counts overlap. No apply manifest, write authorization, terminal transition or transaction replay is emitted."],
    databaseWrites: 0, seedChanges: 0, sourceTransitions: 0, applyAuthorized: false, completionAllowed: false };
}
