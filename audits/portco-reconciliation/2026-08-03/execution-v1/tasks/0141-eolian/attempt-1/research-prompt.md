Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Eolian
MANAGERS TO RESOLVE: Global Infrastructure Partners, BlackRock
TASK: ledger:0141:eolian:ae9eb0a5
CANONICAL KEY: eolian|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: BlackRock MATCHED_ELSEWHERE: GIP renewable development platform; not a legacy BlackRock direct holding.","censusRows":[{"manager":"Global Infrastructure Partners","disposition":"VERIFIED_EXISTING","rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: BlackRock MATCHED_ELSEWHERE: GIP renewable development platform; not a legacy BlackRock direct holding.","evidenceUrls":["https://www.eolianenergy.com/","https://www.eolianenergy.com/press/global-infrastructure-partners-announces-acquisition-of-map-energys-renewable-energy-business"]}],"repoOnlyRows":[{"manager":"BlackRock","sourceDisposition":"MATCHED_ELSEWHERE","disposition":"CONSOLIDATION_REVIEW","rationale":"GIP renewable development platform; not a legacy BlackRock direct holding.","evidenceUrls":["https://www.eolianenergy.com/press/global-infrastructure-partners-announces-acquisition-of-map-energys-renewable-energy-business"]}],"repoRows":[{"productionCompanyId":"cmrxpjgka00ytivhen28z6djw","seedKey":"eolian|United States","sourcePresence":"BOTH","disposition":"MATCHED_CENSUS"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjgka00ytivhen28z6djw","name":"Eolian","country":"United States","status":"Active","sector":"Power & ET","subsector":"Renewable project development and battery storage","headquarters":"Multi-state U.S. operations","description":"Eolian develops, owns, and operates renewable-energy and battery-storage projects in the United States. Its counterparties include utilities, power-market participants, and infrastructure partners seeking utility-scale storage and renewable capacity. The platform uses an asset-heavy model focused on project development, ownership, and long-duration operating assets rather than an advisory or service-only approach. Public materials indicate that GIP acquired MAP Energy’s renewable-energy business in 2020 and used that acquisition to establish the Eolian platform, which later consolidated the remaining interests in the Able Grid joint venture. The company’s footprint is multi-state, but the sources reviewed do not disclose revenue, employee count, or a single current portfolio-capacity figure for the overall platform. Eolian remains part of GIP’s renewable-power portfolio.","owners":[{"id":"cmrxpk2ct01xdivheok0jco5h","firm":"GIP","vehicle":"GIP IV","investmentYear":2020,"isActive":true}],"milestones":[{"date":"Dec 23, 2021","event":"Eolian acquired the remaining ownership interests in Able Grid Energy Solutions.","category":"Acquisition"},{"date":"Dec 29, 2020","event":"Global Infrastructure Partners (GIP) announced the acquisition of MAP Energy's renewable-energy business to form Eolian.","category":"Acquisition"}],"sources":[{"label":"Eolianenergy — Eolian","url":"https://www.eolianenergy.com/","purpose":"COMPANY_PROFILE"},{"label":"Announcement date source — Global Infrastructure Partners — Eolian","url":"https://www.eolianenergy.com/press/global-infrastructure-partners-announces-acquisition-of-map-energys-renewable-energy-business","purpose":"OWNERSHIP_INVESTMENT"},{"label":"Eolianenergy — Eolian","url":"https://www.eolianenergy.com/press/eolian-acquires-remaining-ownership-interests-in-able-grid-energy-solutions","purpose":"MILESTONE_EVENT"}]}

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
- https://www.eolianenergy.com/
- https://www.eolianenergy.com/press/global-infrastructure-partners-announces-acquisition-of-map-energys-renewable-energy-business
- https://www.eolianenergy.com/press/eolian-acquires-remaining-ownership-interests-in-able-grid-energy-solutions

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.

