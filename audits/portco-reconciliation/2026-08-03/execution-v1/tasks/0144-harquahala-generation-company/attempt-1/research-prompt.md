Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Harquahala Generation Company
MANAGERS TO RESOLVE: BlackRock, Global Infrastructure Partners
TASK: ledger:0144:harquahala-generation-company:a9e2eada
CANONICAL KEY: harquahala-generation-company|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES","RETIRE_OWNERSHIP"],"rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: BlackRock PROPOSED_RETIRE: Sold to Capital Power, no longer held. Global Infrastructure Partners MATCHED_ELSEWHERE: Attributable to legacy BlackRock infrastructure vehicles, not GIP","censusRows":[],"repoOnlyRows":[{"manager":"BlackRock","sourceDisposition":"PROPOSED_RETIRE","disposition":"OWNERSHIP_RETIREMENT_REVIEW","rationale":"Sold to Capital Power, no longer held.","evidenceUrls":["https://www.capitalpower.com/media/media_releases/capital-power-completes-acquisition-of-the-1092-mw-harquahala-natural-gas-generation-facility-in-arizona/"]},{"manager":"Global Infrastructure Partners","sourceDisposition":"MATCHED_ELSEWHERE","disposition":"CONSOLIDATION_REVIEW","rationale":"Attributable to legacy BlackRock infrastructure vehicles, not GIP","evidenceUrls":[]}],"repoRows":[{"productionCompanyId":"cmrxpj8y400n6ivhelufjsj1z","seedKey":"harquahala generation company|United States","sourcePresence":"BOTH","disposition":"RETAIN_UNLINKED"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpj8y400n6ivhelufjsj1z","name":"Harquahala Generation Company","country":"United States","status":"Active","sector":"Power & ET","subsector":"Natural gas-fired generation","yearFounded":2004,"headquarters":"Arizona","description":"Harquahala Generation Company owns a large combined-cycle natural gas power plant in Arizona. The asset serves wholesale power needs through dispatchable generation and benefits from a contracted tolling structure rather than full merchant exposure. Its operating model is asset-heavy because value is tied to a single large thermal generation facility and its long-term operating agreements. Capital Power's transaction materials describe the plant as a 1,092 MW facility in Maricopa County with a tolling agreement extending through 2031. Operations are concentrated in Arizona as a single-asset generation business. Capital Power completed the acquisition in February 2024 through a 50-50 partnership with BlackRock's Diversified Infrastructure business.","owners":[{"id":"cmrxpju8p01kmivhernfcvtau","firm":"BlackRock","vehicle":"Diversified Infrastructure","investmentYear":2024,"isActive":true}],"milestones":[{"date":"Feb 16, 2024","event":"Capital Power and BlackRock completed the acquisition of the 1,092 MW Harquahala facility.","category":"Acquisition"},{"date":"Nov 14, 2023","event":"Capital Power announced the strategic acquisition of Harquahala and La Paloma through a 50-50 partnership with BlackRock.","category":"Acquisition"},{"date":"2004","event":"Capital Power materials indicate that Harquahala reached commercial operation in 2004.","category":"Expansion"}],"sources":[{"label":"Capitalpower — Harquahala Generation Company","url":"https://www.capitalpower.com/operations/harquahala/","purpose":"OPERATIONS_ASSETS"},{"label":"Capitalpower — Harquahala Generation Company","url":"https://www.capitalpower.com/media/media_releases/capital-power-announces-strategic-acquisition-of-two-u-s-gas-generation-facilities/","purpose":"MILESTONE_EVENT"},{"label":"Close date source — BlackRock — Harquahala Generation Company","url":"https://www.capitalpower.com/media/media_releases/capital-power-completes-acquisition-of-the-1092-mw-harquahala-natural-gas-generation-facility-in-arizona/","purpose":"OWNERSHIP_INVESTMENT"}]}

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
- https://www.capitalpower.com/media/media_releases/capital-power-completes-acquisition-of-the-1092-mw-harquahala-natural-gas-generation-facility-in-arizona/
- https://www.capitalpower.com/operations/harquahala/
- https://www.capitalpower.com/media/media_releases/capital-power-announces-strategic-acquisition-of-two-u-s-gas-generation-facilities/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.

