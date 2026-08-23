Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Mobilinx / Hurontario LRT / Hazel McCallion Line ProjectCo
MANAGERS TO RESOLVE: Equitix; KKR; John Laing; identify all direct project co-owners
TASK: ledger:0242:mobilinx:7d20cccb
CANONICAL KEY: mobilinx|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"Mobilinx is attributed to Equitix through a 2021 John Laing portfolio transfer, but no direct post-transfer Equitix confirmation was found. Resolve the current investment structure and correct the project/platform identity.","productionCompanyId":"cmrxpjf0y00wlivhe0e7k8wcy","seedKey":"mobilinx|Canada","startingEvidence":["https://data.fca.org.uk/artefacts/NSM/RNS/4118829.html","https://www.mobilinx.ca/"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Mobilinx","country":"Canada","status":"Active","sector":"Transportation","subsector":"Light rail transit PPP","investmentYear":2021,"headquarters":"Ontario","owners":[{"firm":"Equitix","vehicle":"John Laing Investments Limited","investmentYear":2021,"stake":"Repository cites John Laing 35%; current manager-level split not disclosed","isActive":true}],"description":"The repository treats Mobilinx as the ProjectCo for Ontario's Hurontario LRT/Hazel McCallion Line and attributes John Laing's project interest to Equitix through John Laing Investments Limited.","milestones":[{"date":"Sep 2019","event":"Mobilinx reached financial close on the DBFOM project.","category":"Financing"},{"date":"Sep 22, 2021","event":"The repository attributes the project to Equitix/KKR-backed John Laing Investments Limited.","category":"Acquisition"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the canonical ProjectCo/concession identity and relationship among Mobilinx, Mobilinx Transit, Hurontario LRT, Hazel McCallion Line, Metrolinx, constructors, operators and service contractors. Reconstruct equity ownership at financial close and every subsequent transfer. Specifically determine whether John Laing's disclosed 35% project stake moved into the 2021 Equitix/KKR John Laing Investments Limited secondary portfolio, remained with KKR-owned John Laing Group, or followed another entity. Identify exact direct owners, manager/fund/vehicle, stakes, announcement and legal closing dates, co-owners and current ownership. Search through the as-of date for project restructurings, construction completion, refinancing, stake sale, portfolio disposal, owner transfer, Equitix/KKR/John Laing exit or signed pending transaction. Do not treat contractors, lenders or Metrolinx as equity owners.

RESEARCH RULES
- Resolve canonical project-company/display identity, aliases, current/former owners and authority/ProjectCo/contractor boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Preserve 35% only if it remains attributable to the same canonical project stake.
- Search through 2026-08-19 for sale, transfer, recapitalization, refinancing, project completion/restructure, portfolio disposal, ownership change and signed pending transactions.
- Verify geography, project scope, route length/stops, contract model, operating status and public counterparty.
- Reopen direct pages and filings. Prefer Mobilinx, Metrolinx/Infrastructure Ontario, John Laing, Equitix, KKR, regulatory/filing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material current-ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.mobilinx.ca/
- https://data.fca.org.uk/artefacts/NSM/RNS/4118829.html
- https://www.debevoise.com/news/2021/05/debevoise-advises-pantheon-in-its-role-in
- https://www.mississauga.ca/projects-and-strategies/city-projects/hurontario-light-rail-transit/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
