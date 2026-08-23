Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Lighthouse
MANAGERS TO RESOLVE: BlackRock, Global Infrastructure Partners
TASK: ledger:0147:lighthouse:ab3fb5b8
CANONICAL KEY: lighthouse|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: Global Infrastructure Partners MATCHED_ELSEWHERE: Attributable to legacy BlackRock infrastructure vehicles, not GIP","censusRows":[{"manager":"BlackRock","disposition":"VERIFIED_EXISTING","rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: Global Infrastructure Partners MATCHED_ELSEWHERE: Attributable to legacy BlackRock infrastructure vehicles, not GIP","evidenceUrls":["https://www.businesswire.com/news/home/20231115151975/en/BlackRocks-Evergreen-Infrastructure-Fund-Partners-with-European-Institutional-Investors-to-Invest-in-Energy-Transition-and-Energy-Security"]}],"repoOnlyRows":[{"manager":"Global Infrastructure Partners","sourceDisposition":"MATCHED_ELSEWHERE","disposition":"CONSOLIDATION_REVIEW","rationale":"Attributable to legacy BlackRock infrastructure vehicles, not GIP","evidenceUrls":[]}],"repoRows":[{"productionCompanyId":"cmrxpj8zq00n9ivhed9tgikrv","seedKey":"lighthouse|United States","sourcePresence":"BOTH","disposition":"MATCHED_CENSUS"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpj8zq00n9ivhed9tgikrv","name":"Lighthouse","country":"United States","status":"Active","sector":"Power & ET","subsector":"Commercial and industrial solar and battery storage","headquarters":"Six U.S. states","description":"Lighthouse is a US commercial and industrial solar and battery storage platform. The platform's customers are commercial and industrial off-takers using distributed renewable generation and storage assets. Its model is asset-heavy and contracted because project returns depend on owned operating systems and underlying customer agreements. BlackRock's Evergreen Infrastructure fundraising materials described Lighthouse as an operating portfolio spanning six US states. Operations are therefore geographically diversified within the United States rather than concentrated in a single region. BlackRock disclosed in November 2023 that the Evergreen Infrastructure fund had signed definitive documentation to acquire Lighthouse, but public sources reviewed here do not disclose a completed closing or final ownership percentages.","owners":[{"id":"cmrxpjuac01kpivhefe29onwu","firm":"BlackRock","vehicle":"Evergreen Infrastructure Fund","fundName":"Evergreen Infrastructure Fund","investmentYear":2023,"isActive":true}],"milestones":[{"date":"Nov 15, 2023","event":"BlackRock stated that its Evergreen Infrastructure fund had signed definitive documentation to acquire Lighthouse.","category":"Acquisition"},{"date":"Nov 2023","event":"BlackRock described Lighthouse as a U.S. C&I solar and battery storage platform with an operating portfolio across six states.","category":"Expansion"}],"sources":[{"label":"Announcement date source — BlackRock — Lighthouse","url":"https://www.businesswire.com/news/home/20231115151975/en/BlackRocks-Evergreen-Infrastructure-Fund-Partners-with-European-Institutional-Investors-to-Invest-in-Energy-Transition-and-Energy-Security","purpose":"OWNERSHIP_INVESTMENT"},{"label":"Utility Dive — Lighthouse","url":"https://www.utilitydive.com/news/blackrock-secures-1b-energy-transition-evergreen-infrastructure-fund-ira/700464/","purpose":"SUPPORTING_CONTEXT"},{"label":"Esgtoday — Lighthouse","url":"https://www.esgtoday.com/blackrock-raises-1-billion-for-energy-transition-focused-infrastructure-fund/","purpose":"SUPPORTING_CONTEXT"}]}

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
- https://www.businesswire.com/news/home/20231115151975/en/BlackRocks-Evergreen-Infrastructure-Fund-Partners-with-European-Institutional-Investors-to-Invest-in-Energy-Transition-and-Energy-Security
- https://www.utilitydive.com/news/blackrock-secures-1b-energy-transition-evergreen-infrastructure-fund-ira/700464/
- https://www.esgtoday.com/blackrock-raises-1-billion-for-energy-transition-focused-infrastructure-fund/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.

