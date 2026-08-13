import { open, readFile, rename } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { baseCompanies } from "../../prisma/seed-data/companies";
import {
  applyApprovedPortCoAfterImages,
  type ApprovedPortCoAfterImage,
} from "../../prisma/seed-data/approved-portco-after-images";
import type { PortCo } from "../../prisma/seed-data/portco-types";
import {
  companyImageSha256,
  verifyApproval,
  verifyDatasetSnapshot,
  verifyProposal,
} from "./artifacts";
import { sha256Canonical, sha256Text } from "./hash";
import type {
  CompanyImage,
  ProductionSnapshot,
  ReconciliationApproval,
  ReconciliationProposal,
  ReviewedSeedRetirement,
} from "./schema";

const APPROVED_SEED_BASENAME = "approved-portco-after-images.json";

interface SeedOwner {
  investmentFirm: string;
  ownershipVehicle: string;
  fundName?: string;
  vehicleName?: string;
  investmentYear?: number;
  exitYear?: number;
  stake?: string;
  status: "Active" | "Realized";
  transactionState: "CLOSED_ACTIVE" | "SIGNED_PENDING_EXIT" | "REALIZED";
}

interface SeedPortCo {
  name: string;
  investmentFirm: string;
  sector: string;
  subsector: string;
  region: string;
  country: string;
  ownershipVehicle: string;
  description: string;
  status: "Active" | "Realized";
  countryTags: string[];
  website?: string;
  yearFounded?: number;
  investmentYear?: number;
  headquarters?: string;
  milestones: Array<{ date: string; event: string; category: string }>;
  management: Array<{ name: string; title: string }>;
  sources: Array<{
    label: string;
    url: string;
    type: string;
    purpose: string;
    evidenceLabel?: string;
  }>;
  owners: SeedOwner[];
}

const sectorForSeed: Record<string, string> = {
  POWER_ET: "Power & ET",
  UTILITIES: "Utilities",
  DIGITAL: "Digital",
  MIDSTREAM: "Midstream",
  TRANSPORTATION: "Transportation",
  SOCIAL_INFRA: "Social Infra",
};

const regionForSeed: Record<string, string> = {
  NORTH_AMERICA: "North America",
  EUROPE: "Europe",
  ASIA_PACIFIC: "Asia-Pacific",
  LATIN_AMERICA: "Latin America",
  GLOBAL: "Global",
};

const milestoneForSeed: Record<string, string> = {
  FOUNDING: "Founding",
  ACQUISITION: "Acquisition",
  FINANCING: "Financing",
  EXPANSION: "Expansion",
  MANAGEMENT: "Management",
  DIVESTITURE: "Divestiture",
  IPO: "IPO",
  OTHER: "Other",
};

function seedDisplay(value: string, values: Record<string, string>): string {
  return values[value] ?? value;
}

export interface ApprovedSeedEntry {
  proposalSha256: string;
  approvalSha256: string;
  afterImageSha256: string;
  taskId: string;
  operation: "UPSERT" | "MERGE" | "ARCHIVE";
  company: SeedPortCo;
  retiredCompanies: Array<{ name: string; country: string }>;
  reviewedSeedRetirements?: ReviewedSeedRetirement[];
  /**
   * The legacy seed projection cannot express pending transactions, citation
   * primacy, or historical management. Retain the complete approved image so
   * no approved fact is lost and future seed loaders can restore it exactly.
   */
  canonicalAfterImage: CompanyImage;
}

export interface ApprovedSeedPublication {
  artifactPath: string;
  artifactSha256: string;
  afterImageSha256: string;
  proposalSha256: string;
  approvalSha256: string;
  approvedSeedEntrySha256: string;
}

function companyIdentityKey(company: { name: string; country: string }): string {
  return `${company.name.trim().toLowerCase()}\u0000${company.country.trim().toLowerCase()}`;
}

function seedPortCo(image: CompanyImage): SeedPortCo {
  const owners: SeedOwner[] = image.ownershipPeriods.map((owner) => ({
    investmentFirm: owner.organizationName ?? owner.managerName,
    ownershipVehicle: owner.fundName ?? owner.vehicleName ?? owner.managerName,
    ...(owner.fundName === null ? {} : { fundName: owner.fundName }),
    ...(owner.vehicleName === null ? {} : { vehicleName: owner.vehicleName }),
    ...(owner.investmentYear === null ? {} : { investmentYear: owner.investmentYear }),
    ...(owner.exitYear === null ? {} : { exitYear: owner.exitYear }),
    ...(owner.stake === null ? {} : { stake: owner.stake }),
    status: owner.transactionState === "REALIZED" ? "Realized" : "Active",
    transactionState: owner.transactionState,
  }));
  const focalOwner = owners.find((owner) => owner.status === "Active") ?? owners[0];
  if (!focalOwner) throw new Error("An approved seed company requires at least one ownership period");
  return {
    name: image.name,
    investmentFirm: focalOwner.investmentFirm,
    sector: seedDisplay(image.sector, sectorForSeed),
    subsector: image.subsector,
    region: seedDisplay(image.region, regionForSeed),
    country: image.country,
    ownershipVehicle: focalOwner.ownershipVehicle,
    description: image.description,
    status: image.companyStatus === "ACTIVE" ? "Active" : "Realized",
    countryTags: image.countryTags,
    ...(image.website === null ? {} : { website: image.website }),
    ...(image.yearFounded === null ? {} : { yearFounded: image.yearFounded }),
    ...(focalOwner.investmentYear === undefined ? {} : { investmentYear: focalOwner.investmentYear }),
    ...(image.headquarters === null ? {} : { headquarters: image.headquarters }),
    milestones: image.milestones.map(({ date, event, category }) => ({
      date,
      event,
      category: seedDisplay(category, milestoneForSeed),
    })),
    management: image.managementRoles
      .filter((role) => role.isCurrent)
      .map((role) => ({ name: role.personName, title: role.title })),
    sources: image.citations.map((citation) => ({
      label: citation.label,
      url: citation.url,
      type: citation.sourceType,
      purpose: citation.purpose,
      ...(citation.evidenceLabel === null ? {} : { evidenceLabel: citation.evidenceLabel }),
    })),
    owners,
  };
}

export function buildApprovedSeedEntry(
  proposal: ReconciliationProposal,
  approval: ReconciliationApproval,
  approvedProductionSnapshot?: ProductionSnapshot,
): ApprovedSeedEntry {
  const verifiedProposal = verifyProposal(proposal);
  const verifiedApproval = verifyApproval(approval, verifiedProposal);
  if (verifiedApproval.decision !== "APPROVE" || verifiedProposal.afterImage === null) {
    throw new Error("Only an approved proposal with an after-image can enter the seed ledger");
  }
  if (approvedProductionSnapshot) {
    const snapshot = verifyDatasetSnapshot(approvedProductionSnapshot);
    if (
      snapshot.artifactType !== "PORTCO_PRODUCTION_SNAPSHOT"
      || snapshot.snapshotSha256 !== verifiedProposal.productionSnapshotSha256
    ) {
      throw new Error("Seed publication snapshot is not the proposal-bound production snapshot");
    }
  }
  const afterImageSha256 = companyImageSha256(verifiedProposal.afterImage);
  if (
    afterImageSha256 !== verifiedProposal.afterImageSha256
    || afterImageSha256 !== verifiedApproval.approvedAfterImageSha256
  ) {
    throw new Error("Seed after-image is not the exact approved company image");
  }
  const snapshotById = new Map(
    approvedProductionSnapshot?.companies.flatMap((company) =>
      company.id ? [[company.id, company] as const] : []) ?? [],
  );
  const retiredCompanies = verifiedProposal.retiredCompanyIds.map((id) => {
    const retired = snapshotById.get(id);
    if (!retired) {
      throw new Error(`Approved production snapshot is required to resolve retired seed company ${id}`);
    }
    return { name: retired.name, country: retired.country };
  });
  retiredCompanies.push(...(verifiedProposal.reviewedSeedRetirements ?? []).map((retirement) => ({
    name: retirement.name,
    country: retirement.country,
  })));
  if (
    verifiedProposal.beforeImage
    && companyIdentityKey(verifiedProposal.beforeImage)
      !== companyIdentityKey(verifiedProposal.afterImage)
  ) {
    retiredCompanies.push({
      name: verifiedProposal.beforeImage.name,
      country: verifiedProposal.beforeImage.country,
    });
  }
  const uniqueRetiredCompanies = retiredCompanies.filter((company, index, rows) =>
    rows.findIndex((candidate) => companyIdentityKey(candidate) === companyIdentityKey(company)) === index);
  return {
    proposalSha256: verifiedProposal.proposalSha256,
    approvalSha256: verifiedApproval.approvalSha256,
    afterImageSha256,
    taskId: verifiedProposal.taskId,
    operation: verifiedProposal.afterImage.recordStatus === "ARCHIVED"
      ? "ARCHIVE"
      : verifiedProposal.retiredCompanyIds.length > 0
        || (verifiedProposal.reviewedSeedRetirements?.length ?? 0) > 0
        ? "MERGE"
        : "UPSERT",
    company: seedPortCo(verifiedProposal.afterImage),
    retiredCompanies: uniqueRetiredCompanies,
    ...(verifiedProposal.reviewedSeedRetirements === undefined
      ? {}
      : { reviewedSeedRetirements: verifiedProposal.reviewedSeedRetirements }),
    canonicalAfterImage: verifiedProposal.afterImage,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function renderApprovedSeedArtifact(
  existing: unknown,
  entry: ApprovedSeedEntry,
): string {
  if (!Array.isArray(existing) || existing.some((item) => !isRecord(item))) {
    throw new Error("Approved PortCo seed artifact must be a JSON array of objects");
  }
  const sameHash = existing.filter((item) => item.proposalSha256 === entry.proposalSha256);
  if (sameHash.length > 1) throw new Error("Approved seed artifact repeats the proposal hash");
  if (sameHash.length === 1 && sha256Canonical(sameHash[0]) !== sha256Canonical(entry)) {
    throw new Error("An immutable approved seed proposal hash already has different contents");
  }
  const next = sameHash.length === 1 ? existing : [...existing, entry];
  return `${JSON.stringify(next, null, 2)}\n`;
}

type ApprovedSeedExpectation = ApprovedSeedEntry | (
  Pick<ApprovedSeedEntry, "proposalSha256" | "approvalSha256" | "afterImageSha256">
  & { approvedSeedEntrySha256: string }
);

function expectedApprovedSeedEntrySha256(expected: ApprovedSeedExpectation): string {
  return "approvedSeedEntrySha256" in expected
    ? expected.approvedSeedEntrySha256
    : sha256Canonical(expected);
}

export function verifyApprovedSeedText(text: string, expected: ApprovedSeedExpectation): void {
  const parsed: unknown = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error("Approved seed artifact is not an array");
  const matches = parsed.filter((item): item is Record<string, unknown> =>
    isRecord(item) && item.proposalSha256 === expected.proposalSha256);
  if (matches.length !== 1) throw new Error("Approved seed artifact must contain the proposal exactly once");
  const match = matches[0];
  if (
    match.approvalSha256 !== expected.approvalSha256
    || match.afterImageSha256 !== expected.afterImageSha256
  ) {
    throw new Error("Published seed entry is not bound to the approved after-image");
  }
  if (sha256Canonical(match) !== expectedApprovedSeedEntrySha256(expected)) {
    throw new Error("Published seed entry does not exactly match the proposal-derived entry");
  }
  if (!isRecord(match.canonicalAfterImage)) throw new Error("Published seed entry lacks the complete after-image");
  if (companyImageSha256(match.canonicalAfterImage as CompanyImage) !== expected.afterImageSha256) {
    throw new Error("Published seed canonical after-image hash mismatch");
  }
}

function approvedAfterImages(value: unknown): ApprovedPortCoAfterImage[] {
  if (!Array.isArray(value) || value.some((item) => !isRecord(item))) {
    throw new Error("Approved PortCo seed artifact must be a JSON array of objects");
  }
  for (const [index, item] of value.entries()) {
    if (
      typeof item.proposalSha256 !== "string"
      || typeof item.taskId !== "string"
      || !["UPSERT", "MERGE", "ARCHIVE"].includes(String(item.operation))
      || !isRecord(item.company)
      || typeof item.company.name !== "string"
      || typeof item.company.country !== "string"
      || !Array.isArray(item.retiredCompanies)
    ) {
      throw new Error(`Approved PortCo seed entry ${index} is malformed`);
    }
  }
  return value as ApprovedPortCoAfterImage[];
}

function exactSeedCompany(
  companies: readonly PortCo[],
  identity: { name: string; country: string },
  label: string,
): PortCo {
  const key = companyIdentityKey(identity);
  const matches = companies.filter((company) => companyIdentityKey(company) === key);
  if (matches.length !== 1) {
    throw new Error(
      `${label} seed identity ${identity.name} | ${identity.country} resolved to ${matches.length} entries`,
    );
  }
  return matches[0];
}

export function verifyApprovedSeedProjection(input: {
  artifact: unknown;
  expectedEntry: ApprovedSeedEntry;
  rawSeedCompanies?: readonly PortCo[];
}): void {
  const overlays = approvedAfterImages(input.artifact);
  const expected = input.expectedEntry;
  const raw = input.rawSeedCompanies ?? baseCompanies;
  const matchingIndexes = overlays
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.proposalSha256 === expected.proposalSha256)
    .map(({ index }) => index);
  if (matchingIndexes.length > 1) {
    throw new Error("Approved seed artifact repeats the proposal hash");
  }
  if (
    matchingIndexes.length === 1
    && sha256Canonical(overlays[matchingIndexes[0]]) !== sha256Canonical(expected)
  ) {
    throw new Error("Approved seed artifact contains a changed proposal-derived entry");
  }
  const beforeOverlays = overlays.filter((entry) => entry.proposalSha256 !== expected.proposalSha256);
  const evaluatedBefore = applyApprovedPortCoAfterImages([...raw], beforeOverlays);
  for (const retirement of expected.reviewedSeedRetirements ?? []) {
    const rawEntry = exactSeedCompany(raw, retirement, "Raw");
    if (sha256Canonical(rawEntry) !== retirement.rawSeedEntrySha256) {
      throw new Error(`Raw seed entry changed for ${retirement.sourceQueueTaskId}`);
    }
    const evaluatedEntry = exactSeedCompany(evaluatedBefore, retirement, "Evaluated pre-proposal");
    if (sha256Canonical(evaluatedEntry) !== retirement.evaluatedSeedEntrySha256) {
      throw new Error(`Evaluated seed entry changed for ${retirement.sourceQueueTaskId}`);
    }
  }
  const fullOverlays = matchingIndexes.length === 0
    ? [...overlays, expected as unknown as ApprovedPortCoAfterImage]
    : overlays;
  const evaluatedAfter = applyApprovedPortCoAfterImages([...raw], fullOverlays);
  const canonicalKey = companyIdentityKey(expected.company);
  const canonicalMatches = evaluatedAfter.filter((company) => companyIdentityKey(company) === canonicalKey);
  if (expected.operation === "ARCHIVE") {
    if (canonicalMatches.length !== 0) throw new Error("Archived seed company remains in evaluated data");
  } else {
    if (canonicalMatches.length !== 1 || sha256Canonical(canonicalMatches[0]) !== sha256Canonical(expected.company)) {
      throw new Error("Evaluated seed data does not contain exactly the approved canonical after-image");
    }
  }
  for (const retirement of expected.reviewedSeedRetirements ?? []) {
    if (companyIdentityKey(retirement) === canonicalKey && expected.operation !== "ARCHIVE") continue;
    if (evaluatedAfter.some((company) => companyIdentityKey(company) === companyIdentityKey(retirement))) {
      throw new Error(`Retired seed identity remains after overlay: ${retirement.name} | ${retirement.country}`);
    }
  }
}

/**
 * Publish the approved local seed artifact with an adjacent atomic rename.
 * This deliberately occurs before any database transaction. A later database
 * failure may leave a recoverable local seed edit, but can never leave the
 * database ahead of the seed. No automatic rollback or deletion is attempted.
 */
export async function publishApprovedSeedAfterImage(input: {
  artifactPath: string;
  proposal: ReconciliationProposal;
  approval: ReconciliationApproval;
  approvedProductionSnapshot: ProductionSnapshot;
}): Promise<ApprovedSeedPublication> {
  const artifactPath = resolve(input.artifactPath);
  if (!artifactPath.endsWith(`/${APPROVED_SEED_BASENAME}`)) {
    throw new Error(`Seed writes are target-pinned to ${APPROVED_SEED_BASENAME}`);
  }
  const entry = buildApprovedSeedEntry(
    input.proposal,
    input.approval,
    input.approvedProductionSnapshot,
  );
  const currentText = await readFile(artifactPath, "utf8");
  const currentArtifact: unknown = JSON.parse(currentText);
  verifyApprovedSeedProjection({ artifact: currentArtifact, expectedEntry: entry });
  const rendered = renderApprovedSeedArtifact(currentArtifact, entry);
  const temporaryPath = `${artifactPath}.stage-${process.pid}-${Date.now()}`;
  const handle = await open(temporaryPath, "wx", 0o600);
  try {
    await handle.writeFile(rendered, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  await rename(temporaryPath, artifactPath);
  const directory = await open(dirname(artifactPath), "r");
  try {
    await directory.sync();
  } finally {
    await directory.close();
  }
  const publishedText = await readFile(artifactPath, "utf8");
  verifyApprovedSeedText(publishedText, entry);
  verifyApprovedSeedProjection({
    artifact: JSON.parse(publishedText) as unknown,
    expectedEntry: entry,
  });
  return {
    artifactPath,
    artifactSha256: sha256Text(publishedText),
    afterImageSha256: entry.afterImageSha256,
    proposalSha256: entry.proposalSha256,
    approvalSha256: entry.approvalSha256,
    approvedSeedEntrySha256: sha256Canonical(entry),
  };
}

export async function verifyPublishedApprovedSeedAfterImage(
  publication: ApprovedSeedPublication,
): Promise<void> {
  const text = await readFile(publication.artifactPath, "utf8");
  if (sha256Text(text) !== publication.artifactSha256) {
    throw new Error("Approved seed artifact bytes changed after publication");
  }
  verifyApprovedSeedText(text, publication);
}

export async function removeStagedApprovedSeedAfterImage(input: {
  artifactPath: string;
  proposal: ReconciliationProposal;
  approval: ReconciliationApproval;
  approvedProductionSnapshot: ProductionSnapshot;
}): Promise<{ artifactPath: string; artifactSha256: string; removedProposalSha256: string }> {
  const artifactPath = resolve(input.artifactPath);
  if (!artifactPath.endsWith(`/${APPROVED_SEED_BASENAME}`)) {
    throw new Error(`Seed writes are target-pinned to ${APPROVED_SEED_BASENAME}`);
  }
  const entry = buildApprovedSeedEntry(
    input.proposal,
    input.approval,
    input.approvedProductionSnapshot,
  );
  const current: unknown = JSON.parse(await readFile(artifactPath, "utf8"));
  if (!Array.isArray(current) || current.some((item) => !isRecord(item))) {
    throw new Error("Approved PortCo seed artifact must be a JSON array of objects");
  }
  const matches = current.filter((item) => item.proposalSha256 === entry.proposalSha256);
  if (matches.length !== 1 || sha256Canonical(matches[0]) !== sha256Canonical(entry)) {
    throw new Error("Staged seed entry is missing or changed");
  }
  const rendered = `${JSON.stringify(
    current.filter((item) => item.proposalSha256 !== entry.proposalSha256),
    null,
    2,
  )}\n`;
  const temporaryPath = `${artifactPath}.unstage-${process.pid}-${Date.now()}`;
  const handle = await open(temporaryPath, "wx", 0o600);
  try {
    await handle.writeFile(rendered, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  await rename(temporaryPath, artifactPath);
  const directory = await open(dirname(artifactPath), "r");
  try {
    await directory.sync();
  } finally {
    await directory.close();
  }
  if (JSON.parse(await readFile(artifactPath, "utf8")).some(
    (item: Record<string, unknown>) => item.proposalSha256 === entry.proposalSha256,
  )) {
    throw new Error("Staged seed entry remained after removal");
  }
  return {
    artifactPath,
    artifactSha256: sha256Text(rendered),
    removedProposalSha256: entry.proposalSha256,
  };
}

export async function supersedeStagedApprovedSeedAfterImage(input: {
  artifactPath: string;
  supersededProposal: ReconciliationProposal;
  supersededApproval: ReconciliationApproval;
  supersedingProposal: ReconciliationProposal;
  supersedingApproval: ReconciliationApproval;
}): Promise<{ artifactPath: string; artifactSha256: string; removedProposalSha256: string }> {
  const artifactPath = resolve(input.artifactPath);
  if (!artifactPath.endsWith(`/${APPROVED_SEED_BASENAME}`)) {
    throw new Error(`Seed writes are target-pinned to ${APPROVED_SEED_BASENAME}`);
  }
  const superseded = buildApprovedSeedEntry(input.supersededProposal, input.supersededApproval);
  const superseding = buildApprovedSeedEntry(input.supersedingProposal, input.supersedingApproval);
  if (
    superseded.taskId !== superseding.taskId
    || input.supersededProposal.taskIndex !== input.supersedingProposal.taskIndex
    || input.supersededProposal.companyName !== input.supersedingProposal.companyName
  ) {
    throw new Error("Only proposals for the same exact task may supersede a staged seed entry");
  }
  if (superseded.proposalSha256 === superseding.proposalSha256) {
    throw new Error("Superseded and superseding proposal hashes must differ");
  }
  const current: unknown = JSON.parse(await readFile(artifactPath, "utf8"));
  if (!Array.isArray(current) || current.some((item) => !isRecord(item))) {
    throw new Error("Approved PortCo seed artifact must be a JSON array of objects");
  }
  const oldMatches = current.filter((item) => item.proposalSha256 === superseded.proposalSha256);
  const newMatches = current.filter((item) => item.proposalSha256 === superseding.proposalSha256);
  if (oldMatches.length !== 1 || sha256Canonical(oldMatches[0]) !== sha256Canonical(superseded)) {
    throw new Error("Superseded staged seed entry is missing or changed");
  }
  if (newMatches.length > 1 || (newMatches.length === 1
    && sha256Canonical(newMatches[0]) !== sha256Canonical(superseding))) {
    throw new Error("Superseding staged seed entry is duplicated or changed");
  }
  const preReplacement = current.filter((item) =>
    item.proposalSha256 !== superseded.proposalSha256
    && item.proposalSha256 !== superseding.proposalSha256);
  verifyApprovedSeedProjection({ artifact: preReplacement, expectedEntry: superseding });
  const replacement = current.flatMap((item) => {
    if (item.proposalSha256 === superseded.proposalSha256) return [superseding];
    if (item.proposalSha256 === superseding.proposalSha256) return [];
    return [item];
  });
  const rendered = `${JSON.stringify(replacement, null, 2)}\n`;
  const temporaryPath = `${artifactPath}.supersede-${process.pid}-${Date.now()}`;
  const handle = await open(temporaryPath, "wx", 0o600);
  try {
    await handle.writeFile(rendered, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  await rename(temporaryPath, artifactPath);
  const directory = await open(dirname(artifactPath), "r");
  try {
    await directory.sync();
  } finally {
    await directory.close();
  }
  const publishedText = await readFile(artifactPath, "utf8");
  verifyApprovedSeedText(publishedText, superseding);
  verifyApprovedSeedProjection({
    artifact: JSON.parse(publishedText) as unknown,
    expectedEntry: superseding,
  });
  return {
    artifactPath,
    artifactSha256: sha256Text(rendered),
    removedProposalSha256: superseded.proposalSha256,
  };
}
