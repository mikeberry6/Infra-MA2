Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Alto
MANAGERS TO RESOLVE: CDPQ
TASK: ledger:0170:alto:534d91d7
CANONICAL KEY: alto|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_PENDING_TRANSACTION"],"rationale":"The exact normalized company identity is established; ADD_PENDING_TRANSACTION requires individual review.","censusRows":[{"manager":"CDPQ","disposition":"PENDING_TRANSACTION","rationale":"The exact normalized company identity is established; ADD_PENDING_TRANSACTION requires individual review.","evidenceUrls":["https://cdpqinfra.com/en/projects/alto"]}],"repoOnlyRows":[],"repoRows":[{"productionCompanyId":"cmrxpjbg200r3ivhecia5jup6","seedKey":"alto|Canada","sourcePresence":"BOTH","disposition":"MATCHED_CENSUS"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjbg200r3ivhecia5jup6","name":"Alto","country":"Canada","status":"Active","sector":"Transportation","subsector":"High-speed rail development","investmentYear":2025,"headquarters":"Ontario and Québec","description":"The repository treats Alto as the high-speed rail project selected to connect Toronto and Québec City and treats CDPQ as an active owner because CDPQ Infra leads the Cadence consortium. Public materials describe the corridor at roughly 1,000 kilometers, but the repository does not identify a disclosed ownership percentage.","owners":[{"firm":"CDPQ","vehicle":"n.a.","investmentYear":2025,"stake":"Not publicly disclosed","isActive":true}],"milestones":[{"date":"Mar 21, 2025","event":"Alto and the CDPQ Infra-led Cadence consortium signed the development contract.","category":"Financing"},{"date":"Feb 19, 2025","event":"The Government of Canada selected Cadence as preferred private developer partner.","category":"Expansion"},{"date":"2026","event":"Alto branding was adopted for the high-speed rail project.","category":"Other"}],"sources":[{"url":"https://www.altotrain.ca/en/shaping-canadas-future-high-speed-train"},{"url":"https://prod.cdpqinfra.com/en/news/pressreleases/toronto-quebec-city-high-speed-rail-first-major-milestone-reached"},{"url":"https://cadence.info/en"}]}

RESEARCH RULES
- Resolve whether Alto is a government-owned project entity, a development-stage project, a public-private partnership, or a manager-level operating company. Distinguish Alto, Cadence, CDPQ Infra, the Canadian government, and any project company.
- Determine whether CDPQ or CDPQ Infra holds direct equity ownership, is only consortium lead/development partner, or has only a future/conditional investment mandate. Do not equate consortium leadership or a development contract with current PortCo ownership.
- Verify any signed pending ownership or concession transaction, its counterparties, stake/economic interest, announcement date, legal closing conditions, and current state. Do not infer a stake, vehicle, or closing.
- Exclude debt, public securities, fund/LP exposure, non-infrastructure strategies, and subsidiaries/projects already counted under a platform unless this project is itself the manager-level investment boundary supported by direct evidence.
- Search through 2026-08-19 for closing, sale, exit, divestiture, transfer, recapitalization, concession award, contract amendments, cancellation, merger, rebrand, bankruptcy and signed pending transactions.
- Verify geography, official website, headquarters or project corridor, founding/formation year, development scope, counterparties, operating status, and disclosed scale.
- Reopen direct pages. Prefer government, regulator, project company, manager, filing, and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://cdpqinfra.com/en/projects/alto
- https://www.altotrain.ca/en/shaping-canadas-future-high-speed-train
- https://prod.cdpqinfra.com/en/news/pressreleases/toronto-quebec-city-high-speed-rail-first-major-milestone-reached
- https://cadence.info/en

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
