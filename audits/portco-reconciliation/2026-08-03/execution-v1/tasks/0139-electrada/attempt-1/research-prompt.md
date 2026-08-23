Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Electrada
MANAGERS TO RESOLVE: BlackRock, Global Infrastructure Partners
TASK: ledger:0139:electrada:10ae1f7f
CANONICAL KEY: electrada|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES","RETIRE_OWNERSHIP"],"rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: BlackRock PROPOSED_RETIRE: Asset base acquired by third party, indicating exit. Global Infrastructure Partners MATCHED_ELSEWHERE: Attributable to legacy BlackRock infrastructure vehicles, not GIP","censusRows":[],"repoOnlyRows":[{"manager":"BlackRock","sourceDisposition":"PROPOSED_RETIRE","disposition":"OWNERSHIP_RETIREMENT_REVIEW","rationale":"Asset base acquired by third party, indicating exit.","evidenceUrls":["https://inspirationmobility.com/news/inspiration-mobility-group-acquires-electrada-assets-to-scale-end-to-end-electric-fuel-solutions-for-commercial-fleets"]},{"manager":"Global Infrastructure Partners","sourceDisposition":"MATCHED_ELSEWHERE","disposition":"CONSOLIDATION_REVIEW","rationale":"Attributable to legacy BlackRock infrastructure vehicles, not GIP","evidenceUrls":[]}],"repoRows":[{"productionCompanyId":"cmrxpj8vz00n2ivhe9ik74yeq","seedKey":"electrada|United States","sourcePresence":"BOTH","disposition":"RETAIN_UNLINKED"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpj8vz00n2ivhe9ik74yeq","name":"Electrada","country":"United States","status":"Active","sector":"Transportation","subsector":"EV fleet charging infrastructure","yearFounded":2020,"headquarters":"Multi-state United States","description":"Electrada provides electric-fleet charging infrastructure and electric-fuel management solutions for commercial vehicle operators. Its customer base includes fleets that want to electrify without funding charging infrastructure through large upfront capital expenditure. The operating model is asset-heavy and contracted because the company finances, owns, and manages charging infrastructure under long-term service and performance arrangements. Company materials state that the platform launched in 2020 and markets a zero-capex model with uptime and performance commitments to fleet operators. Its deployment footprint spans multiple US states across fleet, municipal, and commercial transportation use cases. BlackRock led Electrada's Series B funding in 2021 and added follow-on capital in 2023, while public sources do not disclose the precise ownership percentage.","owners":[{"id":"cmrxpju4l01kiivheyfgagvuj","firm":"BlackRock","vehicle":"n.a.","fundName":"BlackRock Global Energy & Power Infrastructure Fund III","investmentYear":2021,"isActive":true}],"milestones":[{"date":"2023","event":"BlackRock committed an additional $22 million to support expansion of the platform.","category":"Financing"},{"date":"2021","event":"BlackRock led Electrada's Series B financing.","category":"Financing"},{"date":"2020","event":"Electrada launched its electric-fleet charging platform.","category":"Founding"}],"sources":[{"label":"Electrada — Electrada","url":"https://electrada.com/","purpose":"COMPANY_PROFILE"},{"label":"Electrada — Electrada","url":"https://electrada.com/company/","purpose":"SUPPORTING_CONTEXT"},{"label":"Investment date source — BlackRock — Electrada","url":"https://electrada.com/news/blackrock-ev-charging-expansion/","purpose":"OWNERSHIP_INVESTMENT"}]}

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
- https://inspirationmobility.com/news/inspiration-mobility-group-acquires-electrada-assets-to-scale-end-to-end-electric-fuel-solutions-for-commercial-fleets
- https://electrada.com/
- https://electrada.com/company/
- https://electrada.com/news/blackrock-ev-charging-expansion/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.

