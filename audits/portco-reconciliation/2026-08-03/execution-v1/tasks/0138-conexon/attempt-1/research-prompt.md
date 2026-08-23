Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Conexon
MANAGERS TO RESOLVE: BlackRock, Global Infrastructure Partners
TASK: ledger:0138:conexon:5a11e528
CANONICAL KEY: conexon|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: BlackRock OUT_OF_SCOPE: Held under Impact Opportunities, not infrastructure. Global Infrastructure Partners MATCHED_ELSEWHERE: Attributable to legacy BlackRock infrastructure vehicles, not GIP","censusRows":[],"repoOnlyRows":[{"manager":"BlackRock","sourceDisposition":"OUT_OF_SCOPE","disposition":"SCOPE_REVIEW","rationale":"Held under Impact Opportunities, not infrastructure.","evidenceUrls":["https://www.blackrock.com/us/individual/investment-ideas/alternative-investments/blackrock-impact-opportunities"]},{"manager":"Global Infrastructure Partners","sourceDisposition":"MATCHED_ELSEWHERE","disposition":"CONSOLIDATION_REVIEW","rationale":"Attributable to legacy BlackRock infrastructure vehicles, not GIP","evidenceUrls":[]}],"repoRows":[{"productionCompanyId":"cmrxpj8uv00n0ivheku4opk63","seedKey":"conexon|United States","sourcePresence":"BOTH","disposition":"RETAIN_UNLINKED"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpj8uv00n0ivheku4opk63","name":"Conexon","country":"United States","status":"Active","sector":"Digital","subsector":"Rural fiber broadband","yearFounded":2015,"headquarters":"Missouri and multi-state rural United States","description":"Conexon is a broadband platform that works with electric cooperatives to plan, build, finance, and operate fiber-to-the-home networks in rural areas. Its customer base is anchored by electric cooperatives and the residential and business subscribers served through those cooperative broadband systems. The business combines advisory, construction-management, network design, and retail ISP operations through Conexon Connect, creating a model that blends fee income with network-based recurring revenue. Company materials identify Kansas City, Missouri as headquarters and describe more than 800 employees and work with more than 275 electric cooperatives. Its geographic footprint spans rural markets across multiple US states where electric cooperatives are expanding fiber coverage. Transaction materials state that funds and accounts managed by BlackRock invested in Conexon in 2023, and public sources do not disclose the resulting ownership percentage.","owners":[{"id":"cmrxpju2v01kfivhes3cy8ooe","firm":"BlackRock","vehicle":"n.a.","fundName":"BlackRock Global Energy & Power Infrastructure Fund III","investmentYear":2023,"isActive":true}],"milestones":[{"date":"2023","event":"TAP Advisors disclosed an investment in Conexon by funds and accounts managed by BlackRock.","category":"Financing"},{"date":"2021","event":"Conexon launched Conexon Connect as its retail internet service provider platform.","category":"Expansion"},{"date":"2015","event":"Company materials identify Conexon's founding year as 2015.","category":"Founding"}],"sources":[{"label":"Conexon — Conexon","url":"https://conexon.us/about/about-conexon/","purpose":"COMPANY_PROFILE"},{"label":"Conexon — Conexon","url":"https://conexon.us/about/media-fact-sheet/","purpose":"OPERATIONS_ASSETS"},{"label":"Conexon — Conexon","url":"https://conexon.us/news/conexon-founding-partner-randy-klindt-named-ceo-of-companys-isp-entity-conexon-connect/","purpose":"SUPPORTING_CONTEXT"},{"label":"Investment date source — BlackRock — Conexon","url":"https://www.blackrock.com/us/individual/investment-ideas/alternative-investments/blackrock-impact-opportunities","purpose":"OWNERSHIP_INVESTMENT"},{"label":"Announcement date source — BlackRock — Conexon","url":"https://www.tapadvisors.com/selected-tap-advisors-transactions","purpose":"OWNERSHIP_INVESTMENT"}]}

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
- https://www.blackrock.com/us/individual/investment-ideas/alternative-investments/blackrock-impact-opportunities
- https://conexon.us/about/about-conexon/
- https://conexon.us/about/media-fact-sheet/
- https://conexon.us/news/conexon-founding-partner-randy-klindt-named-ceo-of-companys-isp-entity-conexon-connect/
- https://www.tapadvisors.com/selected-tap-advisors-transactions

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.

