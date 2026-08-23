Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: KAPS
REQUESTED MANAGER: Stonepeak; identify every continuing direct owner needed to determine company status
TASK: ledger:0425:kaps:e97e627d
CANONICAL KEY: kaps|canada

LEDGER ISSUE TO TEST
The repository publishes KAPS as an active Stonepeak Canadian midstream PortCo. The Stonepeak census instead proposes retiring Stonepeak’s ownership because Keyera announced the acquisition of the remaining 50% interest in KAPS in 2026. Verify announcement, legal closing, seller, transaction perimeter and current ownership as of the cutoff. Retire only Stonepeak’s ownership period if it exited; preserve the company as active under Keyera if the pipeline remains operating.

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
The record describes KAPS as a roughly 560-kilometre dual NGL/condensate pipeline system in Alberta with planned NGL capacity up to 350,000 barrels per day. It says Stonepeak agreed in December 2022 to acquire 50%, closed in April 2023, Keyera retained operatorship, and the system was completed in October 2023. It currently records Stonepeak as the sole active owner with no fund/vehicle and investment year 2023.

OWNERSHIP AND TRANSACTION QUESTIONS
Establish the exact KAPS legal/project-company boundary, Keyera’s pre-transaction interest, Stonepeak’s acquisition vehicle/fund if disclosed, stake, announcement and legal close dates, and whether the 2026 Keyera transaction was signed, closed, cancelled or pending on 2026-08-19. Identify exact announcement and closing dates and any conditions. Search Stonepeak and Keyera releases, financial statements, regulatory filings and later disclosures for the transaction and any subsequent transfer. Do not treat operatorship alone as ownership.

COMPANY STATUS AND BOUNDARY
Determine whether KAPS remains an operating manager-level infrastructure asset after Stonepeak’s exit. Keep Keyera processing/fractionation assets and underlying pipe segments beneath the KAPS platform unless separately manager-held. Verify location, route, products, customers/end markets, commercial model, length, capacity, completion/in-service date and current operating status.

RESEARCH RULES
- Resolve canonical identity, legal/project entities, current/former owners, funds/vehicles, stakes, announcement/closing/exit dates and transaction states.
- Search through 2026-08-19 for the original acquisition, commissioning, later sale, legal close, financing, restructuring and any signed pending transaction.
- Prefer Stonepeak, Keyera, Canadian regulatory/filing and transaction-party sources. Open direct pages rather than relying on snippets.
- Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_CORRECTION if Stonepeak exited and the company/ownership period must be corrected; VERIFIED_NO_CHANGE only if Stonepeak remains a qualifying current owner; EXCLUDED only if the company no longer qualifies independently of a manager exit; PROPOSED_MERGE if a duplicate is proven; or DEFERRED if the 2026 closing status remains materially unresolved.
- Do not delete or realize the company solely because Stonepeak exited if Keyera continues to own and operate it. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://stonepeak.com/news/stonepeak-to-acquire-interest-in-kaps
- https://stonepeak.com/press-releases/stonepeak-completes-acquisition-of-interest-in-kaps
- https://www.keyera.com/news-and-stories/news-releases/keyera-celebrates-the-completion-of-the-kaps-pipeline/
- https://www.keyera.com/operations/pipelines-and-processing/kaps-pipeline-system
- https://www.keyera.com/news-and-stories/news-releases/keyera-announces-acquisition-of-remaining-50-interest-in-kaps/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
