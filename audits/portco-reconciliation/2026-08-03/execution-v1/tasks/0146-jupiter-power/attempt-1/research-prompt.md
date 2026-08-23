Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Jupiter Power
MANAGERS TO RESOLVE: BlackRock, Global Infrastructure Partners
TASK: ledger:0146:jupiter-power:85379278
CANONICAL KEY: jupiter-power|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: Global Infrastructure Partners MATCHED_ELSEWHERE: Attributable to legacy BlackRock infrastructure vehicles, not GIP","censusRows":[{"manager":"BlackRock","disposition":"VERIFIED_EXISTING","rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: Global Infrastructure Partners MATCHED_ELSEWHERE: Attributable to legacy BlackRock infrastructure vehicles, not GIP","evidenceUrls":["https://www.jupiterpower.io/post/encap-investments-sells-jupiter-power-to-blackrock"]}],"repoOnlyRows":[{"manager":"Global Infrastructure Partners","sourceDisposition":"MATCHED_ELSEWHERE","disposition":"CONSOLIDATION_REVIEW","rationale":"Attributable to legacy BlackRock infrastructure vehicles, not GIP","evidenceUrls":[]}],"repoRows":[{"productionCompanyId":"cmrxpj8z800n8ivhe1tqmwbzz","seedKey":"jupiter power|United States","sourcePresence":"BOTH","disposition":"MATCHED_CENSUS"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpj8z800n8ivhe1tqmwbzz","name":"Jupiter Power","country":"United States","status":"Active","sector":"Power & ET","subsector":"Battery energy storage","yearFounded":2017,"headquarters":"Multi-state United States","description":"Jupiter Power develops, owns, and operates utility-scale battery energy storage projects in the United States. Its counterparties include utilities, load-serving entities, and power-market participants that contract for dispatchable storage capacity and ancillary services. The operating model is asset-heavy because the company owns large-scale battery systems and monetizes them through contracted and market-based storage revenues. Company materials describe an operating and development pipeline exceeding 11,000 MW, making it one of the larger dedicated storage platforms in the US market. Its footprint spans multiple US power markets rather than a single-region buildout. BlackRock acquired Jupiter Power from EnCap Investments in 2022, and public transaction materials described the company as having been sold to BlackRock.","owners":[{"id":"cmrxpju9r01koivhe4bl83vdo","firm":"BlackRock","vehicle":"Diversified Infrastructure","investmentYear":2022,"isActive":true}],"milestones":[{"date":"Jan 28, 2025","event":"Jupiter announced a $500 million upsized corporate credit facility to support expansion.","category":"Financing"},{"date":"2024","event":"Jupiter announced new battery storage projects totaling 652 MWh.","category":"Expansion"},{"date":"Nov 15, 2022","event":"EnCap Investments announced an agreement to sell Jupiter Power to BlackRock.","category":"Acquisition"},{"date":"2017","event":"Company materials identify Jupiter Power's founding year as 2017.","category":"Founding"}],"sources":[{"label":"Jupiterpower — Jupiter Power","url":"https://www.jupiterpower.io/","purpose":"COMPANY_PROFILE"},{"label":"Announcement date source — BlackRock — Jupiter Power","url":"https://www.jupiterpower.io/post/encap-investments-sells-jupiter-power-to-blackrock","purpose":"OWNERSHIP_INVESTMENT"},{"label":"Jupiterpower — Jupiter Power","url":"https://www.jupiterpower.io/post/jupiter-power-secures-500-million-in-upsized-corporate-credit-facility-to-accelerate-portfolio-expansion","purpose":"OPERATIONS_ASSETS"},{"label":"Jupiterpower — Jupiter Power","url":"https://www.jupiterpower.io/post/jupiter-power-announces-652-megawatt-hours-of-battery-storage-projects","purpose":"OPERATIONS_ASSETS"}]}

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
- https://www.jupiterpower.io/post/encap-investments-sells-jupiter-power-to-blackrock
- https://www.jupiterpower.io/
- https://www.jupiterpower.io/post/jupiter-power-secures-500-million-in-upsized-corporate-credit-facility-to-accelerate-portfolio-expansion
- https://www.jupiterpower.io/post/jupiter-power-announces-652-megawatt-hours-of-battery-storage-projects

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.

