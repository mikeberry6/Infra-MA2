/** Read-only semantic ownership contract. Never supplies a database write payload. */
import type { PortCo, PortCoOwner } from "../../prisma/seed-data/portco-types";
import { resolveOrgName } from "../../prisma/entity-resolution";
import { resolveSeedOwnership } from "../../prisma/seed-runner";
import { projectApprovedSeedOwners, type ApprovedSeedEntry } from "./approved-seed";
import { companyImageSha256, verifyProposal, verifyApproval, verifyApplyReceipt } from "./artifacts";
import { sha256Canonical, hashWithoutField } from "./hash";
import type { CompanyImage } from "./schema";

export interface ObservedOwner {
  id: string;
  organization: { name: string } | null;
  fund: { fundName: string; manager: { name: string } } | null;
  vehicleName: string | null;
  investmentYear: number | null;
  exitYear: number | null;
  stake: string | null;
  isActive: boolean;
  transactionState: string;
}
export interface ObservedCompany {
  id: string;
  name: string;
  country: string;
  status: string;
  companyStatus: string;
  ownershipPeriods: ObservedOwner[];
}
export interface AppliedOwnerProof { proposal: unknown; approval: unknown; receipt: unknown }
export interface SemanticOverlay {
  proposalSha256: string;
  taskId: string;
  operation: string;
  company: PortCo;
  retiredCompanies: Array<{ name: string; country: string }>;
  canonicalAfterImage?: CompanyImage;
  approvalSha256?: string;
  afterImageSha256?: string;
}
interface OwnerCore {
  organizationName: string;
  vehicleName: string | null;
  investmentYear: number | null;
  exitYear: number | null;
  stake: string | null;
  isActive: boolean;
  transactionState: string;
}

const key = (company: { name: string; country: string }) => `${company.name.trim().toLowerCase()}\0${company.country.trim().toLowerCase()}`;
const equal = (left: unknown, right: unknown) => sha256Canonical(left) === sha256Canonical(right);
const sorted = (owners: OwnerCore[]) => owners.map(sha256Canonical).sort();

export function latestSemanticOverlays(overlays: readonly SemanticOverlay[]) {
  const latest = new Map<string, SemanticOverlay>();
  const hashes = new Set<string>();
  for (const entry of overlays) {
    if (!/^[a-f0-9]{64}$/.test(entry.proposalSha256) || hashes.has(entry.proposalSha256)
      || !["UPSERT", "MERGE", "ARCHIVE"].includes(entry.operation)) throw new Error("Invalid/duplicate overlay lineage");
    hashes.add(entry.proposalSha256);
    for (const retired of entry.retiredCompanies) latest.delete(key(retired));
    if (entry.operation === "ARCHIVE") latest.delete(key(entry.company));
    else latest.set(key(entry.company), entry);
  }
  return latest;
}

function legacyCore(owner: PortCoOwner): OwnerCore {
  return { organizationName: resolveOrgName(owner.investmentFirm), vehicleName: resolveSeedOwnership(owner).vehicleName,
    investmentYear: owner.investmentYear ?? null, exitYear: owner.exitYear ?? null, stake: owner.stake ?? null,
    isActive: owner.status === "Active", transactionState: resolveSeedOwnership(owner).transactionState };
}
function richCore(owner: CompanyImage["ownershipPeriods"][number]): OwnerCore {
  return { organizationName: owner.organizationName ?? owner.managerName, vehicleName: owner.vehicleName,
    investmentYear: owner.investmentYear, exitYear: owner.exitYear, stake: owner.stake,
    isActive: owner.isActive, transactionState: owner.transactionState };
}
function observedCore(owner: ObservedOwner): OwnerCore {
  const organizationName = owner.organization?.name ?? owner.fund?.manager.name;
  if (!organizationName || owner.vehicleName === undefined) throw new Error("Observed owner lacks explicit identity/vehicle state");
  return { organizationName, vehicleName: owner.vehicleName, investmentYear: owner.investmentYear,
    exitYear: owner.exitYear, stake: owner.stake, isActive: owner.isActive, transactionState: owner.transactionState };
}

export function buildOwnerSemanticContract(input: {
  companies: readonly PortCo[];
  overlays: readonly SemanticOverlay[];
  production: readonly ObservedCompany[];
  proofs: readonly AppliedOwnerProof[];
  chicagoPlan: { repairSha256: string; canonicalCompanyId: string; after: PortCo };
}) {
  const proofMap = new Map<string, ReturnType<typeof verifyApplyReceipt>>();
  const approved = new Map<string, ReturnType<typeof verifyProposal>>();
  for (const proof of input.proofs) {
    const proposal = verifyProposal(proof.proposal);
    const approval = verifyApproval(proof.approval, proposal);
    const receipt = verifyApplyReceipt(proof.receipt, proposal, approval);
    if (proofMap.has(proposal.proposalSha256)) throw new Error("Duplicate applied proof");
    proofMap.set(proposal.proposalSha256, receipt);
    approved.set(proposal.proposalSha256, proposal);
  }
  const latest = latestSemanticOverlays(input.overlays);
  const seedMap = new Map(input.companies.map((company) => [key(company), company]));
  const productionKeys = input.production.map(key);
  if (seedMap.size !== input.companies.length || new Set(productionKeys).size !== productionKeys.length
    || new Set(input.production.map((company) => company.id)).size !== input.production.length
    || !equal([...seedMap.keys()].sort(), [...productionKeys].sort()) || input.production.some((company) => company.status !== "PUBLISHED")) throw new Error("Published identity collision or parity failure");
  if (input.chicagoPlan.repairSha256 !== "99ff5a36e145fe4403fa6ed14e0195696b3e99e53a1a5875ed6591317af17d0f"
    || hashWithoutField(input.chicagoPlan, "repairSha256") !== input.chicagoPlan.repairSha256) throw new Error("Unverified Chicago presentation binding");
  const usedProofs = new Set<string>();
  const rows = [];
  for (const company of input.production) {
    const seed = seedMap.get(key(company))!;
    const entry = latest.get(key(company));
    const seedOwners: PortCoOwner[] = seed.owners?.length ? seed.owners : [{ investmentFirm: seed.investmentFirm, ownershipVehicle: seed.ownershipVehicle, investmentYear: seed.investmentYear, status: seed.status }];
    const legacy = seedOwners.map(legacyCore);
    let semantic = legacy;
    let authority = "LEGACY_DISPLAY_CORE";
    let projectionVersion: string | null = null;
    let receiptSha256: string | null = null;
    const representationDifferences: Array<{ ownerIndex: number; field: string; semantic: unknown; legacyProjection: unknown }> = [];
    if (entry?.canonicalAfterImage) {
      const proposal = approved.get(entry.proposalSha256);
      const receipt = proofMap.get(entry.proposalSha256);
      if (!proposal || !receipt || !proposal.afterImage || proposal.taskId !== entry.taskId || entry.approvalSha256 !== receipt.approvalSha256
        || entry.afterImageSha256 !== receipt.appliedAfterImageSha256 || companyImageSha256(entry.canonicalAfterImage) !== entry.afterImageSha256
        || !equal(entry.canonicalAfterImage, proposal.afterImage)
        || (receipt.approvedSeedEntrySha256 && receipt.approvedSeedEntrySha256 !== sha256Canonical(entry))) throw new Error(`Unbound canonical ownership: ${company.name}`);
      if (entry.canonicalAfterImage.name !== company.name || entry.canonicalAfterImage.country !== company.country
        || entry.canonicalAfterImage.companyStatus !== company.companyStatus || (receipt.companyId && receipt.companyId !== company.id)
        || (entry.canonicalAfterImage.id && entry.canonicalAfterImage.id !== company.id)
        || !equal(seed, entry.company)) throw new Error(`Canonical/legacy identity or projection changed: ${company.name}`);
      const current = projectApprovedSeedOwners(entry.canonicalAfterImage);
      // f943b55f (#454) introduced separate fundName/vehicleName properties.
      // Reproduce the prior combined-only shape without inferring missing values.
      const historical = current.map(({ fundName: _fundName, vehicleName: _vehicleName, ...owner }) => owner);
      projectionVersion = equal(seedOwners, current) ? "SEPARATE_DISPLAY_FIELDS" : equal(seedOwners, historical) ? "COMBINED_ONLY_PRE_F943B55F" : null;
      if (!projectionVersion) throw new Error(`Unknown legacy projection version: ${company.name}`);
      semantic = entry.canonicalAfterImage.ownershipPeriods.map(richCore);
      if (semantic.length !== legacy.length) throw new Error("Owner cardinality changed");
      for (let index = 0; index < semantic.length; index++) for (const field of Object.keys(semantic[index]) as Array<keyof OwnerCore>) {
        if (!equal(semantic[index][field], legacy[index][field])) representationDifferences.push({ ownerIndex: index, field, semantic: semantic[index][field], legacyProjection: legacy[index][field] });
      }
      authority = "RECEIPT_BACKED_CANONICAL_AFTER_IMAGE";
      receiptSha256 = receipt.receiptSha256;
      usedProofs.add(entry.proposalSha256);
    } else if (company.id === input.chicagoPlan.canonicalCompanyId) {
      if (!equal(seed, input.chicagoPlan.after)) throw new Error("Chicago seed presentation binding changed");
      semantic = legacy.map((owner) => owner.organizationName === "Morgan Stanley Infrastructure Partners" ? { ...owner, organizationName: "MSIP" } : owner);
      representationDifferences.push({ ownerIndex: legacy.findIndex((owner) => owner.organizationName === "Morgan Stanley Infrastructure Partners"), field: "organizationName", semantic: "MSIP", legacyProjection: "Morgan Stanley Infrastructure Partners" });
      authority = "PR918_SCOPED_EXISTING_DISPLAY_BINDING";
    }
    const observed = company.ownershipPeriods.map(observedCore);
    if (!equal(sorted(semantic), sorted(observed))) throw new Error(`Semantic core ownership differs: ${company.name}`);
    rows.push({ companyId: company.id, name: company.name, country: company.country, seedCompanySha256: sha256Canonical(seed), authority, projectionVersion,
      proposalSha256: entry?.canonicalAfterImage ? entry.proposalSha256 : null, receiptSha256,
      semanticOwners: semantic, observedOwners: observed, representationDifferences, coreParity: true });
  }
  if (usedProofs.size !== proofMap.size) throw new Error("Unused or shadowed canonical proofs");
  return { schemaVersion: 1, artifactType: "PORTCO_OWNER_SEMANTIC_CONTRACT", publishedCompanies: rows.length,
    canonicalCompanies: usedProofs.size, canonicalOwners: rows.filter((row) => row.authority === "RECEIPT_BACKED_CANONICAL_AFTER_IMAGE").reduce((sum, row) => sum + row.semanticOwners.length, 0),
    legacyCompanies: rows.filter((row) => row.authority === "LEGACY_DISPLAY_CORE").length, scopedChicagoCompanies: 1,
    representationDifferenceCompanies: rows.filter((row) => row.representationDifferences.length > 0).length,
    rows, coreOwnershipParity: true, fundLinkAttributionParity: "NOT_ADJUDICATED", fullSeedReplayParity: false,
    qualification: "Exact semantic core comparison, not a database write payload or a new ownership finding. For latest applied canonical overlays, preserve explicit null legal vehicles, exact approved organization names, historical states, stakes and dates; validate the retained legacy projection without promoting its display fallback to legal data. Legacy-only records match existing displayed core values, not freshly researched cap tables. PR918 binds Chicago's standing display without resolving task345. Fund links and attribution require separate chronology review. The existing full seed runner remains lossy and must not be replayed to assert this contract." };
}

// Compile-time guard: rich approved entries remain usable without weakening their schema.
export type CanonicalSemanticOverlay = ApprovedSeedEntry & SemanticOverlay;
