Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Environmental 360 Solutions
MANAGERS TO RESOLVE: BlackRock, Global Infrastructure Partners
TASK: ledger:0140:environmental-360-solutions:28da2905
CANONICAL KEY: environmental-360-solutions|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: Global Infrastructure Partners MATCHED_ELSEWHERE: Attributable to legacy BlackRock infrastructure vehicles, not GIP","censusRows":[{"manager":"BlackRock","disposition":"VERIFIED_EXISTING","rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: Global Infrastructure Partners MATCHED_ELSEWHERE: Attributable to legacy BlackRock infrastructure vehicles, not GIP","evidenceUrls":["https://e360s.ca/our-media/environmental-360-solutions-inc-announces-closing-of-acquisition-by-blackrock-alternatives/"]}],"repoOnlyRows":[{"manager":"Global Infrastructure Partners","sourceDisposition":"MATCHED_ELSEWHERE","disposition":"CONSOLIDATION_REVIEW","rationale":"Attributable to legacy BlackRock infrastructure vehicles, not GIP","evidenceUrls":[]}],"repoRows":[{"productionCompanyId":"cmrxpj8wj00n3ivheefc305n4","seedKey":"environmental 360 solutions|Canada","sourcePresence":"BOTH","disposition":"MATCHED_CENSUS"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpj8wj00n3ivheefc305n4","name":"Environmental 360 Solutions","country":"Canada","status":"Active","sector":"Social Infra","subsector":"Waste management and environmental services","yearFounded":2018,"headquarters":"Alberta, British Columbia, Ontario, Québec, and Saskatchewan","description":"Environmental 360 Solutions is a Canadian waste-management and environmental-services platform serving municipal, commercial, and industrial customers. Its operating model is asset-heavy because it relies on owned collection routes, transfer, processing, disposal, and related environmental infrastructure. Public company materials describe a workforce of more than 2,200 people and service to more than 750,000 customers across Canada. Operations are concentrated in Alberta, British Columbia, Ontario, Québec, and Saskatchewan. The company was founded in 2018 and has expanded through acquisitions to build a national waste and environmental-services platform. BlackRock Alternatives announced the acquisition of a majority interest in 2023, while the founder remained one of the largest individual shareholders and exact ownership percentages were not publicly disclosed.","owners":[{"id":"cmrxpju7d01kjivhel2xkl0z1","firm":"BlackRock","vehicle":"n.a.","fundName":"BlackRock Global Energy & Power Infrastructure Fund III","investmentYear":2023,"isActive":true}],"milestones":[{"date":"Feb 16, 2023","event":"Environmental 360 Solutions announced the closing of BlackRock Alternatives' acquisition of a majority interest.","category":"Acquisition"},{"date":"2018","event":"Environmental 360 Solutions was founded.","category":"Founding"}],"sources":[{"label":"E360S — Environmental 360 Solutions","url":"https://e360s.ca/","purpose":"COMPANY_PROFILE"},{"label":"E360S — Environmental 360 Solutions","url":"https://e360s.ca/about-us/","purpose":"COMPANY_PROFILE"},{"label":"E360S — Environmental 360 Solutions","url":"https://e360s.ca/about-us/shareholders/","purpose":"COMPANY_PROFILE"},{"label":"Close date source — BlackRock — Environmental 360 Solutions","url":"https://e360s.ca/our-media/environmental-360-solutions-inc-announces-closing-of-acquisition-by-blackrock-alternatives/","purpose":"OWNERSHIP_INVESTMENT"}]}

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
- https://e360s.ca/our-media/environmental-360-solutions-inc-announces-closing-of-acquisition-by-blackrock-alternatives/
- https://e360s.ca/
- https://e360s.ca/about-us/
- https://e360s.ca/about-us/shareholders/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.

