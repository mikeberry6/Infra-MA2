Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19 using current direct web sources and acquisition/exit searches. Treat the census as unverified.

REQUESTED COMPANY: Mission Clean Energy
REQUESTED MANAGER: Wafra
TASK: ledger:0458:mission-clean-energy:ec7ef24e
CANONICAL KEY: mission-clean-energy|united-states

The census proposes a new Wafra-controlled clean-energy platform. Reconstruct Wafra's investment: exact organization/fund/vehicle, seller/founders, stake/control, announcement/closing date, retained ownership and current owner table. Verify whether Mission is a manager-level developer/owner of solar and storage infrastructure, which projects are owned versus pipeline-only, current operating/development scale, headquarters and U.S. footprint. Keep projects/SPVs beneath one platform unless separately manager-held. Search through 2026-08-19 for project/platform sales, ownership transfers, exits and signed pending transactions.

Require direct current ownership and infrastructure-mandate evidence. Prefer Mission, Wafra, utility/regulatory/interconnection, financing and transaction-party sources. Return PROPOSED_NEW only if identity/current in-scope ownership are resolved; PROPOSED_CORRECTION if it maps elsewhere; EXCLUDED if development-services/debt/out-of-scope or realized; PROPOSED_MERGE for a duplicate; or DEFERRED for material uncertainty. Research only; no database syntax.

STARTING SOURCES
- https://missioncleanenergy.com/investors/
- https://www.wafra.com/wafra-acquires-controlling-interest-in-mission-clean-energy/

Return plain text with BEGIN_JSON, one minified JSON object, END_JSON, BEGIN_REVIEW, one concise paragraph, END_REVIEW. Keep under 7,500 characters and at most 8 evidence rows/4 milestones. Mandatory keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Exactly one primary.
