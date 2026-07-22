import { createHash } from "node:crypto";

export interface OwnershipFactSnapshot {
  id: string;
  companyId: string;
  companyName: string;
  organizationId: string | null;
  organizationName: string | null;
  fundId: string | null;
  fundName: string | null;
  fundManagerName: string | null;
  vehicleName: string | null;
  stake: string | null;
  investmentYear: number | null;
  exitYear: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface ManagementFactSnapshot {
  id: string;
  companyId: string;
  companyName: string;
  personId: string;
  personName: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
}

export interface DuplicateFactGroup<T> {
  identity: string;
  companyId: string;
  companyName: string;
  keep: T;
  delete: T[];
}

export interface ExactFactDuplicatePlan {
  ownershipGroups: Array<DuplicateFactGroup<OwnershipFactSnapshot>>;
  dominatedOwnershipGroups: Array<DuplicateFactGroup<OwnershipFactSnapshot>>;
  managementGroups: Array<DuplicateFactGroup<ManagementFactSnapshot>>;
  deleteOwnershipIds: string[];
  deleteManagementRoleIds: string[];
}

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function ownershipIdentity(row: OwnershipFactSnapshot): string {
  // Match the public read model: the direct organization is the investor of
  // record; the linked manager is a fallback when no direct org exists.
  const firm = row.organizationName || row.fundManagerName || "";
  const vehicle = row.vehicleName || row.fundName || "";
  return [
    row.companyId,
    normalize(firm),
    normalize(vehicle),
    normalize(row.stake),
    row.investmentYear ?? "",
    row.exitYear ?? "",
    row.isActive ? "active" : "former",
  ].join("|");
}

function managementIdentity(row: ManagementFactSnapshot): string {
  return [
    row.companyId,
    normalize(row.personName),
    normalize(row.title),
    row.startDate ?? "",
    row.endDate ?? "",
  ].join("|");
}

function ownershipRichness(row: OwnershipFactSnapshot): number {
  return Number(Boolean(row.organizationId)) * 4
    + Number(Boolean(row.fundId)) * 3
    + Number(Boolean(row.vehicleName)) * 2
    + Number(Boolean(row.stake));
}

function dominatedOwnershipIdentity(row: OwnershipFactSnapshot): string {
  return [
    row.companyId,
    row.organizationId ?? "",
    row.fundId ?? "",
    normalize(row.stake),
    row.investmentYear ?? "",
    row.exitYear ?? "",
    row.isActive ? "active" : "former",
  ].join("|");
}

function planDominatedBlankVehicles(
  rows: OwnershipFactSnapshot[],
  alreadyDeleted: ReadonlySet<string>,
): Array<DuplicateFactGroup<OwnershipFactSnapshot>> {
  const grouped = new Map<string, OwnershipFactSnapshot[]>();
  for (const row of rows) {
    if (alreadyDeleted.has(row.id)) continue;
    const identity = dominatedOwnershipIdentity(row);
    grouped.set(identity, [...(grouped.get(identity) ?? []), row]);
  }
  return Array.from(grouped.entries())
    .flatMap(([identity, matches]) => {
      const blanks = matches.filter((row) => !row.vehicleName?.trim());
      const richer = matches.filter((row) => Boolean(row.vehicleName?.trim()));
      if (blanks.length === 0 || richer.length === 0) return [];
      const keep = [...richer].sort(
        (a, b) => ownershipRichness(b) - ownershipRichness(a) || a.id.localeCompare(b.id),
      )[0];
      return [{
        identity: `${identity}|blank-vehicle-dominated`,
        companyId: keep.companyId,
        companyName: keep.companyName,
        keep,
        delete: blanks.sort((a, b) => a.id.localeCompare(b.id)),
      }];
    })
    .sort((a, b) => a.companyName.localeCompare(b.companyName) || a.identity.localeCompare(b.identity));
}

function managementStability(row: ManagementFactSnapshot): number {
  return Number(row.id.startsWith("role_")) * 2
    + Number(row.personId.startsWith("person_"));
}

function groupDuplicates<T extends { id: string; companyId: string; companyName: string }>(
  rows: T[],
  identityFor: (row: T) => string,
  score: (row: T) => number,
): Array<DuplicateFactGroup<T>> {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const identity = identityFor(row);
    grouped.set(identity, [...(grouped.get(identity) ?? []), row]);
  }
  return Array.from(grouped.entries())
    .filter(([, matches]) => matches.length > 1)
    .map(([identity, matches]) => {
      const ordered = [...matches].sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id));
      return {
        identity,
        companyId: ordered[0].companyId,
        companyName: ordered[0].companyName,
        keep: ordered[0],
        delete: ordered.slice(1),
      };
    })
    .sort((a, b) => a.companyName.localeCompare(b.companyName) || a.identity.localeCompare(b.identity));
}

export function planExactCompanyFactDeduplication(input: {
  ownership: OwnershipFactSnapshot[];
  management: ManagementFactSnapshot[];
}): ExactFactDuplicatePlan {
  const ownershipGroups = groupDuplicates(input.ownership, ownershipIdentity, ownershipRichness);
  const exactOwnershipDeleteIds = new Set(
    ownershipGroups.flatMap((group) => group.delete.map((row) => row.id)),
  );
  const dominatedOwnershipGroups = planDominatedBlankVehicles(
    input.ownership,
    exactOwnershipDeleteIds,
  );
  const managementGroups = groupDuplicates(input.management, managementIdentity, managementStability);
  return {
    ownershipGroups,
    dominatedOwnershipGroups,
    managementGroups,
    deleteOwnershipIds: [
      ...exactOwnershipDeleteIds,
      ...dominatedOwnershipGroups.flatMap((group) => group.delete.map((row) => row.id)),
    ].sort(),
    deleteManagementRoleIds: managementGroups.flatMap((group) => group.delete.map((row) => row.id)).sort(),
  };
}

export function snapshotSha256(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
