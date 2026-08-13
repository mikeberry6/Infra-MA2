import rawAfterImages from "./approved-portco-after-images.json" with { type: "json" };
import type { PortCo } from "./portco-types";

export interface ApprovedPortCoAfterImage {
  proposalSha256: string;
  taskId: string;
  operation: "UPSERT" | "MERGE" | "ARCHIVE";
  company: PortCo;
  retiredCompanies: Array<{ name: string; country: string }>;
}

const afterImages = rawAfterImages as ApprovedPortCoAfterImage[];

function key(name: string, country: string): string {
  return `${name.trim().toLowerCase()}\u0000${country.trim().toLowerCase()}`;
}

export function applyApprovedPortCoAfterImages(
  input: PortCo[],
  approvedAfterImages: readonly ApprovedPortCoAfterImage[] = afterImages,
): PortCo[] {
  const companies = [...input];
  const appliedHashes = new Set<string>();
  for (const entry of approvedAfterImages) {
    if (!/^[a-f0-9]{64}$/.test(entry.proposalSha256)) {
      throw new Error(`Invalid approved PortCo proposal hash: ${entry.proposalSha256}`);
    }
    if (appliedHashes.has(entry.proposalSha256)) {
      throw new Error(`Duplicate approved PortCo proposal hash: ${entry.proposalSha256}`);
    }
    appliedHashes.add(entry.proposalSha256);

    const retired = new Set(entry.retiredCompanies.map((company) => key(company.name, company.country)));
    if (entry.operation === "ARCHIVE") {
      retired.add(key(entry.company.name, entry.company.country));
    }
    for (let index = companies.length - 1; index >= 0; index -= 1) {
      if (retired.has(key(companies[index].name, companies[index].country))) {
        companies.splice(index, 1);
      }
    }

    if (entry.operation === "ARCHIVE") continue;

    const canonicalKey = key(entry.company.name, entry.company.country);
    const existingIndexes = companies
      .map((company, index) => ({ company, index }))
      .filter(({ company }) => key(company.name, company.country) === canonicalKey)
      .map(({ index }) => index);
    if (existingIndexes.length > 1) {
      throw new Error(`Approved PortCo after-image is ambiguous: ${entry.company.name}`);
    }
    if (existingIndexes.length === 1) companies[existingIndexes[0]] = entry.company;
    else companies.push(entry.company);
  }
  return companies;
}

/**
 * Reconstruct the evaluated seed state that existed before the active task's
 * approved overlay. This is required when a seed release succeeds but the
 * matching database transaction rolls back: a retry must still snapshot the
 * task's original seed identities while preserving every unrelated release.
 */
export function applyApprovedPortCoAfterImagesBeforeTask(
  input: PortCo[],
  activeTaskId: string,
  approvedAfterImages: readonly ApprovedPortCoAfterImage[] = afterImages,
): PortCo[] {
  const taskId = activeTaskId.trim();
  if (!taskId) throw new Error("Active PortCo task id is required for pre-task seed evaluation");
  return applyApprovedPortCoAfterImages(
    input,
    approvedAfterImages.filter((entry) => entry.taskId !== taskId),
  );
}
