Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19 using current direct web sources and acquisition/exit searches. Treat the census as unverified.

REQUESTED COMPANY: Beyond Data Centers
REQUESTED MANAGER: Wafra
TASK: ledger:0454:beyond-data-centers:aa1b4081
CANONICAL KEY: beyond-data-centers|united-states

The census proposes a new Wafra-owned company but gives only the company site and a Wafra personnel page. Resolve the legal entity and launch/acquisition history; Wafra organization, fund/vehicle, security/stake, co-owners, entry/closing date and current ownership; and whether the investment sits in a qualifying infrastructure mandate. Confirm whether Beyond owns/operates data centers, is a development platform, or merely provides services. Identify current sites, MW/acre/campus scale only where sourced, customers/end markets, headquarters and U.S. footprint. Keep projects beneath the platform. Search through 2026-08-19 for financing, transfers, exits and signed pending transactions.

Prefer company, Wafra, utility/planning/regulatory, lender and transaction-party sources. Return PROPOSED_NEW only if direct current in-scope ownership and canonical boundary are resolved; PROPOSED_CORRECTION if it maps elsewhere; EXCLUDED for out-of-scope/debt/realized exposure; PROPOSED_MERGE for a proven duplicate; or DEFERRED if material facts remain unresolved. Research only; no database syntax.

STARTING SOURCES
- https://www.beyonddatacenters.com/
- https://www.wafra.com/our-people/michael-coleman-2/

Return plain text with BEGIN_JSON, one minified JSON object, END_JSON, BEGIN_REVIEW, one concise paragraph, END_REVIEW. Keep under 7,500 characters and at most 8 evidence rows/4 milestones. Mandatory keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Exactly one primary.
