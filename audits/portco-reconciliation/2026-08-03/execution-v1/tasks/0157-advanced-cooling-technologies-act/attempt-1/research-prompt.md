Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Advanced Cooling Technologies (ACT)
MANAGERS TO RESOLVE: Blackstone
TASK: ledger:0157:advanced-cooling-technologies-act:3ea176a7
CANONICAL KEY: advanced-cooling-technologies-act|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_PENDING_TRANSACTION"],"rationale":"The exact normalized company identity is established; ADD_PENDING_TRANSACTION requires individual review.","censusRows":[{"manager":"Blackstone","disposition":"PENDING_TRANSACTION","rationale":"The exact normalized company identity is established; ADD_PENDING_TRANSACTION requires individual review.","evidenceUrls":["https://www.blackstone.com/news/press/blackstone-energy-transition-partners-announces-agreement-to-acquire-majority-stake-in-advanced-cooling-technologies/"]}],"repoOnlyRows":[],"repoRows":[{"productionCompanyId":"cmrxpj96300ngivhermpkiwdm","seedKey":"advanced cooling technologies (act)|United States","sourcePresence":"BOTH","disposition":"MATCHED_CENSUS"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpj96300ngivhermpkiwdm","name":"Advanced Cooling Technologies (ACT)","country":"United States","status":"Active","sector":"Digital","subsector":"Thermal management and cooling systems","yearFounded":2003,"headquarters":"Pennsylvania","description":"Advanced Cooling Technologies designs and manufactures thermal management, heat transfer, and energy efficiency products used in data centers, defense, aerospace, electronics, HVAC, and industrial applications. The company sells engineered components and systems to original equipment manufacturers, end users, and government-related customers that require temperature control and power-density management. Its operating model is asset-heavy, with in-house engineering and manufacturing supporting both standard products and custom applications. Public materials identify Pennsylvania as its operating base, while its end markets extend across the United States. Blackstone Energy Transition Partners announced an agreement in March 2026 to acquire a majority stake, but post-closing ownership percentages were not publicly disclosed.","owners":[{"id":"cmrxpjuec01kxivhewxqrxgd0","firm":"Blackstone","vehicle":"n.a.","fundName":"Blackstone Energy Transition Partners IV (BETP IV)","investmentYear":2026,"isActive":true}],"milestones":[{"date":"Mar 11, 2026","event":"Blackstone Energy Transition Partners announced an agreement to acquire a majority stake in ACT.","category":"Acquisition"},{"date":"2015","event":"ACT acquired PCM Products to expand into phase change material and thermal storage applications.","category":"Expansion"},{"date":"2012","event":"The company acquired Q-Dot Technology to add advanced heat-spreader capabilities.","category":"Acquisition"},{"date":"2003","event":"Advanced Cooling Technologies was founded.","category":"Founding"}],"sources":[{"label":"1 Act — Advanced Cooling Technologies (ACT)","url":"https://www.1-act.com/","purpose":"COMPANY_PROFILE"},{"label":"1 Act — Advanced Cooling Technologies (ACT)","url":"https://www.1-act.com/about/","purpose":"COMPANY_PROFILE"},{"label":"Blackstone","url":"https://www.blackstone.com/news/press/blackstone-energy-transition-partners-announces-agreement-to-acquire-majority-stake-in-advanced-cooling-technologies/","purpose":"OWNERSHIP_INVESTMENT"}]}

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, predecessor/successor names, and platform-versus-subsidiary/project boundaries.
- Determine whether the company or asset is a manager-level North American infrastructure PortCo. Exclude debt, public securities, fund/LP exposure, non-infrastructure strategies, upstream commodity businesses without infrastructure economics, and subsidiaries/projects already counted under a platform.
- Verify every current and former direct owner, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer a fund, stake or closing.
- Preserve historical investing-platform identity across manager acquisitions or renames; a parent-manager transaction does not create a new PortCo ownership period unless the underlying investment legally transferred.
- Search through 2026-08-19 for sale, sold, exit, divestiture, transfer, recapitalization, merger, rebrand, bankruptcy and signed pending transactions. A signed buyer is not current until closing; the legal seller remains current during a pending exit.
- Verify North American geography, official website, headquarters, founding year, products/services, customers/end markets, operating footprint, scale and current operating status.
- Reopen direct pages. Prefer company, manager, regulator/government, filings and transaction-party releases. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.blackstone.com/news/press/blackstone-energy-transition-partners-announces-agreement-to-acquire-majority-stake-in-advanced-cooling-technologies/
- https://www.1-act.com/
- https://www.1-act.com/about/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.

