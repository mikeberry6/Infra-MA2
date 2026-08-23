Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Copia Power
MANAGERS TO RESOLVE: Carlyle Infrastructure
TASK: ledger:0164:copia-power:4a395f9a
CANONICAL KEY: copia-power|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_PENDING_TRANSACTION"],"rationale":"The exact normalized company identity is established; ADD_PENDING_TRANSACTION requires individual review.","censusRows":[{"manager":"Carlyle Infrastructure","disposition":"PENDING_TRANSACTION","rationale":"The exact normalized company identity is established; ADD_PENDING_TRANSACTION requires individual review.","evidenceUrls":["https://eqtgroup.com/news/eqt-to-acquire-copia-power-a-leading-integrated-power-and-ai-infrastructure-platform-2026-07-09"]}],"repoOnlyRows":[],"repoRows":[{"productionCompanyId":"cmrxpjakf00ppivhe197wcvey","seedKey":"copia power|United States","sourcePresence":"BOTH","disposition":"MATCHED_CENSUS"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjakf00ppivhe197wcvey","name":"Copia Power","country":"United States","status":"Active","sector":"Power & ET","subsector":"Utility-scale solar, storage, and power development","yearFounded":2021,"headquarters":"Western United States","description":"Copia Power develops utility-scale solar, battery storage, and related power infrastructure projects in the western United States. Its customers include utilities, corporate buyers, and large-load power users that need contracted or dedicated generation and storage capacity. The business follows an asset-heavy development model because it originates, finances, procures, and advances physical infrastructure assets rather than acting only as an advisory platform. Company materials state that the platform was founded by Carlyle in 2021 and, by late 2025, had more than 1,500 MW and 4,469 MWh operating or under construction, with a much larger multi-sector development pipeline. Carlyle remains the disclosed sponsor, and Copia also announced a $300 million corporate credit facility in 2024 to accelerate development and procurement.","owners":[{"id":"cmrxpjvxx01neivheya8o7kr4","firm":"Carlyle Group","vehicle":"n.a.","fundName":"Carlyle Global Infrastructure Opportunity Fund","investmentYear":2021,"isActive":true}],"milestones":[{"date":"Apr 2, 2024","event":"Copia announced a $300 million corporate credit facility.","category":"Financing"},{"date":"2024","event":"Copia said its western solar and storage development portfolio exceeded 17 GW.","category":"Expansion"},{"date":"Mar 2021","event":"Copia Power states that Carlyle invested in Birch Infrastructure and simultaneously launched Copia Power.","category":"Financing"}],"sources":[{"label":"Copiapower — Copia Power","url":"https://www.copiapower.com/","purpose":"COMPANY_PROFILE"},{"label":"Copiapower — Copia Power","url":"https://www.copiapower.com/overview","purpose":"SUPPORTING_CONTEXT"},{"label":"Investment date source — Carlyle Infrastructure — Copia Power","url":"https://www.copiapower.com/history","purpose":"OWNERSHIP_INVESTMENT"},{"label":"Copiapower — Copia Power","url":"https://www.copiapower.com/news/copia-power-closes-300-million-corporate-credit-facility-to-accelerate-development-and-procurement-efforts-on-its-western-solar-and-storage-portfolio","purpose":"OPERATIONS_ASSETS"}]}

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
- https://eqtgroup.com/news/eqt-to-acquire-copia-power-a-leading-integrated-power-and-ai-infrastructure-platform-2026-07-09
- https://www.copiapower.com/
- https://www.copiapower.com/overview
- https://www.copiapower.com/history
- https://www.copiapower.com/news/copia-power-closes-300-million-corporate-credit-facility-to-accelerate-development-and-procurement-efforts-on-its-western-solar-and-storage-portfolio

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.

