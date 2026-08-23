Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Indian Energy
MANAGERS TO RESOLVE: BlackRock, Global Infrastructure Partners
TASK: ledger:0145:indian-energy:6a5ea3ff
CANONICAL KEY: indian-energy|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: BlackRock OUT_OF_SCOPE: Held under Impact Opportunities, not infrastructure. Global Infrastructure Partners MATCHED_ELSEWHERE: Attributable to legacy BlackRock infrastructure vehicles, not GIP","censusRows":[],"repoOnlyRows":[{"manager":"BlackRock","sourceDisposition":"OUT_OF_SCOPE","disposition":"SCOPE_REVIEW","rationale":"Held under Impact Opportunities, not infrastructure.","evidenceUrls":["https://www.blackrock.com/us/individual/investment-ideas/alternative-investments/blackrock-impact-opportunities"]},{"manager":"Global Infrastructure Partners","sourceDisposition":"MATCHED_ELSEWHERE","disposition":"CONSOLIDATION_REVIEW","rationale":"Attributable to legacy BlackRock infrastructure vehicles, not GIP","evidenceUrls":[]}],"repoRows":[{"productionCompanyId":"cmrxpj8yo00n7ivhe4ceylarx","seedKey":"indian energy|United States","sourcePresence":"BOTH","disposition":"RETAIN_UNLINKED"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpj8yo00n7ivhe4ceylarx","name":"Indian Energy","country":"United States","status":"Active","sector":"Power & ET","subsector":"Microgrids and distributed energy","yearFounded":2009,"headquarters":"California","description":"Indian Energy develops and integrates microgrids, renewable generation, energy storage, and related distributed-energy systems. Its customer base includes tribal communities, commercial users, and institutional clients seeking resilient on-site power infrastructure. The business combines development, engineering, and systems integration with ownership participation in selected projects rather than a pure equipment-sales model. Company materials identify a headquarters in Southern California and state that the company is 100% Native American-owned, with a development pipeline that includes utility-scale renewable generation and long-duration storage. Operations are concentrated in California, with broader project activity in tribal and distributed-energy markets. BlackRock Impact Opportunities identified Indian Energy as a portfolio investment made in 2023, but public sources do not disclose the fund's ownership percentage or the company's full current capitalization.","owners":[{"id":"cmrxpju9601knivheepwf2q66","firm":"BlackRock","vehicle":"n.a.","fundName":"BlackRock Global Energy & Power Infrastructure Fund III","investmentYear":2023,"isActive":true}],"milestones":[{"date":"Aug 20, 2024","event":"Indian Energy announced financial close on the Viejas Enterprise microgrid project.","category":"Financing"},{"date":"2023","event":"BlackRock Impact Opportunities identified Indian Energy as a portfolio investment.","category":"Financing"},{"date":"2009","event":"Company materials identify Indian Energy's founding year as 2009.","category":"Founding"}],"sources":[{"label":"Indianenergy — Indian Energy","url":"https://indianenergy.com/about-ie/","purpose":"COMPANY_PROFILE"},{"label":"Indianenergy — Indian Energy","url":"https://indianenergy.com/indian-energy-announces-financial-close-on-the-viejas-enterprise-microgrid-project/","purpose":"OPERATIONS_ASSETS"},{"label":"Investment date source — BlackRock — Conexon","url":"https://www.blackrock.com/us/individual/investment-ideas/alternative-investments/blackrock-impact-opportunities","purpose":"OWNERSHIP_INVESTMENT"}]}

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
- https://indianenergy.com/about-ie/
- https://indianenergy.com/indian-energy-announces-financial-close-on-the-viejas-enterprise-microgrid-project/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.

