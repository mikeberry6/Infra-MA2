Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19 using current direct web sources and acquisition/exit searches. Treat the census as unverified.

REQUESTED COMPANY: Contract Leasing Corporation
REQUESTED MANAGER: Wafra
TASK: ledger:0455:contract-leasing-corporation:083d749b
CANONICAL KEY: contract-leasing-corporation|united-states

The census proposes a new Wafra-owned company. Reconstruct the acquisition announced by Contract Leasing Corporation: legal buyer/seller, Wafra fund/vehicle, stake/control, announcement and legal closing, retained management/co-owners and current status. Establish whether CLC owns a qualifying trailer/chassis fleet under long-term leasing or is principally a finance/services business; verify fleet scale, facilities, customers/end markets, headquarters and geography. Keep leased units, branches and subsidiaries beneath one platform. Search through 2026-08-19 for subsequent sales, recapitalizations, exits and signed pending transactions.

Require manager-specific infrastructure mandate evidence. Prefer CLC, Wafra, regulatory/filing, lender and transaction-party sources. Return PROPOSED_NEW only with resolved current in-scope ownership; PROPOSED_CORRECTION if it maps elsewhere; EXCLUDED for out-of-scope finance/debt/realized exposure; PROPOSED_MERGE for a duplicate; or DEFERRED for material uncertainty. Research only; no database syntax.

STARTING SOURCES
- https://www.contractleasing.net/contract-leasing-corporation-announces-acquisition-by-wafra/
- https://www.wafra.com/our-people/edward-tsai/

Return plain text with BEGIN_JSON, one minified JSON object, END_JSON, BEGIN_REVIEW, one concise paragraph, END_REVIEW. Keep under 7,500 characters and at most 8 evidence rows/4 milestones. Mandatory keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Exactly one primary.
