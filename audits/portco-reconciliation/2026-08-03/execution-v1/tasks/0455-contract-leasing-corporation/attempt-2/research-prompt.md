Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-22 using current direct web sources and acquisition/exit searches. Treat the census and prior attempt as unverified.

REQUESTED COMPANY: Contract Leasing Corporation
MANAGER: Wafra
TASK: ledger:0455:contract-leasing-corporation:083d749b
CANONICAL KEY: contract-leasing-corporation|united-states

RECOVERY CONTEXT
The prior Pro attempt supported inclusion but failed validation after its one repair: it wrongly named Dennis T. Smith as founder/CEO instead of Michael Goor, asserted an unsupported fleet above 30,000 units, and returned a pending evidenceUrls field with the wrong type. Start fresh and do not reuse those errors.

FACTS TO TEST, NOT ASSUME
- Funds advised by Wafra acquired CLC on or by the August 2, 2022 announcement.
- Founder Michael Goor remained a significant shareholder and is the current CEO.
- Wafra currently lists CLC as a real-assets/infrastructure investment; CLC later called Wafra its equity partner.
- The directly sourced acquisition baseline was approximately 15,700 trailer/chassis units and 13 branches/depots mainly east of the Mississippi. Use a larger current fleet only if a direct source is opened.

QUESTIONS
- Resolve canonical/legal identity, aliases, parent/subsidiary boundary and whether any duplicate record exists.
- Reconstruct the 2022 transaction: legal buyer/seller, Wafra fund/vehicle, stake/control, announcement and closing, retained Michael Goor ownership and current status.
- Establish whether CLC owns/leases a qualifying long-life trailer/chassis fleet or is mainly finance/services; verify fleet, facilities, customers/end markets, headquarters and geography.
- Search through the cutoff for sales, recapitalizations, exits and signed pending transactions.
- Keep leased units, branches and subsidiaries beneath one manager-level platform.

STARTING SOURCES TO REOPEN
- https://www.contractleasing.net/contract-leasing-corporation-announces-acquisition-by-wafra/
- https://www.wafra.com/our-people/edward-tsai/

Require Wafra infrastructure-mandate evidence. Prefer CLC, Wafra, regulatory/filing, lender and transaction-party pages. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity/current-ownership uncertainty. Return PROPOSED_NEW only with resolved current in-scope ownership; PROPOSED_CORRECTION if it maps elsewhere; EXCLUDED for out-of-scope finance/debt/realized exposure; PROPOSED_MERGE for a duplicate; or DEFERRED for material uncertainty. Research only; no database syntax or Deal Database changes.

Return plain text only:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the entire response under 5,500 characters, with at most 6 evidence rows and 3 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls, and evidenceUrls must be an array. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
