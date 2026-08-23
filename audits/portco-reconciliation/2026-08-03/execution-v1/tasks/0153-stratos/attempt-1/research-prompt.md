Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: STRATOS
MANAGERS TO RESOLVE: BlackRock, Global Infrastructure Partners
TASK: ledger:0153:stratos:4f72c101
CANONICAL KEY: stratos|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: Global Infrastructure Partners MATCHED_ELSEWHERE: Attributable to legacy BlackRock infrastructure vehicles, not GIP","censusRows":[{"manager":"BlackRock","disposition":"VERIFIED_EXISTING","rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: Global Infrastructure Partners MATCHED_ELSEWHERE: Attributable to legacy BlackRock infrastructure vehicles, not GIP","evidenceUrls":["https://www.1pointfive.com/news/1pointfive-holds-groundbreaking","https://www.1pointfive.com/news/occidental-and-blackrock-form-joint-venture-to-develop-stratos"]}],"repoOnlyRows":[{"manager":"Global Infrastructure Partners","sourceDisposition":"MATCHED_ELSEWHERE","disposition":"CONSOLIDATION_REVIEW","rationale":"Attributable to legacy BlackRock infrastructure vehicles, not GIP","evidenceUrls":[]}],"repoRows":[{"productionCompanyId":"cmrxpj91y00ndivhejiuocayx","seedKey":"stratos|United States","sourcePresence":"BOTH","disposition":"MATCHED_CENSUS"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpj91y00ndivhejiuocayx","name":"STRATOS","country":"United States","status":"Active","sector":"Power & ET","subsector":"Direct air capture / carbon removal","yearFounded":2023,"headquarters":"Texas","description":"STRATOS is a direct-air-capture project being developed in Ector County, Texas. The facility is intended to remove carbon dioxide directly from the atmosphere and serve carbon-management and sequestration markets rather than conventional power demand. Its operating model is asset-heavy and project-based because value depends on a large-scale carbon-removal facility, associated sequestration infrastructure, and contracted carbon-management demand. 1PointFive's public materials state that the project is designed to capture up to 500,000 tonnes of carbon dioxide per year. Operations are concentrated in Texas as a single flagship carbon-removal facility. Occidental and BlackRock announced a joint venture for the project in 2023, but public sources do not disclose the final ownership percentages between 1PointFive and BlackRock clients.","owners":[{"id":"cmrxpjucr01kuivhepouw6j00","firm":"BlackRock","vehicle":"Diversified Infrastructure","investmentYear":2023,"isActive":true}],"milestones":[{"date":"Apr 3, 2025","event":"Occidental and 1PointFive announced receipt of Class VI permits for STRATOS.","category":"Other"},{"date":"Nov 7, 2023","event":"Occidental and BlackRock signed a definitive agreement to form a joint venture to own and develop STRATOS.","category":"Financing"},{"date":"Sep 22, 2023","event":"1PointFive held the groundbreaking ceremony for the facility.","category":"Expansion"}],"sources":[{"label":"1Pointfive — STRATOS","url":"https://www.1pointfive.com/projects/ector-county-tx","purpose":"OPERATIONS_ASSETS"},{"label":"Announcement date source — BlackRock — STRATOS","url":"https://www.1pointfive.com/news/occidental-and-blackrock-form-joint-venture-to-develop-stratos","purpose":"OWNERSHIP_INVESTMENT"},{"label":"1Pointfive — STRATOS","url":"https://www.1pointfive.com/news/1pointfive-holds-groundbreaking","purpose":"SUPPORTING_CONTEXT"},{"label":"1Pointfive — STRATOS","url":"https://www.1pointfive.com/news/occidental-and-1pointfive-secure-class-vi-permits-for-stratos-direct-air-capture-facility","purpose":"SUPPORTING_CONTEXT"}]}

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
- https://www.1pointfive.com/news/1pointfive-holds-groundbreaking
- https://www.1pointfive.com/news/occidental-and-blackrock-form-joint-venture-to-develop-stratos
- https://www.1pointfive.com/projects/ector-county-tx
- https://www.1pointfive.com/news/occidental-and-1pointfive-secure-class-vi-permits-for-stratos-direct-air-capture-facility

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.

