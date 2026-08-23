Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Chester County Hyperscale Data Center
MANAGERS TO RESOLVE: Harrison Street; FifteenFortySeven Critical Systems Realty / 1547 Critical Systems Realty; Green Fig Land Company; identify all direct current and former owners
TASK: ledger:0275:chester-county-hyperscale-data-center:d9586e4e
CANONICAL KEY: chester-county-hyperscale-data-center|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"The manager census treated the Chester County hyperscale campus as an underlying 1547 development rather than a separate Harrison Street manager-level holding and proposed rolling it into the 1547 Critical Systems Realty platform. The repository publishes it as a standalone PortCo. Verify the boundary and ownership rather than assuming either treatment.","productionCompanyId":"cmrxpjhhn010aivhee8ifpr5g","seedKey":"chester county hyperscale data center|United States","linkedTaskId":"ledger:0273:1547-critical-systems-realty:8e267688","startingEvidence":["https://www.datacenterdynamics.com/en/news/1547-csr-planning-2-million-sq-ft-150mw-campus-outside-philadelphia-pennsylvania/","https://www.eastwhiteland.org/news_detail_T2_R162.php"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Chester County Hyperscale Data Center","country":"United States","status":"Active","sector":"Digital","subsector":"Hyperscale data center development","website":null,"yearFounded":null,"investmentYear":2024,"headquarters":"Pennsylvania","owners":[{"firm":"Harrison Street","vehicle":"n.a.","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2024,"isActive":true}],"description":"The repository describes a planned East Whiteland Township, Pennsylvania data-center campus on more than 100 acres, initially envisioned as two facilities totaling about 2 million square feet with roughly 150 MW initially and potentially about 290 MW. It identifies 1547 Critical Systems Realty and Green Fig Land Company as development partners, but says Harrison Street's relationship may be platform-level rather than disclosed at the project-company level.","milestones":[{"date":"2022–2023","event":"Planning and zoning materials advanced for the East Whiteland Township campus.","category":"Other"},{"date":"Feb 2024","event":"A Harrison Street-linked 1547 data-center fund was reported as targeting the campus.","category":"Financing"},{"date":"2025","event":"The repository says the campus moved into construction with initial operations expected in 2025–2026.","category":"Expansion"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the project's exact name, legal/site entities, aliases and relationship to 1547 Critical Systems Realty, Green Fig Land Company and any Harrison Street-sponsored joint venture or fund. Determine whether Harrison Street owns this project directly, indirectly through a dedicated asset/JV vehicle, only through a broader portfolio relationship, or not at all. Verify each current/former direct owner, vehicle/fund, stake, announcement date, legal closing or contribution date and current transaction state. Do not infer Harrison Street ownership merely from a reported 1547 fundraising effort. Search land, zoning, utility/interconnection, construction, financing and company records for current owner/developer identity and project status; establish whether construction actually started and whether the capacity/footprint claims remain current. Search through the cutoff for sale, recapitalization, development transfer, cancellation, signed pending disposition or operator change. Define whether this is a standalone manager-level investment, an underlying project to exclude, or a project that should merge into the linked 1547 platform task. Identify which repository facts should be corrected or removed if direct evidence is absent.

RESEARCH RULES
- Resolve canonical identity, aliases, platform/JV/project-SPV boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing/entry date, exit date and transaction state; use NOT_PUBLICLY_DISCLOSED rather than inference.
- Search through 2026-08-19 for ownership transfers, recapitalizations, exits, cancellations and signed pending transactions.
- Count the manager-level investment once. A campus or development project beneath 1547 is not a separate PortCo unless evidence establishes it as Harrison Street's standalone manager-level holding.
- Reopen direct pages and filings. Prefer township/county records, 1547, Harrison Street, Green Fig, utilities, land records and transaction parties. Use UNRESOLVED when material identity or current ownership cannot be established.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.datacenterdynamics.com/en/news/1547-csr-planning-2-million-sq-ft-150mw-campus-outside-philadelphia-pennsylvania/
- https://www.datacenterdynamics.com/en/news/1547-csr-seeks-to-raise-250m-for-data-center-fund-report/
- https://www.eastwhiteland.org/news_detail_T2_R162.php
- https://baxtel.com/data-center/1547-chester-county-pa
- https://dcmag.fr/1547-critical-systems-realty-veut-lever-250-millions-supplementaire-pour-son-fonds-datacenters/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
