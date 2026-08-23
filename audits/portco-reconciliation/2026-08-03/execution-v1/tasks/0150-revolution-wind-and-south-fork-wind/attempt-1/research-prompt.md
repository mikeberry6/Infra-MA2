Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Revolution Wind & South Fork Wind
MANAGERS TO RESOLVE: Global Infrastructure Partners, BlackRock
TASK: ledger:0150:revolution-wind-and-south-fork-wind:141c088f
CANONICAL KEY: revolution-wind-and-south-fork-wind|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: BlackRock MATCHED_ELSEWHERE: GIP offshore wind assets via Skyborn JV; reconciled under GIP.","censusRows":[{"manager":"Global Infrastructure Partners","disposition":"VERIFIED_EXISTING","rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: BlackRock MATCHED_ELSEWHERE: GIP offshore wind assets via Skyborn JV; reconciled under GIP.","evidenceUrls":["https://revolution-wind.com/about-revolution-wind","https://southforkwind.com/about-south-fork-wind","https://www.eversource.com/content/residential/about/news-room/massachusetts/news-releases/eversource-completes-sale-of-offshore-wind-stakes"]}],"repoOnlyRows":[{"manager":"BlackRock","sourceDisposition":"MATCHED_ELSEWHERE","disposition":"CONSOLIDATION_REVIEW","rationale":"GIP offshore wind assets via Skyborn JV; reconciled under GIP.","evidenceUrls":["https://www.businesswire.com/news/home/20240930672791/en/Eversource-Energy-Completes-Exit-of-Offshore-Wind-Business"]}],"repoRows":[{"productionCompanyId":"cmrxpjgkv00yuivhek3goid87","seedKey":"revolution wind & south fork wind|United States","sourcePresence":"BOTH","disposition":"MATCHED_CENSUS"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjgkv00yuivhek3goid87","name":"Revolution Wind & South Fork Wind","country":"United States","status":"Active","sector":"Power & ET","subsector":"Offshore wind generation","headquarters":"Rhode Island; New York","description":"Revolution Wind and South Fork Wind are offshore wind projects serving the Northeast U.S. power market. Their end markets are utility-scale electricity systems in Rhode Island, Connecticut, and New York that require contracted renewable generation and related transmission infrastructure. The projects follow an asset-heavy model characteristic of offshore wind, with economics tied to long-term offtake arrangements, construction execution, and operation of large-scale generation assets. South Fork Wind reached commercial operations first, while Revolution Wind has been under construction for the regional offshore market. In 2024, Eversource completed the sale of its 50% stakes in both projects to Global Infrastructure Partners’ Skyborn Renewables, leaving Ørsted and Skyborn as joint venture partners. Public disclosures reviewed do not provide a combined employee count or revenue figure for the two-project ownership structure.","owners":[{"id":"cmrxpk2dc01xeivheu69xialw","firm":"BlackRock","vehicle":"n.a.","fundName":"BlackRock GIF IV","investmentYear":2024,"isActive":true}],"milestones":[{"date":"Oct 1, 2024","event":"Skyborn said it had entered the U.S. offshore wind joint venture with Ørsted after completing the 50% stake acquisition.","category":"Acquisition"},{"date":"Sep 30, 2024","event":"Eversource completed the sale of its 50% interests in South Fork Wind and Revolution Wind to Global Infrastructure Partners (GIP), with ownership managed through GIP portfolio company Skyborn Renewables.","category":"Acquisition"},{"date":"2023","event":"South Fork Wind moved through final construction and commissioning phases.","category":"Expansion"},{"date":"2019","event":"South Fork Wind and Revolution Wind advanced through major state procurement and development milestones.","category":"Other"}],"sources":[{"label":"Revolution Wind — Revolution Wind & South Fork Wind","url":"https://revolution-wind.com/about-revolution-wind","purpose":"COMPANY_PROFILE"},{"label":"Close date source — Global Infrastructure Partners — Revolution Wind & South Fork Wind","url":"https://www.businesswire.com/news/home/20240930672791/en/Eversource-Energy-Completes-Exit-of-Offshore-Wind-Business","purpose":"OWNERSHIP_INVESTMENT"},{"label":"Close date source — Global Infrastructure Partners / Skyborn — Revolution Wind & South Fork Wind","url":"https://www.skybornrenewables.com/articles/newsroom/skyborn_enters_us_joint_venture","purpose":"OWNERSHIP_INVESTMENT"}]}

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
- https://revolution-wind.com/about-revolution-wind
- https://southforkwind.com/about-south-fork-wind
- https://www.eversource.com/content/residential/about/news-room/massachusetts/news-releases/eversource-completes-sale-of-offshore-wind-stakes
- https://www.businesswire.com/news/home/20240930672791/en/Eversource-Energy-Completes-Exit-of-Offshore-Wind-Business
- https://www.skybornrenewables.com/articles/newsroom/skyborn_enters_us_joint_venture

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.

