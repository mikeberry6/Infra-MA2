Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Clearway Energy Group
MANAGERS TO RESOLVE: Global Infrastructure Partners, BlackRock
TASK: ledger:0137:clearway-energy-group:fb84d1ab
CANONICAL KEY: clearway-energy-group|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: BlackRock MATCHED_ELSEWHERE: GIP-led renewable platform; routed to GIP task.","censusRows":[{"manager":"Global Infrastructure Partners","disposition":"VERIFIED_EXISTING","rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: BlackRock MATCHED_ELSEWHERE: GIP-led renewable platform; routed to GIP task.","evidenceUrls":["https://totalenergies.com/news/press-releases/united-states-totalenergies-acquires-50-clearway-5th-largest-us-renewable","https://www.clearwayenergygroup.com/"]}],"repoOnlyRows":[{"manager":"BlackRock","sourceDisposition":"MATCHED_ELSEWHERE","disposition":"CONSOLIDATION_REVIEW","rationale":"GIP-led renewable platform; routed to GIP task.","evidenceUrls":["https://totalenergies.com/news/press-releases/united-states-totalenergies-acquires-50-clearway-5th-largest-us-renewable"]}],"repoRows":[{"productionCompanyId":"cmrxpjgjr00ysivhenmpy1x6i","seedKey":"clearway energy group|United States","sourcePresence":"BOTH","disposition":"MATCHED_CENSUS"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjgjr00ysivhenmpy1x6i","name":"Clearway Energy Group","country":"United States","status":"Active","sector":"Power & ET","subsector":"Utility-scale renewable power and storage","yearFounded":2018,"headquarters":"Multi-state U.S. operations","description":"Clearway Energy Group develops, owns, and operates utility-scale wind, solar, and energy-storage assets across the United States. Its customers are utilities, corporates, and power-market counterparties that procure renewable generation and related clean-energy products through long-term contracts and market arrangements. The company runs an asset-heavy model built around owned generation assets, development pipelines, and contracted renewable power sales. At the time of TotalEnergies’ transaction announcement in 2022, public materials described Clearway as the fifth-largest U.S. renewable energy player. Global Infrastructure Partners and TotalEnergies agreed in May 2022 that TotalEnergies would acquire 50% of Clearway Energy Group. The platform continues to operate as a large U.S. renewable-generation and development business under that ownership structure.","owners":[{"id":"cmrxpk2cd01xcivhef8mj5h2n","firm":"BlackRock","vehicle":"n.a.","fundName":"Evergreen Infrastructure Fund","investmentYear":2018,"isActive":true}],"milestones":[{"date":"May 25, 2022","event":"TotalEnergies announced an agreement to acquire 50% of Clearway Energy Group from GIP.","category":"Acquisition"},{"date":"2022","event":"Clearway was described publicly as the fifth-largest U.S. renewable energy player.","category":"Expansion"},{"date":"Aug 31, 2018","event":"Global Infrastructure Partners (GIP) completed the acquisition of NRG's renewables platform and controlling interest in NRG Yield, forming Clearway Energy Group as an independent enterprise.","category":"Acquisition"},{"date":"2018","event":"Clearway Energy Group was founded.","category":"Founding"}],"sources":[{"label":"Clearwayenergygroup — Clearway Energy Group","url":"https://www.clearwayenergygroup.com/","purpose":"COMPANY_PROFILE"},{"label":"Close date source — Global Infrastructure Partners — Clearway Energy Group","url":"https://www.clearwayenergygroup.com/press-releases/clearway-energy-group-launches-operations/","purpose":"OWNERSHIP_INVESTMENT"},{"label":"Totalenergies — Clearway Energy Group","url":"https://totalenergies.com/news/press-releases/united-states-totalenergies-acquires-50-clearway-5th-largest-us-renewable","purpose":"MILESTONE_EVENT"},{"label":"Clearwayenergygroup — Clearway Energy Group","url":"https://www.clearwayenergygroup.com/about/leadership/","purpose":"COMPANY_PROFILE"}]}

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
- https://totalenergies.com/news/press-releases/united-states-totalenergies-acquires-50-clearway-5th-largest-us-renewable
- https://www.clearwayenergygroup.com/
- https://www.clearwayenergygroup.com/press-releases/clearway-energy-group-launches-operations/
- https://www.clearwayenergygroup.com/about/leadership/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.

