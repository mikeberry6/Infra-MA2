Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: National Renewable Solutions
MANAGERS TO RESOLVE: BlackRock, Global Infrastructure Partners
TASK: ledger:0148:national-renewable-solutions:2d543538
CANONICAL KEY: national-renewable-solutions|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: Global Infrastructure Partners MATCHED_ELSEWHERE: Attributable to legacy BlackRock infrastructure vehicles, not GIP","censusRows":[{"manager":"BlackRock","disposition":"VERIFIED_EXISTING","rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: Global Infrastructure Partners MATCHED_ELSEWHERE: Attributable to legacy BlackRock infrastructure vehicles, not GIP","evidenceUrls":["https://natrs.com/wp-content/uploads/2022/04/BlackRockAcquiresNRS_PressRelease_Final.pdf"]}],"repoOnlyRows":[{"manager":"Global Infrastructure Partners","sourceDisposition":"MATCHED_ELSEWHERE","disposition":"CONSOLIDATION_REVIEW","rationale":"Attributable to legacy BlackRock infrastructure vehicles, not GIP","evidenceUrls":[]}],"repoRows":[{"productionCompanyId":"cmrxpj90b00naivhedtmfwflb","seedKey":"national renewable solutions|United States","sourcePresence":"BOTH","disposition":"MATCHED_CENSUS"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpj90b00naivhedtmfwflb","name":"National Renewable Solutions","country":"United States","status":"Active","sector":"Power & ET","subsector":"Renewable project development","yearFounded":2011,"headquarters":"Minnesota and multi-state United States","description":"National Renewable Solutions is an early-stage wind and solar project development company. Its business centers on site origination, permitting, interconnection, land control, and development of utility-scale renewable projects for eventual construction or sale. The model is development-led rather than contracted utility ownership, but it remains capital-intensive because value depends on building a pipeline of viable renewable projects. Company materials identify Minnetonka, Minnesota as headquarters and describe activity across multiple US renewable markets. The company was founded in 2011 and has built a portfolio spanning wind, solar, and energy-storage opportunities. BlackRock acquired the company in 2021, and National Renewable Solutions announced that 100% of its shares had been purchased by BlackRock.","owners":[{"id":"cmrxpjuas01kqivhe76y9ulx8","firm":"BlackRock","vehicle":"n.a.","fundName":"BlackRock Global Energy & Power Infrastructure Fund III","investmentYear":2021,"isActive":true}],"milestones":[{"date":"Aug 18, 2021","event":"National Renewable Solutions announced that BlackRock had acquired 100% of the company.","category":"Acquisition"},{"date":"2011","event":"Company materials identify National Renewable Solutions' founding year as 2011.","category":"Founding"}],"sources":[{"label":"Natrs — National Renewable Solutions","url":"https://natrs.com/","purpose":"COMPANY_PROFILE"},{"label":"Natrs — National Renewable Solutions","url":"https://natrs.com/about/","purpose":"COMPANY_PROFILE"},{"label":"Investment date source — BlackRock — National Renewable Solutions","url":"https://natrs.com/wp-content/uploads/2022/04/BlackRockAcquiresNRS_PressRelease_Final.pdf","purpose":"OWNERSHIP_INVESTMENT"}]}

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
- https://natrs.com/wp-content/uploads/2022/04/BlackRockAcquiresNRS_PressRelease_Final.pdf
- https://natrs.com/
- https://natrs.com/about/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.

