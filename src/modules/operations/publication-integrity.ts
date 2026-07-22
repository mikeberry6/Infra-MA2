import { isHttpUrl } from "@/lib/source-utils";
import { isValidFundSize } from "@/modules/funds/size";
import {
  hasReviewedSellerTreatment,
  type SellerDisclosureState,
} from "@/modules/deals/seller-disclosure";

export type DealPublicationRecord = {
  target: string;
  country: string;
  date: Date | string | null | undefined;
  dealStatus: string | null | undefined;
  sellerDisclosureStatus: SellerDisclosureState;
  sellerDisclosureReason?: string | null;
  categories: readonly string[];
  participants: ReadonlyArray<{ role: string }>;
  citations: readonly unknown[];
};

export type FundPublicationRecord = {
  managerId: string | null | undefined;
  fundName: string;
  strategies: readonly string[];
  fundStatus: string | null | undefined;
  size: string;
  primarySourceUrl: string | null | undefined;
  sourceUrls: readonly string[];
  strategyUrl: string;
};

export type CompanyPublicationRecord = {
  name: string;
  country: string;
  sector: string | null | undefined;
  description: string;
  website?: string | null;
  ownershipPeriods: ReadonlyArray<{
    id?: string;
    fundId?: string | null;
    fund?: { status?: string | null } | null;
  }>;
  citations: readonly unknown[];
};

export function missingDealPublicationFields(deal: DealPublicationRecord): string[] {
  return [
    !deal.target.trim() && "target",
    !deal.country.trim() && "country",
    !deal.date && "date",
    !deal.dealStatus && "transaction status",
    deal.categories.length === 0 && "category",
    !deal.participants.some((participant) => participant.role === "BUYER") && "buyer",
    !hasReviewedSellerTreatment({
      sellerCount: deal.participants.filter((participant) => participant.role === "SELLER").length,
      status: deal.sellerDisclosureStatus,
      reason: deal.sellerDisclosureReason,
    }) && "seller or reviewed seller-disclosure reason",
    deal.citations.length === 0 && "primary citation",
  ].filter((field): field is string => Boolean(field));
}

export function missingFundPublicationFields(fund: FundPublicationRecord): string[] {
  const supportingUrls = [...fund.sourceUrls, fund.strategyUrl]
    .map((url) => url.trim())
    .filter(Boolean);
  return [
    !fund.managerId && "manager",
    !fund.fundName.trim() && "fund vehicle",
    fund.strategies.length === 0 && "strategy",
    !fund.fundStatus && "status",
    !isValidFundSize(fund.size) && "size basis or explicit TBD",
    !isHttpUrl(fund.primarySourceUrl) && "valid HTTP(S) primary source",
    supportingUrls.some((url) => !isHttpUrl(url)) && "valid HTTP(S) supporting sources",
  ].filter((field): field is string => Boolean(field));
}

export function missingCompanyPublicationFields(company: CompanyPublicationRecord): string[] {
  const hasPublicOwnership = company.ownershipPeriods.some(
    (ownership) => !ownership.fundId || ownership.fund?.status === "PUBLISHED",
  );
  return [
    !company.name.trim() && "canonical identity",
    !company.country.trim() && "location",
    !company.sector && "sector",
    !company.description.trim() && "description",
    Boolean(company.website?.trim()) && !isHttpUrl(company.website) && "valid HTTP(S) website",
    !hasPublicOwnership && "ownership period backed by a published fund or free-text owner",
    company.citations.length === 0 && "primary citation",
  ].filter((field): field is string => Boolean(field));
}

export type FundLookupRecord = {
  id: string;
  fundName: string;
  status?: string | null;
};

export type OwnershipFundRecord = {
  id: string;
  companyId: string;
  vehicleName?: string | null;
  fundId?: string | null;
  fund?: FundLookupRecord | null;
};

export type OwnershipFundIssue = {
  ownershipId: string;
  companyId: string;
  code: "BROKEN_FUND_LINK" | "LINKED_FUND_NAME_MISMATCH" | "MISSING_FUND_LINK";
  message: string;
};

export function normalizeFundLookup(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findOwnershipFundIssues(
  ownerships: readonly OwnershipFundRecord[],
  funds: readonly FundLookupRecord[],
): OwnershipFundIssue[] {
  const fundsByNormalizedName = new Map<string, FundLookupRecord[]>();
  for (const fund of funds) {
    // Callers that do not project status retain the historical all-funds
    // behavior. Status-aware publication checks must never propose a link to
    // a record that is not itself public.
    if (fund.status != null && fund.status !== "PUBLISHED") continue;
    const normalized = normalizeFundLookup(fund.fundName);
    if (!normalized) continue;
    fundsByNormalizedName.set(normalized, [
      ...(fundsByNormalizedName.get(normalized) ?? []),
      fund,
    ]);
  }

  const issues: OwnershipFundIssue[] = [];
  for (const ownership of ownerships) {
    const normalizedVehicle = normalizeFundLookup(ownership.vehicleName ?? "");
    if (ownership.fundId) {
      if (!ownership.fund || ownership.fund.id !== ownership.fundId) {
        issues.push({
          ownershipId: ownership.id,
          companyId: ownership.companyId,
          code: "BROKEN_FUND_LINK",
          message: `fundId ${ownership.fundId} does not resolve to its selected Fund`,
        });
      } else if (ownership.fund.status != null && ownership.fund.status !== "PUBLISHED") {
        issues.push({
          ownershipId: ownership.id,
          companyId: ownership.companyId,
          code: "BROKEN_FUND_LINK",
          message: `fundId ${ownership.fundId} resolves to a ${ownership.fund.status} Fund instead of a PUBLISHED Fund`,
        });
      } else if (
        normalizedVehicle
        && normalizedVehicle !== normalizeFundLookup(ownership.fund.fundName)
      ) {
        issues.push({
          ownershipId: ownership.id,
          companyId: ownership.companyId,
          code: "LINKED_FUND_NAME_MISMATCH",
          message: `vehicle "${ownership.vehicleName}" does not match linked fund "${ownership.fund.fundName}"`,
        });
      }
      continue;
    }

    const matchingFunds = fundsByNormalizedName.get(normalizedVehicle) ?? [];
    if (normalizedVehicle && matchingFunds.length === 1) {
      issues.push({
        ownershipId: ownership.id,
        companyId: ownership.companyId,
        code: "MISSING_FUND_LINK",
        message: `vehicle "${ownership.vehicleName}" uniquely matches fund "${matchingFunds[0].fundName}" but fundId is null`,
      });
    }
  }
  return issues;
}
