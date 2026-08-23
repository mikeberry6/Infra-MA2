Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Gigapower
MANAGERS TO RESOLVE: BlackRock, Global Infrastructure Partners
TASK: ledger:0143:gigapower:24d5d5d3
CANONICAL KEY: gigapower|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: Global Infrastructure Partners MATCHED_ELSEWHERE: Attributable to legacy BlackRock infrastructure vehicles, not GIP","censusRows":[{"manager":"BlackRock","disposition":"VERIFIED_EXISTING","rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: Global Infrastructure Partners MATCHED_ELSEWHERE: Attributable to legacy BlackRock infrastructure vehicles, not GIP","evidenceUrls":["https://about.att.com/story/2023/gigapower.html"]}],"repoOnlyRows":[{"manager":"Global Infrastructure Partners","sourceDisposition":"MATCHED_ELSEWHERE","disposition":"CONSOLIDATION_REVIEW","rationale":"Attributable to legacy BlackRock infrastructure vehicles, not GIP","evidenceUrls":[]}],"repoRows":[{"productionCompanyId":"cmrxpj8xk00n5ivhezp5xja2f","seedKey":"gigapower|United States","sourcePresence":"BOTH","disposition":"MATCHED_CENSUS"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpj8xk00n5ivhezp5xja2f","name":"Gigapower","country":"United States","status":"Active","sector":"Digital","subsector":"Open-access fiber broadband","yearFounded":2023,"headquarters":"Multiple U.S. states","description":"Gigapower is a wholesale open-access fiber broadband platform formed by AT&T and BlackRock. The business builds, owns, and operates fiber networks that internet service providers can use to serve end customers, rather than selling only through a single captive retail brand. Its operating model is asset-heavy because value is tied to owned fiber infrastructure and recurring wholesale network revenues. AT&T's launch materials described plans to deploy multi-gig fiber in markets beyond AT&T's traditional footprint, and later reporting referenced operations across multiple states. The company launched in 2023 and has been building an open-access broadband footprint in the United States. AT&T and BlackRock announced the joint venture in 2022 and launched Gigapower in 2023, but public sources do not disclose the partners' percentage ownership.","owners":[{"id":"cmrxpju8701klivhews3qe3yr","firm":"BlackRock","vehicle":"Diversified Infrastructure","investmentYear":2023,"isActive":true}],"milestones":[{"date":"May 11, 2023","event":"AT&T and BlackRock closed the Gigapower joint venture and launched the open-access fiber platform.","category":"Financing"},{"date":"Dec 23, 2022","event":"AT&T and BlackRock signed a definitive agreement to form the Gigapower joint venture.","category":"Financing"}],"sources":[{"label":"Gigapower — Gigapower","url":"https://www.gigapower.com/about-us","purpose":"COMPANY_PROFILE"},{"label":"Close date source — BlackRock — Gigapower","url":"https://about.att.com/story/2023/gigapower.html","purpose":"OWNERSHIP_INVESTMENT"},{"label":"Announcement date source — BlackRock — Gigapower","url":"https://www.businesswire.com/news/home/20221223005039/en/ATT-and-BlackRock-to-Form-Gigapower-Joint-Venture-A-Wholesale-Fiber-Services-Provider","purpose":"OWNERSHIP_INVESTMENT"}]}

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
- https://about.att.com/story/2023/gigapower.html
- https://www.gigapower.com/about-us
- https://www.businesswire.com/news/home/20221223005039/en/ATT-and-BlackRock-to-Form-Gigapower-Joint-Venture-A-Wholesale-Fiber-Services-Provider

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.

