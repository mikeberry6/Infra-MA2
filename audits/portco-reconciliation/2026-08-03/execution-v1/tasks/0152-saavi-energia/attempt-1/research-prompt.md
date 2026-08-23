Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Saavi Energía
MANAGERS TO RESOLVE: Global Infrastructure Partners, BlackRock
TASK: ledger:0152:saavi-energia:20878d92
CANONICAL KEY: saavi-energia|mexico

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: BlackRock MATCHED_ELSEWHERE: GIP power platform in Mexico; reconciled under GIP.","censusRows":[{"manager":"Global Infrastructure Partners","disposition":"VERIFIED_EXISTING","rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: BlackRock MATCHED_ELSEWHERE: GIP power platform in Mexico; reconciled under GIP.","evidenceUrls":["https://www.global-infra.com/news/gip-acquires-saavi-energia-a-leading-independent-power-generator-in-mexico/","https://www.saavienergia.com/en/"]}],"repoOnlyRows":[{"manager":"BlackRock","sourceDisposition":"MATCHED_ELSEWHERE","disposition":"CONSOLIDATION_REVIEW","rationale":"GIP power platform in Mexico; reconciled under GIP.","evidenceUrls":["https://www.global-infra.com/news/gip-acquires-saavi-energia-a-leading-independent-power-generator-in-mexico/"]}],"repoRows":[{"productionCompanyId":"cmrxpjgly00ywivhe8rs5yjnm","seedKey":"saavi energía|Mexico","sourcePresence":"BOTH","disposition":"MATCHED_CENSUS"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjgly00ywivhe8rs5yjnm","name":"Saavi Energía","country":"Mexico","status":"Active","sector":"Power & ET","subsector":"Gas-fired generation and gas infrastructure","yearFounded":1995,"headquarters":"Baja California; Chihuahua; Guanajuato; Jalisco","description":"Saavi Energía generates and commercializes electricity and natural gas infrastructure services in Mexico. Its end markets include the Mexican power market, qualified-supply and legacy contractual arrangements, and reserve-capacity and export-linked markets connected to California. The company follows an asset-heavy operating model built around combined-cycle plants, gas compression stations, mobile turbines, and associated pipeline infrastructure. Current company materials describe a portfolio of six combined-cycle plants, one solar plant, three gas compression stations, three mobile turbines, and a 40-mile gas pipeline with more than 3.7 GW of installed capacity. Global Infrastructure Partners acquired Saavi from Actis in August 2021, and later company materials described GIP as the majority shareholder. Operations are concentrated in Mexico’s major industrial corridors, with assets in states including Baja California, Chihuahua, Guanajuato, and Jalisco.","owners":[{"id":"cmrxpk2fk01xiivhetq7dtfj4","firm":"BlackRock","vehicle":"n.a.","fundName":"BlackRock Global Energy & Power Infrastructure Fund III","investmentYear":2021,"isActive":true}],"milestones":[{"date":"Aug 20, 2021","event":"Global Infrastructure Partners (GIP) announced the acquisition of Saavi Energía from Actis.","category":"Acquisition"},{"date":"2018","event":"Actis acquired InterGen México’s portfolio and the Saavi Energía brand was established.","category":"Founding"},{"date":"1995","event":"InterGen México, the predecessor business identified by the company, was founded.","category":"Founding"}],"sources":[{"label":"Saavienergia — Saavi Energía","url":"https://www.saavienergia.com/en/","purpose":"SUPPORTING_CONTEXT"},{"label":"Saavienergia — Saavi Energía","url":"https://www.saavienergia.com/en/about-saavi/","purpose":"COMPANY_PROFILE"},{"label":"Saavienergia — Saavi Energía","url":"https://www.saavienergia.com/en/our-sites/","purpose":"SUPPORTING_CONTEXT"},{"label":"Announcement date source — Global Infrastructure Partners — Saavi Energía","url":"https://www.global-infra.com/news/gip-acquires-saavi-energia-a-leading-independent-power-generator-in-mexico/","purpose":"OWNERSHIP_INVESTMENT"}]}

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, predecessor/successor names, and platform-versus-subsidiary/project boundaries.
- Determine whether the company or asset is a manager-level North American infrastructure PortCo. Exclude debt, public securities, fund/LP exposure, non-infrastructure strategies, upstream commodity businesses without infrastructure economics, and subsidiaries/projects already counted under a platform.
- Verify every current and former direct owner, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer a fund, stake or closing.
- Handle BlackRock/GIP carefully: preserve the historical investing platform and vehicle; BlackRock's later ownership of GIP does not create a new PortCo ownership period unless the underlying investment legally transferred.
- Search through 2026-08-19 for sale, sold, exit, divestiture, transfer, recapitalization, merger, rebrand, bankruptcy and signed pending transactions. A signed buyer is not current until closing; the legal seller remains current during a pending exit.
- Verify North American geography, official website, headquarters, founding year, products/services, customers/end markets, operating footprint, scale and current operating status.
- Reopen direct pages. Prefer company, manager, regulator/government, filings and transaction-party releases. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.global-infra.com/news/gip-acquires-saavi-energia-a-leading-independent-power-generator-in-mexico/
- https://www.saavienergia.com/en/
- https://www.saavienergia.com/en/about-saavi/
- https://www.saavienergia.com/en/our-sites/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.

