/** A narrow field-authority judgment. Never supplies an apply manifest. */
import { createHash } from "node:crypto";
import { verifyProposal, verifyApproval, verifyApplyReceipt } from "./artifacts";
import { semanticCompanyImageSha256 } from "./apply-plan";
import { companyImageSchema } from "./schema";
import { hashWithoutField, sha256Canonical, sha256Text } from "./hash";
import { verifySeedManifest } from "../portfolio-fund-attribution/schema";
import { verifyAttributionChain } from "./attribution-chronology";

export const THREE_I_SOURCE = "https://www.3i.com/media/04oheewu/3i-group-press-release-fy26.pdf";
export const THREE_I_GROUP = [
  { sequence: 1, companyId: "cmrxpj40p00fuivhezgldc4dl", ownerId: "cmrxpjp2j01c9ivhe3f8q2cck", recordId: "OFA-674978762296", proposalSha256: "4bbdd8066970e93b6b1e0294b47454f5475aaf43630f89f0cd464d6362864ef7" },
  { sequence: 2, companyId: "cmrxpj41b00fvivhe1q7x5nxw", ownerId: "cmrxpjp3601caivhek02rzmhq", recordId: "OFA-7622B7199679", proposalSha256: "0ab0d7ccb7118fcab01d0dadf5fc843e098a41ea0d02a4447e9c32e31d4ec009" },
  { sequence: 3, companyId: "cmrxpj41q00fwivhexqyc15b2", ownerId: "cmrxpjp3t01cbivhertzicggz", recordId: "OFA-CBBD8E860C97", proposalSha256: "105fd7716797e82a693a8be6147c0388655aecdb42722994b0e50143c1d8a0f4" },
] as const;
const FUND = "3i NA Infrastructure Fund";
const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);
interface State {
  linkedFundName: string | null; fundAttribution: string; attributedFundName: string | null;
  attributionConfidence: string | null; attributionRationale: string | null;
}
interface Candidate {
  companyId: string; name: string; ownershipPeriodId: string; recordId: string; proposalSha256: string;
  canonicalFundName: string | null; observed: State; diagnosticSeedExpectation: State;
  seedRecord: unknown; changedFields: string[]; seedWrite: unknown; adjudication: string;
}
interface Chronology extends Record<string, unknown> { reportSha256: string; candidates: Candidate[] }
export interface ThreeIAuthorityInput {
  chronology: Chronology; seed: unknown;
  proofs: Array<{ proposal: unknown; approval: unknown; receipt: unknown }>;
  attribution: { manifest: unknown; approval: unknown; receipt: unknown };
  production: {
    images: unknown[];
    owners: Array<{ id: string; companyId: string; fundId: string | null; fundAttribution: string; attributedFundName: string | null; attributionConfidence: string | null; attributionRationale: string | null; isActive: boolean }>;
    fund: { id: string; fundName: string; manager: { name: string }; status: string };
  };
  seedFund: { id: string; fundName: string; managerName: string };
  sourcePdf: Uint8Array; sourceText: string;
}

export function proveThreeIFieldAuthority(input: ThreeIAuthorityInput) {
  if (input.chronology.reportSha256 !== "0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac"
    || hashWithoutField(input.chronology, "reportSha256") !== input.chronology.reportSha256) throw new Error("Frozen chronology changed");
  const totalFields = input.chronology.candidates.reduce((sum, row) => sum + row.changedFields.length, 0);
  if (totalFields !== 603 || input.chronology.candidates.length !== 277) throw new Error("Candidate scope changed");
  const pdfSha256 = createHash("sha256").update(input.sourcePdf).digest("hex");
  if (pdfSha256 !== "7697bcdd205e57a8b9da9dbd69b9b66ad3f2f54a51d28b67bded3d4cbabdc0f0"
    || sha256Text(input.sourceText) !== "6fcf57c9f07f1a683c939f0b3fba7fb43a42b48686a89a9db6563aef627559c2") throw new Error("Reviewed primary evidence changed");
  const seed = verifySeedManifest(input.seed);
  if (seed.manifestSha256 !== "cd644038e360277a296d59d0eb6976c2a1eb85af3e752ffc941d944f1c556257") throw new Error("Frozen seed changed");
  const chain = verifyAttributionChain(input.attribution);
  if (chain.receipt.receiptSha256 !== "779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf") throw new Error("Original attribution receipt changed");
  const fund = input.production.fund;
  if (fund.id !== "cmrxpj0q100awivhe614f48xf" || fund.fundName !== FUND || fund.manager.name !== "3i Group" || fund.status !== "PUBLISHED"
    || input.seedFund.id !== "FUND-002" || input.seedFund.fundName !== FUND || input.seedFund.managerName !== fund.manager.name) throw new Error("Curated fund identity changed");
  if (input.proofs.length !== 3 || input.production.images.length !== 3 || input.production.owners.length !== 3) throw new Error("Scoped proof cardinality changed");
  const proofs = input.proofs.map((proof) => {
    const proposal = verifyProposal(proof.proposal);
    const approval = verifyApproval(proof.approval, proposal);
    return { proposal, approval, receipt: verifyApplyReceipt(proof.receipt, proposal, approval) };
  });
  const rows = THREE_I_GROUP.map((group) => {
    const matches = input.chronology.candidates.filter((row) => row.ownershipPeriodId === group.ownerId);
    const applied = proofs.filter((proof) => proof.proposal.proposalSha256 === group.proposalSha256);
    const images = input.production.images.map((image) => companyImageSchema.parse(image)).filter((image) => image.id === group.companyId);
    const owners = input.production.owners.filter((owner) => owner.id === group.ownerId);
    if (matches.length !== 1 || applied.length !== 1 || images.length !== 1 || owners.length !== 1) throw new Error("Non-unique scoped authority");
    const candidate = matches[0], { proposal, approval, receipt } = applied[0], owner = owners[0], actual = images[0];
    const record = seed.records.filter((row) => row.recordId === group.recordId);
    if (candidate.companyId !== group.companyId || candidate.recordId !== group.recordId || candidate.proposalSha256 !== group.proposalSha256
      || !same(candidate.changedFields, ["attributedFundName", "fundName"]) || candidate.seedWrite !== null
      || record.length !== 1 || !same(record[0], candidate.seedRecord)
      // Early receipts predate the optional companyId field. Their verified
      // after-image hash binds the explicit canonical company ID instead.
      || !proposal.afterImage || proposal.afterImage.id !== group.companyId
      || (receipt.companyId !== undefined && receipt.companyId !== group.companyId) || candidate.name !== actual.name
      || semanticCompanyImageSha256(actual) !== semanticCompanyImageSha256(proposal.afterImage)) throw new Error(`Canonical company or seed binding differs: ${JSON.stringify({
        sequence: group.sequence, receiptCompanyId: receipt.companyId, companyId: actual.id,
        seedMatches: record.length === 1 && same(record[0], candidate.seedRecord),
        semanticMatches: !!proposal.afterImage && semanticCompanyImageSha256(actual) === semanticCompanyImageSha256(proposal.afterImage),
        changedTopLevelFields: proposal.afterImage ? Object.keys(actual).filter((field) => !same(actual[field as keyof typeof actual], proposal.afterImage![field as keyof typeof actual])) : [],
      })}`);
    const canonicalOwner = actual.ownershipPeriods.filter((row) => row.id === group.ownerId);
    if (canonicalOwner.length !== 1 || canonicalOwner[0].fundName !== FUND || canonicalOwner[0].vehicleName !== FUND
      || canonicalOwner[0].managerName !== "3i Group" || !canonicalOwner[0].isActive
      || owner.companyId !== group.companyId || !owner.isActive || owner.fundId !== fund.id) throw new Error("Owner identity or fund link changed");
    const observed = { linkedFundName: fund.fundName, fundAttribution: owner.fundAttribution, attributedFundName: owner.attributedFundName,
      attributionConfidence: owner.attributionConfidence, attributionRationale: owner.attributionRationale };
    const original = chain.receipt.rows.filter((row) => row.ownershipPeriodId === owner.id);
    if (!same(observed, candidate.observed) || original.length !== 1 || original[0].companyId !== group.companyId || !same(observed, original[0].after)
      || observed.fundAttribution !== "DISCLOSED" || observed.attributionConfidence !== null || observed.attributedFundName !== FUND
      || candidate.canonicalFundName !== FUND) throw new Error("Current attribution metadata drifted");
    if (group.sequence === 3 && (canonicalOwner[0].stake !== null || !proposal.rationale.includes("removing unsupported assertions that 3i acquired 100%")
      || !observed.attributionRationale?.includes("Ownership Interest: 100%"))) throw new Error("Regional Rail unknown-stake lineage changed");
    return { ...group, companyName: actual.name, candidateSha256: sha256Canonical(candidate), proposalSha256: proposal.proposalSha256,
      approvalSha256: approval.approvalSha256, receiptSha256: receipt.receiptSha256,
      semanticCompanySha256: semanticCompanyImageSha256(actual), current: observed, seedExpectation: candidate.diagnosticSeedExpectation,
      fieldDecisions: ["fundName", "attributedFundName"].map((field) => ({
        field, disposition: "RETAIN_CURRENT_SOURCE_SUPPORTED_CANONICAL_ALIAS", productionValue: FUND,
        seedValue: field === "fundName" ? record[0].targetLinkedFundName : record[0].attributedFundName,
        sourceUrl: THREE_I_SOURCE, sourcePdfSha256: pdfSha256, oneBasedPages: [21, 22],
        seedPersistenceAction: "REQUIRES_SEPARATE_SCOPED_SEED_RECONCILIATION", productionWriteRequired: false,
      })),
      rationaleFollowup: { field: "attributionRationale", outsideOriginal603: true, disposition: "SOURCE_SUPPORTED_METADATA_CORRECTION_REQUIRED_NOT_AUTHORIZED_BY_THIS_REPORT",
        currentValue: observed.attributionRationale,
        reason: group.sequence === 3 ? "The old rationale asserts 100% despite the later approved canonical null stake and explicit removal of that unsupported assertion; its distinct-unmatched-fund assertion is also stale. Preserve the null stake."
          : "The rationale says the disclosed fund does not match the curated fund database, despite the exact existing fund link and issuer-confirmed NAIF holding. Replace only that stale metadata under separate safeguards; do not change stake.",
      },
      wholeCompanyAdjudicationComplete: false };
  });
  return { schemaVersion: 1, artifactType: "PORTCO_THREE_I_FIELD_AUTHORITY", chronologySha256: input.chronology.reportSha256,
    seedManifestSha256: seed.manifestSha256, sourcePdfSha256: pdfSha256, primarySourceUrl: THREE_I_SOURCE,
    sourceInterpretation: "Issuer FY2026 page 21 places the three companies under NAIF; page 22 Table 8 footnote 2 explicitly includes all three in the North American Infrastructure Fund. Together with the exact canonical owner and existing curated fund identities, this supports the scoped NA/North American label equivalence, not unlinking or a different fund.",
    scopeQualification: "This does not review Fund size, fund vintage, strategy, legal entity suffixes, post-report transaction events, or other managers. It is not a general name-matching rule. Prior source-task outcomes and all unknown stakes remain unchanged.",
    candidateFieldsAdjudicated: 6, remainingCandidateFields: totalFields - 6, additionalRationaleCorrectionsRequired: 3,
    originalAttributionReceiptSha256: chain.receipt.receiptSha256, rows,
    databaseWrites: 0, seedChanges: 0, sourceTransitions: 0, applyAuthorized: false, completionAllowed: false };
}
