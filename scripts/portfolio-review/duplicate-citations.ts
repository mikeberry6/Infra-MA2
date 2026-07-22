import { sha256 } from "./lib.ts";

export interface CitationSnapshot {
  id: string;
  sourceId: string;
  dealId: string | null;
  companyId: string;
  purpose: string;
  evidenceLabel: string | null;
  isPrimary: boolean;
}

export interface DuplicateCitationGroup {
  identitySha256: string;
  companyId: string;
  keepId: string;
  deleteIds: string[];
  rows: CitationSnapshot[];
}

export interface DuplicateCitationPlan {
  groups: DuplicateCitationGroup[];
  deleteRows: CitationSnapshot[];
  duplicateGroups: number;
  excessRows: number;
}

export function citationIdentity(row: CitationSnapshot): string {
  return JSON.stringify([
    row.companyId,
    row.sourceId,
    row.purpose,
    row.evidenceLabel,
    row.dealId,
  ]);
}

export function planExactCompanyCitationDeduplication(rows: CitationSnapshot[]): DuplicateCitationPlan {
  const byIdentity = new Map<string, CitationSnapshot[]>();
  for (const row of rows) {
    if (!row.companyId) throw new Error(`Citation ${row.id} is outside the company-citation scope`);
    const identity = citationIdentity(row);
    byIdentity.set(identity, [...(byIdentity.get(identity) ?? []), row]);
  }

  const groups: DuplicateCitationGroup[] = [];
  for (const [identity, unsorted] of byIdentity) {
    if (unsorted.length < 2) continue;
    const rowsForIdentity = [...unsorted].sort((left, right) => {
      if (left.isPrimary !== right.isPrimary) return left.isPrimary ? -1 : 1;
      return left.id.localeCompare(right.id);
    });
    const primaryCount = rowsForIdentity.filter((row) => row.isPrimary).length;
    if (primaryCount > 1) {
      throw new Error(`Exact citation identity ${sha256(identity)} has more than one primary row`);
    }
    const [keep, ...duplicates] = rowsForIdentity;
    groups.push({
      identitySha256: sha256(identity),
      companyId: keep.companyId,
      keepId: keep.id,
      deleteIds: duplicates.map((row) => row.id),
      rows: rowsForIdentity,
    });
  }

  groups.sort((left, right) => left.companyId.localeCompare(right.companyId) || left.identitySha256.localeCompare(right.identitySha256));
  const deleteRows = groups.flatMap((group) => group.rows.filter((row) => group.deleteIds.includes(row.id)));
  return {
    groups,
    deleteRows,
    duplicateGroups: groups.length,
    excessRows: deleteRows.length,
  };
}
