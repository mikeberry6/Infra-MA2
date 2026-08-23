Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Live Oak Wind Farm
MANAGERS TO RESOLVE: Equitix; KKR; John Laing; identify all direct project co-owners
TASK: ledger:0241:live-oak-wind-farm:082ed40f
CANONICAL KEY: live-oak-wind-farm|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The project remains on a John Laing portfolio page and is attributed to Equitix through a 2021 portfolio transfer, but direct current Equitix ownership has not been reconfirmed. Establish whether it belongs to the Equitix/KKR John Laing Investments Limited portfolio or KKR-owned John Laing Group.","productionCompanyId":"cmrxpjf0f00wkivhexu0u6f39","seedKey":"live oak wind farm|United States","startingEvidence":["https://data.fca.org.uk/artefacts/NSM/RNS/4118829.html","https://www.laing.com/portfolio/live-oak-us/"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Live Oak Wind Farm","country":"United States","status":"Active","sector":"Power & ET","subsector":"Onshore wind generation","investmentYear":2021,"headquarters":"Texas","owners":[{"firm":"Equitix","vehicle":"John Laing Investments Limited","investmentYear":2021,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"description":"The repository records the roughly 200 MW Texas wind project as an Equitix investment through John Laing Investments Limited after a 2021 transaction.","milestones":[{"date":"Dec 2018","event":"Live Oak reached commercial operation.","category":"Expansion"},{"date":"Sep 22, 2021","event":"The repository attributes the project to Equitix/KKR-backed John Laing Investments Limited.","category":"Acquisition"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the canonical project/ProjectCo identity and boundary versus ENGIE, offtakers, operators, tax-equity vehicles and individual turbine/assets. Reconstruct equity ownership from development/financial close through every later transfer. Specifically determine whether the project was part of the 2021 Equitix/KKR acquisition of a John Laing secondary portfolio, remained with John Laing Group when KKR acquired that group, or followed another structure. Identify exact project stake(s), manager, organization, fund/vehicle, announcement and legal closing dates, co-owners, and current ownership. Search through the as-of date for tax-equity restructuring, refinancing, project sale, portfolio disposal, ownership transfer, Equitix/KKR/John Laing exit or signed pending transaction. Do not treat tax equity, debt or power offtake as direct manager ownership.

RESEARCH RULES
- Resolve canonical project-company identity, aliases, current/former owners and project/SPV/operator boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Preserve a percentage only when supported at this project level.
- Search through 2026-08-19 for sale, transfer, recapitalization, refinancing, portfolio disposal, owner change and signed pending transactions.
- Verify operating status, location, capacity, turbines, offtake and disclosed scale.
- Reopen direct pages and filings. Prefer John Laing, Equitix, KKR, project/regulatory, ERCOT, tax-equity and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material current-ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.laing.com/portfolio/live-oak-us/
- https://data.fca.org.uk/artefacts/NSM/RNS/4118829.html
- https://www.debevoise.com/news/2021/05/debevoise-advises-pantheon-in-its-role-in
- https://www.engie-na.com/houston_headquarters_powered_by_wind/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
