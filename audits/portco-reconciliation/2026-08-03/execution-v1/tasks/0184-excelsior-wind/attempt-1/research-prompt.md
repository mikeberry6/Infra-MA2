Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Excelsior Wind
MANAGERS TO RESOLVE: Copenhagen Infrastructure Partners
TASK: ledger:0184:excelsior-wind:c93e08d6
CANONICAL KEY: excelsior-wind|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Accepted repo-only judgment proposes consolidation beneath the separately counted Vineyard Offshore development platform to avoid double-counting an underlying project. Verify the current project identity, ownership and platform boundary before any merge.","censusRows":[],"repoOnlyRows":[{"manager":"Copenhagen Infrastructure Partners","disposition":"MATCHED_ELSEWHERE","rationale":"Underlying project beneath Vineyard Offshore.","evidenceUrls":["https://www.vineyardoffshore.com/where-we-work/east-coast/excelsior-wind-1/","https://www.vineyardoffshore.com/who-we-are/"]}],"repoRows":[{"productionCompanyId":"cmrxpjc2u00s0ivhew9be7sm4","seedKey":"excelsior wind|United States","sourcePresence":"BOTH"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjc2u00s0ivhew9be7sm4","name":"Excelsior Wind","country":"United States","status":"Active","sector":"Power & ET","subsector":"Offshore wind development","investmentYear":2022,"headquarters":"New York; federal waters off the Mid-Atlantic","description":"The repository treats Excelsior as Vineyard Offshore's planned 1,350 MW New York offshore-wind project within BOEM lease OCS-A 0544, with CIP ownership inferred through the Vineyard Offshore platform. It separately records the Vineyard Offshore platform.","owners":[{"firm":"Copenhagen Infrastructure Partners","vehicle":"n.a.","investmentYear":2022,"stake":"Not publicly disclosed","isActive":true}],"milestones":[{"date":"Feb 23, 2022","event":"A CIP-backed Vineyard Wind entity won OCS-A 0544 in the New York Bight auction.","category":"Acquisition"},{"date":"Oct 24, 2023","event":"Vineyard Offshore said Excelsior was selected in a New York solicitation.","category":"Expansion"},{"date":"Jan 2025","event":"BOEM began environmental review of the Vineyard Mid-Atlantic proposal.","category":"Other"},{"date":"Feb 13, 2026","event":"NYSERDA concluded its 2024 solicitation without awards.","category":"Other"}],"sources":[{"url":"https://www.vineyardoffshore.com/article/vineyard-offshores-excelsior-wind-selected-for-the-next-wave-of-offshore-wind-power-in-new-york/"},{"url":"https://www.vineyardoffshore.com/where-we-work/east-coast/excelsior-wind-1/"},{"url":"https://www.boem.gov/renewable-energy/state-activities/vineyard-mid-atlantic-ocs-0544"},{"url":"https://www.nyserda.ny.gov/All-Programs/Offshore-Wind/Focus-Areas/Offshore-Wind-Solicitations/2024-Solicitation"}]}

BOUNDARY AND STATUS QUESTIONS
Determine whether Excelsior is a standalone manager-level investment or a named project entirely represented by Vineyard Offshore. Resolve the legal leaseholder/project entities, current CIP ownership and fund/vehicle, project/solicitation status, relationship among Excelsior Wind, Vineyard Mid-Atlantic and Vineyard Offshore, and whether the Excelsior brand remains current. Verify whether the 2023 selection led to an executed offtake, was cancelled/terminated, or was superseded by later procurement outcomes. Preserve project history under the platform if consolidation is recommended.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, owners and platform-versus-project/SPV boundaries.
- Determine whether one Vineyard Offshore platform row should represent the manager-level investment. Do not count a lease/project separately merely because it has a project name.
- Verify every current and former direct owner, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer a fund, stake or closing.
- Search through 2026-08-19 for award, contract execution/termination, sale, transfer, lease relinquishment, permit change, cancellation and signed pending transactions.
- Verify geography, lease area, capacity, permitting/procurement stage, customers/offtakers and current status.
- Reopen direct pages. Prefer Vineyard Offshore, CIP, BOEM, NYSERDA, filings and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.vineyardoffshore.com/where-we-work/east-coast/excelsior-wind-1/
- https://www.vineyardoffshore.com/who-we-are/
- https://www.vineyardoffshore.com/article/vineyard-offshores-excelsior-wind-selected-for-the-next-wave-of-offshore-wind-power-in-new-york/
- https://www.boem.gov/renewable-energy/state-activities/vineyard-mid-atlantic-ocs-0544
- https://www.nyserda.ny.gov/All-Programs/Offshore-Wind/Focus-Areas/Offshore-Wind-Solicitations/2024-Solicitation

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
