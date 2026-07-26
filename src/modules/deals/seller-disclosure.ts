export const REVIEWED_MISSING_SELLER_STATES = ["NOT_DISCLOSED", "NOT_APPLICABLE"] as const;

export type SellerDisclosureState =
  | "DISCLOSED"
  | "NOT_DISCLOSED"
  | "NOT_APPLICABLE"
  | "LEGACY_UNREVIEWED";

export interface SellerTreatment {
  sellerCount: number;
  status: SellerDisclosureState;
  reason?: string | null;
}

/**
 * A named seller is sufficient evidence. If no seller is represented, an
 * editor must explicitly classify the absence and record a meaningful reason.
 * LEGACY_UNREVIEWED exists solely to migrate old records without inventing a
 * review decision; it never satisfies a new publication or verification gate.
 */
export function hasReviewedSellerTreatment(treatment: SellerTreatment): boolean {
  if (treatment.sellerCount > 0) return true;
  if (!REVIEWED_MISSING_SELLER_STATES.includes(
    treatment.status as (typeof REVIEWED_MISSING_SELLER_STATES)[number],
  )) return false;
  return (treatment.reason?.trim().length ?? 0) >= 10;
}
