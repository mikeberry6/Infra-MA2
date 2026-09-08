/** Metadata-only proof of an already-existing evaluated seed owner. No DB access. */
import { z } from "zod";
import type { PortCo, PortCoOwner } from "../../prisma/seed-data/portco-types";
import type { Company } from "./batch";
import { sha256Canonical } from "../portco-reconciliation/hash";
import { attributionSeedRecordSchema } from "../portfolio-fund-attribution/schema";

const text = z.string().min(1), hash = z.string().regex(/^[a-f0-9]{64}$/);
export const SEED_IDENTITY_INPUTS = [
  "prisma/seed-data/companies.ts", "prisma/seed-data/approved-portco-after-images.ts",
  "prisma/seed-data/approved-portco-after-images.json", "prisma/seed-data/chicago-seed-state-persistence.ts",
  "prisma/seed-data/portco-types.ts", "prisma/entity-resolution.ts", "prisma/seed-runner.ts",
] as const;
const rawOwnerSchema = z.strictObject({
  investmentFirm: text, ownershipVehicle: z.string(), fundName: z.string().optional(), vehicleName: z.string().optional(),
  investmentYear: z.number().int().optional(), exitYear: z.number().int().optional(), stake: z.string().optional(),
  status: z.enum(["Active", "Realized"]), transactionState: z.enum(["CLOSED_ACTIVE", "SIGNED_PENDING_EXIT", "REALIZED"]).optional(),
  fundAttribution: z.enum(["DISCLOSED", "INFERRED", "DIRECT_PROGRAM", "UNRESOLVED"]).optional(),
  attributedFundName: z.string().optional(), attributionConfidence: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  attributionRationale: z.string().optional(),
});
export const seedIdentitySchema = z.strictObject({
  schemaVersion: z.literal(1), artifactType: z.literal("PORTCO_EVALUATED_SEED_IDENTITY"),
  dependencies: z.array(z.strictObject({ path: text, sha256: hash })), evaluatedCompaniesSha256: hash,
  companies: z.array(z.strictObject({ name: text, country: text, companySha256: hash,
    owners: z.array(z.strictObject({ raw: rawOwnerSchema, organizationName: text,
      vehicleName: text, fundLookupName: z.string(), transactionState: z.enum(["CLOSED_ACTIVE", "SIGNED_PENDING_EXIT", "REALIZED"]) })).min(1),
  })).min(1).max(10), proofSha256: hash,
});
export type SeedIdentity = z.infer<typeof seedIdentitySchema>;
type SeedRecord = z.infer<typeof attributionSeedRecordSchema>;
const same = (a: unknown, b: unknown) => sha256Canonical(a) === sha256Canonical(b);
const companyKey = (c: { name: string; country: string }) => `${c.name.trim().toLowerCase()}\0${c.country.trim().toLowerCase()}`;
export function seedOverlayKey(r: Pick<SeedRecord, "companyName" | "country" | "investmentFirm" | "currentVehicleName" | "investmentYear" | "stake">) {
  return [r.companyName, r.country, r.investmentFirm, r.currentVehicleName, r.investmentYear ?? "", r.stake ?? ""].join("\0");
}
export function seedOwnerKey(c: SeedIdentity["companies"][number], o: SeedIdentity["companies"][number]["owners"][number]) {
  return { companyName: c.name, country: c.country, investmentFirm: o.raw.investmentFirm,
    currentVehicleName: o.vehicleName, investmentYear: o.raw.investmentYear ?? null, stake: o.raw.stake ?? null };
}
export function insertedOverlayId(key: Parameters<typeof seedOverlayKey>[0]) {
  return `OFA-HIST-${sha256Canonical(key).slice(0, 24).toUpperCase()}`;
}
export function verifySeedIdentity(value: unknown, files: Map<string, string>) {
  const proof = seedIdentitySchema.parse(value), { proofSha256, ...content } = proof;
  if (sha256Canonical(content) !== proofSha256) throw Error("Invalid evaluated seed proof hash");
  if (!same(proof.dependencies.map(d => d.path).sort(), [...SEED_IDENTITY_INPUTS].sort())) throw Error("Complete seed input/resolver dependencies required");
  for (const d of proof.dependencies) if (files.get(d.path) !== d.sha256) throw Error(`Stale evaluated seed input: ${d.path}`);
  if (new Set(proof.companies.map(companyKey)).size !== proof.companies.length) throw Error("Ambiguous evaluated seed company");
  for (const c of proof.companies) {
    const fullKeys = c.owners.map(o => seedOverlayKey(seedOwnerKey(c, o)));
    // The actual seed runner drops owners by company ID | organization ID | vehicle | year,
    // not by stake, status or exit year. Equal resolved organization names mean the same ID.
    const dedupeKeys = c.owners.map(o => `${o.organizationName}|${o.vehicleName}|${o.raw.investmentYear ?? ""}`);
    if (new Set(fullKeys).size !== fullKeys.length || new Set(dedupeKeys).size !== dedupeKeys.length) throw Error("Seed owner key/dedupe collision");
  }
  return proof;
}

/** Caller supplies the real evaluated companies and existing seed resolvers, never research guesses. */
export function buildSeedIdentity(input: { companies: readonly PortCo[]; selected: { name: string; country: string }[];
  dependencies: SeedIdentity["dependencies"]; resolveOrganization: (name: string) => string;
  resolveOwnership: (owner: PortCoOwner) => Pick<SeedIdentity["companies"][number]["owners"][number], "vehicleName" | "fundLookupName" | "transactionState"> }) {
  const companies = input.selected.map(selected => {
    const candidates = input.companies.filter(c => companyKey(c) === companyKey(selected));
    if (candidates.length !== 1 || candidates[0].name !== selected.name || candidates[0].country !== selected.country) throw Error("Exact unique evaluated seed company required");
    const c = candidates[0];
    const rawOwners = c.owners?.length ? c.owners : [{ investmentFirm: c.investmentFirm, ownershipVehicle: c.ownershipVehicle,
      investmentYear: c.investmentYear, status: c.status }];
    return { name: c.name, country: c.country, companySha256: sha256Canonical(c),
      owners: rawOwners.map(raw => ({ raw, organizationName: input.resolveOrganization(raw.investmentFirm), ...input.resolveOwnership(raw) })) };
  });
  // Normalize optional undefined properties exactly as they will be serialized on disk.
  const content = JSON.parse(JSON.stringify({ schemaVersion: 1, artifactType: "PORTCO_EVALUATED_SEED_IDENTITY",
    dependencies: input.dependencies, evaluatedCompaniesSha256: sha256Canonical(input.companies), companies }));
  return verifySeedIdentity({ ...content, proofSha256: sha256Canonical(content) }, new Map(input.dependencies.map(d => [d.path, d.sha256])));
}

export function proveSeedOwner(proof: SeedIdentity, company: Company, ownerId: string) {
  const c = proof.companies.find(c => c.name === company.image.name && c.country === company.image.country);
  const owner = company.owners.find(o => o.id === ownerId), core = company.image.ownershipPeriods.find(o => o.id === ownerId);
  if (!c || !owner?.organizationId || !core?.organizationName) throw Error("Existing seed/production organization identity required");
  for (const other of company.owners) {
    const otherCore = company.image.ownershipPeriods.find(p => p.id === other.id)!;
    if ((other.organizationId === owner.organizationId) !== (otherCore.organizationName === core.organizationName)) throw Error("Conflicting production organization identity");
  }
  const matches = c.owners.filter(o => o.organizationName === core.organizationName && o.vehicleName === core.vehicleName
    && (o.raw.investmentYear || null) === core.investmentYear && (o.raw.stake || null) === core.stake
    && (o.raw.exitYear || null) === core.exitYear && (o.raw.status === "Active") === core.isActive
    && o.transactionState === core.transactionState);
  if (matches.length !== 1) throw Error("Exact existing seed owner identity/state required");
  const o = matches[0];
  // A second production row under the seed runner's coarser dedupe key is also unsafe.
  if (company.image.ownershipPeriods.filter(p => p.organizationName === core.organizationName && p.vehicleName === core.vehicleName
    && p.investmentYear === core.investmentYear).length !== 1) throw Error("Production owner dedupe collision");
  const key = seedOwnerKey(c, o);
  // Reject empty-string / zero normalization mismatches between overlay lookup and DB fields.
  if (key.stake !== core.stake || key.investmentYear !== core.investmentYear) throw Error("Seed key normalization differs from production");
  return { key, raw: o.raw };
}

/** Verify the seed runner's effective metadata, including inline values overriding the overlay. */
export function assertEffectiveSeedState(raw: PortCoOwner, record: SeedRecord, desired: {
  linkedFundName: string | null; fundAttribution: string; attributedFundName: string | null;
  attributionConfidence: string | null; attributionRationale: string | null;
}, seedOnlyRationale?: string) {
  const actual = { linkedFundName: record.targetLinkedFundName,
    fundAttribution: raw.fundAttribution ?? record.fundAttribution,
    attributedFundName: raw.attributedFundName ?? record.attributedFundName,
    attributionConfidence: raw.attributionConfidence ?? record.attributionConfidence,
    attributionRationale: raw.attributionRationale ?? record.attributionRationale };
  const expected = { ...desired, attributionRationale: seedOnlyRationale ?? desired.attributionRationale };
  if (!same(actual, expected)) throw Error("Inline seed override/effective after-state differs");
}
