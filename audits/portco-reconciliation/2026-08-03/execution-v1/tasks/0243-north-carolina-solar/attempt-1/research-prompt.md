Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: North Carolina Solar
MANAGERS TO RESOLVE: Equitix; KKR; John Laing; identify all direct portfolio co-owners
TASK: ledger:0243:north-carolina-solar:5919d3cc
CANONICAL KEY: north-carolina-solar|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"This five-project John Laing solar portfolio is attributed to Equitix through a 2021 portfolio transfer, but no direct current Equitix confirmation was found. Resolve the exact portfolio boundary and current owner.","productionCompanyId":"cmrxpjf1j00wmivheot2d4ja5","seedKey":"north carolina solar|United States","startingEvidence":["https://data.fca.org.uk/artefacts/NSM/RNS/4118829.html","https://www.laing.com/portfolio/north-carolina-solar-us/"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"North Carolina Solar","country":"United States","status":"Active","sector":"Power & ET","subsector":"Utility-scale solar generation portfolio","investmentYear":2021,"headquarters":"North Carolina","owners":[{"firm":"Equitix","vehicle":"John Laing Investments Limited","investmentYear":2021,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"description":"The repository records five operating North Carolina solar projects totaling about 334 MW with Duke Energy Progress PPAs, attributed to Equitix/KKR-backed John Laing Investments Limited.","milestones":[{"date":"2018-2019","event":"The five projects reached commercial operation.","category":"Expansion"},{"date":"Sep 22, 2021","event":"The repository attributes the portfolio to Equitix/KKR-backed John Laing Investments Limited.","category":"Acquisition"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the canonical five-project portfolio identity, legal ProjectCos, project names/capacity and boundary versus US Solar Fund/Amber's separate eight-project Granite portfolio and other North Carolina solar assets. Reconstruct equity ownership from development/financial close through every later transfer. Specifically determine whether this portfolio was part of the 2021 Equitix/KKR acquisition of a John Laing secondary portfolio, remained with KKR-owned John Laing Group, or followed another structure. Identify exact direct owners, manager/fund/vehicle, stakes, announcement and legal closing dates, tax-equity versus sponsor equity, and current ownership. Search through the as-of date for refinancing, project or portfolio sale, ownership transfer, Equitix/KKR/John Laing exit, asset-level divestiture or signed pending transaction. Count the five projects as one manager-level portfolio, not separate PortCos.

RESEARCH RULES
- Resolve canonical portfolio/display identity, aliases, current/former owners and portfolio/ProjectCo/project boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not treat debt, tax equity or PPA counterparties as manager owners.
- Search through 2026-08-19 for sale, transfer, recapitalization, refinancing, portfolio disposal, ownership change and signed pending transactions.
- Verify location, project names, capacity, operating dates, offtakers and disclosed scale.
- Reopen direct pages and filings. Prefer John Laing, Equitix, KKR, FERC/utility/regulatory, tax-equity and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material current-ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.laing.com/portfolio/north-carolina-solar-us/
- https://data.fca.org.uk/artefacts/NSM/RNS/4118829.html
- https://www.debevoise.com/news/2021/05/debevoise-advises-pantheon-in-its-role-in
- https://assets.kwhanalytics.com/documents/public/dealflow/2019/Deal-Flow-V.pdf

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
