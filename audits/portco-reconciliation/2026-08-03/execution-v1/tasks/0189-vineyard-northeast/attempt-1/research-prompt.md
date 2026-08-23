Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Vineyard Northeast
MANAGERS TO RESOLVE: Copenhagen Infrastructure Partners
TASK: ledger:0189:vineyard-northeast:2c3d1cf2
CANONICAL KEY: vineyard-northeast|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"The accepted repo-only judgment says Vineyard Northeast should be consolidated beneath the separately counted Vineyard Offshore development platform to avoid double-counting an underlying project. Identify and approve the canonical keep record and consolidation boundary; do not infer a merger merely from this source judgment.","censusRows":[],"repoOnlyRows":[{"manager":"Copenhagen Infrastructure Partners","disposition":"MATCHED_ELSEWHERE","rationale":"Consolidated beneath the separately counted Vineyard Offshore development platform to avoid double counting an underlying project."}],"repoRows":[{"productionCompanyId":"cmrxpjcc300shivhevs5fdcyl","seedKey":"vineyard northeast|United States","sourcePresence":"BOTH"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjcc300shivhevs5fdcyl","name":"Vineyard Northeast","country":"United States","status":"Active","sector":"Power & ET","subsector":"Offshore wind development","investmentYear":2019,"headquarters":"Massachusetts; federal waters off New England","description":"The repository counts Vineyard Northeast as a separate CIP portfolio company/project. It says Vineyard Offshore announced the project in 2024 for the New England market, associates it with federal lease OCS-A 0522, and attributes the 2019 lease and active ownership to CIP without a disclosed project percentage.","owners":[{"firm":"Copenhagen Infrastructure Partners","vehicle":"n.a.","investmentYear":2019,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"milestones":[{"date":"Apr 1, 2019","event":"BOEM lease package for OCS-A 0522 became effective after the 2018 auction.","category":"Acquisition"},{"date":"2024","event":"BOEM materials linked Vineyard Northeast to OCS-A 0522.","category":"Other"},{"date":"2024","event":"Vineyard Northeast was founded.","category":"Founding"},{"date":"Mar 27, 2024","event":"Vineyard Offshore announced Vineyard Northeast for New England.","category":"Other"}],"sources":[{"url":"https://www.vineyardoffshore.com/where-we-work/east-coast/vineyard-wind-2/vineyard-northeast/"},{"url":"https://www.vineyardoffshore.com/article/team-behind-vineyard-wind-1-announces-next-offshore-wind-project-for-new-england/"},{"url":"https://www.boem.gov/renewable-energy/state-activities/vineyard-northeast"}]}

TRANSACTION AND OWNERSHIP QUESTIONS
Determine whether Vineyard Northeast is a separately investable manager-level company/platform, a named development project inside Vineyard Offshore, or a successor/renaming of Vineyard Wind 2. Resolve the legal project/lease entities, ownership of OCS-A 0522, the 2018 Avangrid/CIP auction attribution, any later transfer into Vineyard Offshore or CI IV, and whether Avangrid retains any current economic interest. Verify whether Vineyard Offshore should be the one canonical company and Vineyard Northeast only a project/alias. Search for procurement awards, withdrawals, project cancellation, lease surrender, sale, new partner, financing, construction decision or ownership transfer through the as-of date; do not treat a solicitation bid or permitting milestone as an ownership transaction.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, current and former owners, and platform/project/SPV boundaries.
- Test the repo's proposed consolidation into Vineyard Offshore against direct platform, BOEM, lease, state-procurement, CIP and Avangrid evidence.
- Verify every direct owner, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer CI IV, a percentage or a closing from platform branding.
- Search through 2026-08-19 for acquisition close, sale, transfer, financing, lease action, procurement award/withdrawal, cancellation and signed pending transactions.
- Verify geography, lease area, planned capacity, development stage, products/end markets and current status.
- Reopen direct pages. Prefer Vineyard Offshore, BOEM, CIP, Avangrid and state/regulatory sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.vineyardoffshore.com/where-we-work/east-coast/vineyard-wind-2/vineyard-northeast/
- https://www.vineyardoffshore.com/who-we-are/
- https://www.vineyardoffshore.com/article/team-behind-vineyard-wind-1-announces-next-offshore-wind-project-for-new-england/
- https://www.boem.gov/renewable-energy/state-activities/vineyard-northeast

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
