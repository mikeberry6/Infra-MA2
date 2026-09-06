/** Read-only, exact-target authority. No apply manifest or global alias rule is emitted. */
import { createHash } from "node:crypto";
import { verifyProposal, verifyApproval, verifyApplyReceipt } from "./artifacts";
import { semanticCompanyImageSha256 } from "./apply-plan";
import { companyImageSchema } from "./schema";
import { hashWithoutField, sha256Canonical } from "./hash";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { verifyAttributionChain } from "./attribution-chronology";
import type { ThreeIAuthorityInput } from "./three-i-field-authority";

export const USD = { companyId: "cmrxpj66d00iwivhehmeoxiek", ownerId: "cmrxpjr7m01frivheqgpnrk72", recordId: "OFA-163D37942AED",
  fundId: "cmrxpj12v00bfivheaxln1619", fundName: "Ara Infrastructure Fund I",
  proposalSha256: "b69de5c8215cf47a99c446942ce2c8d8ec917d10cb3492adf6fcaa11ded882c9" };
export const USD_SOURCES = [
  { id: "ara-portfolio", file: "ara-portfolio.html", url: "https://www.arapartners.com/portfolio/", sha256: "a1e8325fa8ea2c7f36e7b771ffa23e6d1b598284380a4144964f03f3d85b0987" },
  { id: "ara-acquisition", file: "ara-acquisition.html", url: "https://www.arapartners.com/news/ara-partners-acquires-majority-interest-in-usd-clean-fuels/", sha256: "201d78f065de8df585b3d35a8fdd5c9aa3cb7d57d46fcdd6238486942a2f9620" },
] as const;
export interface UsdInput extends Omit<ThreeIAuthorityInput, "proofs" | "sourcePdf" | "sourceText" | "production"> {
  priorAuthority: Record<string, unknown> & { reportSha256: string; cumulativeCandidateFieldsAdjudicated: number; remainingCandidateFields: number };
  proposal: unknown; approval: unknown; receipt: unknown;
  sources: Array<{ id: string; bytes: Uint8Array }>;
  production: ThreeIAuthorityInput["production"] & { redirects: unknown[] };
}
const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);

export function proveUsdFieldAuthority(input: UsdInput) {
  if (input.chronology.reportSha256 !== "0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
    || hashWithoutField(input.chronology, "reportSha256") !== input.chronology.reportSha256
    || input.chronology.candidates.length !== 277 || input.chronology.candidates.reduce((n,c) => n+c.changedFields.length, 0) !== 603) throw new Error("Frozen chronology changed");
  if (input.priorAuthority.reportSha256 !== "49ed4c982808cc5d1e18300ab45ea9eb607b63fb5d7b1af98eacfcda1982f532"
    || hashWithoutField(input.priorAuthority, "reportSha256") !== input.priorAuthority.reportSha256
    || input.priorAuthority.cumulativeCandidateFieldsAdjudicated !== 29 || input.priorAuthority.remainingCandidateFields !== 574) throw new Error("Prior authority changed");
  if (input.sources.length !== 2) throw new Error("Source scope changed");
  for (const source of USD_SOURCES) {
    const rows = input.sources.filter(row => row.id === source.id);
    if (rows.length !== 1 || createHash("sha256").update(rows[0].bytes).digest("hex") !== source.sha256) throw new Error("Reviewed direct source changed");
  }
  const seed = verifySeedManifest(input.seed), chain = verifyAttributionChain(input.attribution);
  if (seed.manifestSha256 !== "cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257"
    || chain.receipt.receiptSha256 !== "779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf") throw new Error("Seed or original attribution chain changed");
  const proposal = verifyProposal(input.proposal), approval = verifyApproval(input.approval, proposal), receipt = verifyApplyReceipt(input.receipt, proposal, approval);
  if (proposal.proposalSha256 !== USD.proposalSha256 || proposal.taskIndex !== 62 || !proposal.afterImage || proposal.afterImage.id !== USD.companyId
    || approval.approvalSha256 !== "cca6fd57162641002e75425b834153968d88fcfd052039d8406e416cd4df699d"
    || receipt.receiptSha256 !== "56b8bc3de4faa5286de6c3880fdb412d139f18d15d744036c94efcaad4d66b88") throw new Error("Canonical task62 receipt chain changed");
  const fund = input.production.fund;
  if (fund.id !== USD.fundId || fund.fundName !== USD.fundName || fund.status !== "PUBLISHED" || fund.manager.name !== "Ara Partners"
    || input.seedFund.id !== "FUND-017" || input.seedFund.fundName !== fund.fundName || input.seedFund.managerName !== fund.manager.name) throw new Error("Curated fund identity changed");
  if (input.production.images.length !== 1 || input.production.owners.length !== 1 || input.production.redirects.length !== 0) throw new Error("Scoped company/owner/redirect cardinality changed");
  const image = companyImageSchema.parse(input.production.images[0]);
  if (image.id !== USD.companyId || image.name !== "USD Clean Fuels, LLC" || image.country !== "United States"
    || semanticCompanyImageSha256(image) !== semanticCompanyImageSha256(proposal.afterImage)) throw new Error("Full canonical company changed");
  const candidates = input.chronology.candidates.filter(row => row.ownershipPeriodId === USD.ownerId);
  const records = seed.records.filter(row => row.recordId === USD.recordId);
  const cores = image.ownershipPeriods.filter(row => row.id === USD.ownerId);
  if (candidates.length !== 1 || records.length !== 1 || cores.length !== 1 || image.ownershipPeriods.length !== 1) throw new Error("Non-unique scoped owner/seed authority");
  const candidate = candidates[0], record = records[0], core = cores[0], owner = input.production.owners[0];
  if (candidate.companyId !== USD.companyId || candidate.recordId !== USD.recordId || candidate.proposalSha256 !== USD.proposalSha256
    || !same(candidate.changedFields, ["fundName"]) || candidate.seedWrite !== null || !same(record, candidate.seedRecord)
    || owner.id !== USD.ownerId || owner.companyId !== USD.companyId || owner.fundId !== USD.fundId || !owner.isActive
    || !core.isActive || core.managerName !== fund.manager.name || core.organizationName !== "Ara Partners" || core.fundName !== fund.fundName
    || core.vehicleName !== fund.fundName || core.stake !== "Majority interest; exact percentage not publicly disclosed" || core.investmentYear !== 2023 || core.exitYear !== null || core.transactionState !== "CLOSED_ACTIVE"
    || record.investmentFirm !== core.organizationName || record.currentVehicleName !== core.vehicleName || record.investmentYear !== core.investmentYear || record.stake !== core.stake
    || seed.records.filter(row => row.companyName === image.name && row.country === image.country && row.investmentFirm === core.organizationName && row.currentVehicleName === core.vehicleName).length !== 1) throw new Error("Active-only canonical/seed identity changed");
  const observed = { linkedFundName: fund.fundName, fundAttribution: owner.fundAttribution, attributedFundName: owner.attributedFundName,
    attributionConfidence: owner.attributionConfidence, attributionRationale: owner.attributionRationale };
  const original = chain.receipt.rows.filter(row => row.ownershipPeriodId === owner.id);
  const originalMutations = chain.manifest.mutations.filter(row => row.ownershipPeriodId === owner.id);
  // Bind the distinct original production and seed record IDs through their
  // exact owner/company/manager/vehicle/stake/year, without inventing a rekey spec.
  if (original.length !== 1 || original[0].companyId !== USD.companyId || original[0].recordId !== "OFA-0FDDAADF54ED" || !same(original[0].after, observed)
    || originalMutations.length !== 1 || originalMutations[0].recordId !== original[0].recordId || originalMutations[0].investmentFirm !== core.managerName
    || originalMutations[0].companyName !== image.name || originalMutations[0].country !== image.country || originalMutations[0].currentVehicleName !== core.vehicleName
    || originalMutations[0].stake !== core.stake || originalMutations[0].investmentYear !== core.investmentYear
    || !same(candidate.observed, observed) || candidate.canonicalFundName !== USD.fundName || observed.fundAttribution !== "DISCLOSED"
    || observed.attributedFundName !== USD.fundName || observed.attributionConfidence !== null || !observed.attributionRationale?.includes("Ownership Interest: Not publicly disclosed")) throw new Error("Original/current attribution metadata changed");
  const primary = USD_SOURCES[0];
  return { schemaVersion: 1, artifactType: "PORTCO_USD_FIELD_AUTHORITY", chronologySha256: input.chronology.reportSha256,
    priorAuthoritySha256: input.priorAuthority.reportSha256, seedManifestSha256: seed.manifestSha256,
    canonicalProposalSha256: proposal.proposalSha256, canonicalApprovalSha256: approval.approvalSha256, canonicalReceiptSha256: receipt.receiptSha256,
    originalAttributionReceiptSha256: chain.receipt.receiptSha256, semanticCompanySha256: semanticCompanyImageSha256(image),
    candidateFieldsAdjudicated: 1, cumulativeCandidateFieldsAdjudicated: 30, remainingCandidateFields: 573, additionalFieldsOutsideOriginal603: 0,
    rows: [{ ...USD, originalAttributionRecordId: original[0].recordId, candidateSha256: sha256Canonical(candidate), current: observed, seedExpectation: candidate.diagnosticSeedExpectation,
      fieldDecisions: [{ field: "fundName", outsideOriginal603: false, disposition: "RETAIN_CURRENT_SOURCE_SUPPORTED_SCOPED_ALIAS",
        recommended: USD.fundName, productionWriteRequired: false, seedPersistenceAction: "REQUIRES_SEPARATE_SCOPED_SEED_RECONCILIATION",
        primarySourceUrl: primary.url, primarySourceSha256: primary.sha256 }],
      preserves: { stake: core.stake, investmentYear: core.investmentYear, vehicleName: core.vehicleName, managerName: core.managerName, organizationName: core.organizationName, transactionState: core.transactionState },
      unchangedMetadataQualification: "Retain DISCLOSED and the existing attributed fund name with null confidence. The rationale's ownership-undisclosed phrase is read as the exact percentage, not a denial of the canonical majority interest; no unsupported precise stake or minority holder is supplied.",
      wholeCompanyReconciled: false }],
    interpretation: "Ara's exact USD Clean Fuels portfolio panel names Infra Fund I, identifies the Infrastructure strategy, gives December 2023 investment and active status. Together with the existing exact Ara fund and canonical task62 receipt, this supports retaining the Ara Infrastructure Fund I link, not unlinking it to match the seed. Adjacent Private Equity Ara Fund I panels are separate companies and are not the evidence for this decision.",
    qualifications: ["Authority is not persistence or write authorization; physical values remain unchanged.",
      "Only this exact company, active owner and existing Ara Infrastructure Fund I record are adjudicated. No fund economics, global alias or legal-suffix rule, new holding entity, current acquisition/exit search or broader company research is introduced.",
      "The manager acquisition landing page supplies only its majority-acquisition headline and January 2, 2024 date plus a press-wire link. It is supporting context, not the fund-attribution primary or a full transaction-body capture.",
      "The canonical majority interest and exact-percentage/minority-holder exceptions remain unchanged. Announcement date is not substituted for the December 2023 investment.",
      "The chronology's absent latest seed-upsert binding remains explicit. The verified frozen seed and exact canonical/original attribution chains are bound; no rekey history or missing spec is fabricated."],
    databaseWrites: 0, seedChanges: 0, sourceTransitions: 0, applyAuthorized: false, completionAllowed: false };
}
