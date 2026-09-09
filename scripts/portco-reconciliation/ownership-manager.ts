/** Exact persistence-image projection; this does not rename an organization. */
export function ownershipManagerName(fundManager: string | null | undefined, organization: string | null | undefined, ownerId: string) {
  const manager = fundManager ?? organization;
  if (!manager) throw new Error(`Ownership period ${ownerId} lacks a resolvable manager`);
  return manager;
}
