Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Excelsior U.S. Solar & Storage Portfolio
MANAGERS TO RESOLVE: BlackRock, Global Infrastructure Partners
TASK: ledger:0142:excelsior-u-s-solar-and-storage-portfolio:ec48f1c5
CANONICAL KEY: excelsior-u-s-solar-and-storage-portfolio|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: Global Infrastructure Partners MATCHED_ELSEWHERE: Attributable to legacy BlackRock infrastructure vehicles, not GIP","censusRows":[{"manager":"BlackRock","disposition":"VERIFIED_EXISTING","rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: Global Infrastructure Partners MATCHED_ELSEWHERE: Attributable to legacy BlackRock infrastructure vehicles, not GIP","evidenceUrls":["https://excelsiorcapital.com/news-insights/excelsior-energy-capital-sells-sub-portfolio-of-solar-and-solar-plus-storage-assets-to-blackrock/"]}],"repoOnlyRows":[{"manager":"Global Infrastructure Partners","sourceDisposition":"MATCHED_ELSEWHERE","disposition":"CONSOLIDATION_REVIEW","rationale":"Attributable to legacy BlackRock infrastructure vehicles, not GIP","evidenceUrls":[]}],"repoRows":[{"productionCompanyId":"cmrxpj8x000n4ivhefbfwnig3","seedKey":"excelsior u.s. solar & storage portfolio|United States","sourcePresence":"BOTH","disposition":"MATCHED_CENSUS"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpj8x000n4ivhefbfwnig3","name":"Excelsior U.S. Solar & Storage Portfolio","country":"United States","status":"Active","sector":"Power & ET","subsector":"Solar and solar-plus-storage portfolio","headquarters":"Multiple U.S. states","description":"This portfolio comprises operating US solar and solar-plus-storage assets acquired from Excelsior Energy Capital. The assets sell power under contracted structures and therefore have an operating model tied to long-lived renewable generation infrastructure rather than a development-only pipeline. Its revenue profile is asset-heavy and contracted because cash flows depend on the operating performance of the underlying projects and customer agreements. Public transaction materials described a 38-project portfolio totaling 89 MW across multiple US states. The assets form part of BlackRock's Evergreen Infrastructure strategy focused on energy transition and energy security investments. BlackRock's Evergreen Infrastructure fund acquired the portfolio in March 2024, and Excelsior announced that it had sold the sub-portfolio to BlackRock.","owners":[{"id":"cmrxpju7s01kkivheqy4idfr6","firm":"BlackRock","vehicle":"Evergreen Infrastructure Fund","fundName":"Evergreen Infrastructure Fund","investmentYear":2024,"isActive":true}],"milestones":[{"date":"Mar 12, 2024","event":"Excelsior Energy Capital announced the sale of a sub-portfolio of solar and solar-plus-storage assets to BlackRock.","category":"Acquisition"},{"date":"2024","event":"Natural Power announced support for BlackRock's acquisition of the operating portfolio.","category":"Acquisition"}],"sources":[{"label":"Investment date source — BlackRock — Excelsior U.S. Solar & Storage Portfolio","url":"https://excelsiorcapital.com/news-insights/excelsior-energy-capital-sells-sub-portfolio-of-solar-and-solar-plus-storage-assets-to-blackrock/","purpose":"OWNERSHIP_INVESTMENT"},{"label":"Naturalpower — Excelsior U.S. Solar & Storage Portfolio","url":"https://www.naturalpower.com/us/news/news-post/natural-power-supports-blackrocks-portfolio-acquisition-from-excelsior-energy-capital","purpose":"MILESTONE_EVENT"},{"label":"Excelsiorcapital — Excelsior U.S. Solar & Storage Portfolio","url":"https://excelsiorcapital.com/","purpose":"COMPANY_PROFILE"}]}

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
- https://excelsiorcapital.com/news-insights/excelsior-energy-capital-sells-sub-portfolio-of-solar-and-solar-plus-storage-assets-to-blackrock/
- https://www.naturalpower.com/us/news/news-post/natural-power-supports-blackrocks-portfolio-acquisition-from-excelsior-energy-capital
- https://excelsiorcapital.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.

