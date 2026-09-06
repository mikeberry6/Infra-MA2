/** Separately adjudicate a source-bound equality-blind issue; never emit mutations. */
import { companyImageSchema } from "./schema";
import { hashWithoutField, sha256Canonical } from "./hash";
import { proveRioGrandeFieldAuthority, RIO_GRANDE_COMPANY, RIO_GRANDE_SOURCES, type RioGrandeInput } from "./rio-grande-field-authority";

export const RIO_MUBADALA_OWNER = "cmrxpk2ef01xgivhe1pzzw4h7";
export const RIO_MUBADALA_PRIOR = "d975522b0684d8c5276d3f3e337ca7beaf5a602b8f1704621cbf49f48f24c70f";
type RioProof = ReturnType<typeof proveRioGrandeFieldAuthority>;
export interface RioMubadalaInput extends RioGrandeInput {
  rioAuthority: RioProof & { reportSha256: string; productionSnapshotSha256: string };
}

export function proveRioMubadalaFieldAuthority(input: RioMubadalaInput) {
  if (input.rioAuthority.reportSha256 !== RIO_MUBADALA_PRIOR
    || hashWithoutField(input.rioAuthority, "reportSha256") !== RIO_MUBADALA_PRIOR) throw new Error("Frozen Rio authority changed");
  // Pure validation of the complete existing chain; does not rerun a frozen capture/audit phase.
  const prior = proveRioGrandeFieldAuthority(input);
  for (const key of Object.keys(prior) as Array<keyof RioProof>) {
    if (sha256Canonical(prior[key]) !== sha256Canonical(input.rioAuthority[key])) throw new Error(`Prior Rio proof differs: ${key}`);
  }
  if (input.rioAuthority.productionSnapshotSha256 !== "ffde0a1d3b33ea91d90f5bfe6f4b1506830b098e5fea78a3a4978afe68c77f8f"
    || sha256Canonical(input.production) !== input.rioAuthority.productionSnapshotSha256) throw new Error("Full six-owner state changed");
  const issue = prior.separateEqualityBlindFollowup;
  if (issue.ownershipPeriodId !== RIO_MUBADALA_OWNER || !issue.outsideOriginal603
    || issue.disposition !== "SEPARATE_SOURCE_BOUND_ATTRIBUTION_REVIEW_REQUIRED_NOT_ADJUDICATED_BY_THIS_REPORT"
    || issue.recordId !== "OFA-20166140109D" || issue.originalRecordId !== "OFA-08D66635201C"
    || sha256Canonical(issue.fieldsRequiringReview) !== sha256Canonical(["fundAttribution", "attributedFundName", "attributionRationale"])) throw new Error("Separate issue scope changed");
  const image = companyImageSchema.parse(input.production.image);
  const core = image.ownershipPeriods.filter(row => row.id === RIO_MUBADALA_OWNER);
  const research = input.research.result.ownershipResolution.owners.filter(row => row.manager === "Mubadala");
  if (core.length !== 1 || research.length !== 1 || image.id !== RIO_GRANDE_COMPANY
    || core[0].managerName !== "Mubadala" || core[0].organizationName !== "Mubadala" || core[0].fundName !== null
    || core[0].vehicleName !== "MIC TI Holding Company 2 RSC Limited" || core[0].investmentYear !== 2023
    || core[0].stake !== "Phase 1 minimum 6.57%; Train 4 5.2%; Train 5 included in 13.2% combined GIC/Mubadala interest"
    || !core[0].isActive || core[0].transactionState !== "CLOSED_ACTIVE" || core[0].exitYear !== null
    || research[0].fund !== "NOT_PUBLICLY_DISCLOSED" || research[0].vehicle !== core[0].vehicleName || !research[0].isActive) throw new Error("Canonical Mubadala identity or exact exception changed");
  const current = issue.current;
  if (current.linkedFundName !== null || current.fundAttribution !== "DISCLOSED" || current.attributedFundName !== "MIC TI Holding LLC"
    || current.attributionConfidence !== null) throw new Error("Mubadala metadata boundary changed");
  const recommended = { linkedFundName: null, fundAttribution: "DIRECT_PROGRAM", attributedFundName: null, attributionConfidence: null,
    attributionRationale: "The existing 2023 DOE-filed ownership notice identifies MIC as an indirect wholly owned subsidiary of Mubadala, a sovereign investor managing capital for the Government of Abu Dhabi. This supports direct sovereign-program attribution, not a distinct MIC TI Holding LLC fund. Preserve the separately verified MIC TI Holding Company 2 RSC Limited legal vehicle and all exact project-stake exceptions." };
  const primary = RIO_GRANDE_SOURCES[0];
  const fields = ["fundAttribution", "attributedFundName", "attributionRationale"] as const;
  const fieldDecisions = fields.map(field => ({ field, outsideOriginal603: true,
    disposition: "SOURCE_SUPPORTED_CORRECTION_REQUIRED_NOT_AUTHORIZED_BY_THIS_REPORT", current: current[field], seed: current[field], recommended: recommended[field],
    primarySourceUrl: primary.url, primarySourceSha256: primary.sha256, primaryOneBasedPage: 6, productionWriteRequired: true, seedPersistenceRequired: true }));
  return { schemaVersion: 1, artifactType: "PORTCO_RIO_MUBADALA_FIELD_AUTHORITY", priorAuthoritySha256: input.rioAuthority.reportSha256,
    chronologySha256: prior.chronologySha256, canonicalProposalSha256: prior.canonicalProposalSha256,
    canonicalApprovalSha256: prior.canonicalApprovalSha256, canonicalReceiptSha256: prior.canonicalReceiptSha256,
    originalAttributionReceiptSha256: prior.originalAttributionReceiptSha256, subsequentAttributionReceiptSha256: prior.subsequentAttributionReceiptSha256,
    seedManifestSha256: prior.seedManifestSha256, seedSpecSha256: prior.seedSpecSha256, semanticCompanySha256: prior.semanticCompanySha256,
    companyId: RIO_GRANDE_COMPANY, ownershipPeriodId: RIO_MUBADALA_OWNER, recordId: issue.recordId, originalRecordId: issue.originalRecordId,
    candidateFieldsAdjudicated: 0, cumulativeCandidateFieldsAdjudicated: 57, remainingCandidateFields: 546, additionalFieldsOutsideOriginal603: 3,
    current, recommendedAttribution: recommended, fieldDecisions,
    interpretation: "MIC is a sovereign investor's wholly owned holding subsidiary, not a separately disclosed managed infrastructure fund. DIRECT_PROGRAM is supported by the filed ownership description; fund not publicly disclosed is preserved and no named managed fund is inferred.",
    preserves: { ...core[0], remainingOwnerIds: image.ownershipPeriods.filter(row => row.id !== RIO_MUBADALA_OWNER).map(row => row.id),
      pendingTransactions: 0, redirects: 0, linkedFunds: 0, physicalComparisonsUnchanged: true },
    qualifications: ["This resolves the separate PR928 equality-blind issue without altering its frozen report or counting three fields against the original603.",
      "The sole primary is the already-frozen original DOE filing, page6, reused without a new network capture. The complete page and footnotes were visually inspected again for this separate judgment.",
      "The source's minimum Phase1 6.57% is not a combined-terminal stake. Train4 5.2% and the unallocated Train5 combined13.2% are preserved from the canonical packet, not inferred from the 2023 filing.",
      "Mubadala's separate Nineteenth Investment Company interest in NextDecade Parent is not this project holding vehicle and is not added to the project stake.",
      "The research's Mubadala Investment Company PJSC organization label does not authorize renaming the materialized Mubadala organization. No identity, legal-vehicle, stake, year, fund-economics or September2026 ownership update is made.",
      "All source hashes, canonical/seed/receipt lineage and the prior five-owner proof are checked against fresh READ ONLY production. Receipt backing and seed equality are not sole substantive authority.",
      "This authority report is not an apply manifest. Three production-field and three seed-field corrections remain for a separately protected persistence step."],
    databaseWrites: 0, seedChanges: 0, sourceTransitions: 0, applyAuthorized: false, completionAllowed: false };
}
