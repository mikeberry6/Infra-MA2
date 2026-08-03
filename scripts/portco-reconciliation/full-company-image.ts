import { z } from "zod";
import { companyImageSchema, type CompanyImage } from "./schema";

const nonEmpty = z.string().trim().min(1);
const optionalText = nonEmpty.nullable();
const isoTimestamp = z.string().datetime({ offset: true });
const httpsUrl = z.string().url().refine(
  (value) => value.startsWith("https://"),
  "URL must use HTTPS",
);

const legacyOwnershipSchema = z.strictObject({
  id: nonEmpty,
  fundId: optionalText,
  organizationId: optionalText,
  vehicleName: optionalText,
  stake: optionalText,
  investmentYear: z.number().int().min(1800).max(2200).nullable(),
  exitYear: z.number().int().min(1800).max(2200).nullable(),
  isActive: z.boolean(),
  createdAt: isoTimestamp,
  fund: z.strictObject({
    id: nonEmpty,
    fundName: nonEmpty,
    manager: z.strictObject({ id: nonEmpty, name: nonEmpty }),
  }).nullable(),
  organization: z.strictObject({ id: nonEmpty, name: nonEmpty }).nullable(),
});

const legacyFullCompanySnapshotSchema = z.strictObject({
  id: nonEmpty,
  name: nonEmpty,
  sector: nonEmpty,
  subsector: nonEmpty,
  region: nonEmpty,
  country: nonEmpty,
  countryTags: z.array(nonEmpty),
  description: nonEmpty,
  companyStatus: z.enum(["ACTIVE", "REALIZED"]),
  website: httpsUrl.nullable(),
  yearFounded: z.number().int().min(1800).max(2200).nullable(),
  headquarters: optionalText,
  status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"]),
  lastVerifiedAt: isoTimestamp.nullable(),
  createdAt: isoTimestamp,
  updatedAt: isoTimestamp,
  ownershipPeriods: z.array(legacyOwnershipSchema),
  milestones: z.array(z.strictObject({
    id: nonEmpty,
    date: nonEmpty,
    event: nonEmpty,
    category: nonEmpty,
    sortDate: isoTimestamp.nullable(),
  })),
  managementRoles: z.array(z.strictObject({
    id: nonEmpty,
    title: nonEmpty,
    startDate: isoTimestamp.nullable(),
    endDate: isoTimestamp.nullable(),
    person: z.strictObject({ id: nonEmpty, name: nonEmpty }),
  })),
  citations: z.array(z.strictObject({
    id: nonEmpty,
    isPrimary: z.boolean(),
    purpose: nonEmpty,
    evidenceLabel: optionalText,
    source: z.strictObject({
      id: nonEmpty,
      label: nonEmpty,
      url: httpsUrl,
      type: nonEmpty,
    }),
  })),
  redirects: z.array(z.strictObject({
    retiredId: nonEmpty,
    reason: nonEmpty,
    createdAt: isoTimestamp,
  })),
});

export type LegacyFullCompanySnapshot = z.infer<typeof legacyFullCompanySnapshotSchema>;

function calendarDate(value: string | null): string | null {
  return value === null ? null : value.slice(0, 10);
}

/**
 * Convert the exact read-only, pre-lifecycle-migration company snapshot into
 * the complete CompanyImage reviewed by the reconciliation proposal. This is
 * deliberately fail-closed: legacy snapshots cannot represent pending signed
 * transactions, and redirects cannot be embedded in CompanyImage, so callers
 * must use it only for the captured zero-pending cohort and an unredirected
 * canonical target.
 */
export function legacyFullCompanySnapshotToImage(input: unknown): CompanyImage {
  const snapshot = legacyFullCompanySnapshotSchema.parse(input);
  if (snapshot.redirects.length > 0) {
    throw new Error("A legacy company with redirects requires explicit merge-aware proposal construction");
  }

  return companyImageSchema.parse({
    id: snapshot.id,
    name: snapshot.name,
    aliases: [],
    sector: snapshot.sector,
    subsector: snapshot.subsector,
    region: snapshot.region,
    country: snapshot.country,
    countryTags: snapshot.countryTags,
    description: snapshot.description,
    companyStatus: snapshot.companyStatus,
    recordStatus: snapshot.status,
    website: snapshot.website,
    yearFounded: snapshot.yearFounded,
    headquarters: snapshot.headquarters,
    lastVerifiedAt: snapshot.lastVerifiedAt,
    ownershipPeriods: snapshot.ownershipPeriods.map((period) => {
      const managerName = period.fund?.manager.name ?? period.organization?.name;
      if (!managerName) {
        throw new Error(`Ownership period ${period.id} has no attributable manager or organization`);
      }
      return {
        id: period.id,
        managerName,
        organizationName: period.organization?.name ?? null,
        fundName: period.fund?.fundName ?? null,
        vehicleName: period.vehicleName,
        stake: period.stake,
        investmentYear: period.investmentYear,
        exitYear: period.exitYear,
        isActive: period.isActive,
        transactionState: period.isActive ? "CLOSED_ACTIVE" as const : "REALIZED" as const,
      };
    }),
    pendingOwnershipTransactions: [],
    milestones: snapshot.milestones.map((milestone) => ({
      id: milestone.id,
      date: milestone.date,
      event: milestone.event,
      category: milestone.category,
      sortDate: milestone.sortDate,
      evidenceUrls: [],
    })),
    managementRoles: snapshot.managementRoles.map((role) => ({
      id: role.id,
      personName: role.person.name,
      title: role.title,
      isCurrent: role.endDate === null,
      startDate: calendarDate(role.startDate),
      endDate: calendarDate(role.endDate),
      evidenceUrls: [],
    })),
    citations: snapshot.citations.map((citation) => ({
      id: citation.id,
      label: citation.source.label,
      url: citation.source.url,
      sourceType: citation.source.type,
      purpose: citation.purpose,
      evidenceLabel: citation.evidenceLabel,
      isPrimary: citation.isPrimary,
    })),
  });
}
