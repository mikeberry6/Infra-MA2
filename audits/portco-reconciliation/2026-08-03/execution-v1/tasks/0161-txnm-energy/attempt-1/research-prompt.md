Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: TXNM Energy
MANAGERS TO RESOLVE: Blackstone
TASK: ledger:0161:txnm-energy:91e56a1f
CANONICAL KEY: txnm-energy|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_PENDING_TRANSACTION"],"rationale":"The exact normalized company identity is established; ADD_PENDING_TRANSACTION requires individual review.","censusRows":[{"manager":"Blackstone","disposition":"PENDING_TRANSACTION","rationale":"The exact normalized company identity is established; ADD_PENDING_TRANSACTION requires individual review.","evidenceUrls":["https://www.blackstone.com/news/press/txnm-energy-enters-agreement-to-be-acquired-by-blackstone-infrastructure/"]}],"repoOnlyRows":[],"repoRows":[{"productionCompanyId":"cmrxpj9mq00o7ivheg939dp9z","seedKey":"txnm energy|United States","sourcePresence":"BOTH","disposition":"MATCHED_CENSUS"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpj9mq00o7ivheg939dp9z","name":"TXNM Energy","country":"United States","status":"Active","sector":"Utilities","subsector":"Regulated electric and gas utility","yearFounded":2000,"headquarters":"New Mexico and Texas","description":"TXNM Energy is the parent company of regulated electric and gas utility operations serving customers in New Mexico and Texas. Its customer base consists of residential, commercial, and industrial users served under regulated frameworks through utility subsidiaries. The business is asset-heavy and rate-based, with investment focused on transmission, distribution, generation, and related utility infrastructure. Public filings and company materials identify regulated utility service territories in New Mexico and Texas as the core operating footprint. Blackstone Infrastructure announced an agreement to acquire TXNM Energy in May 2025 and TXNM later reported a $400 million Q2 2025 equity issuance to Blackstone Infrastructure affiliates, while the full take-private transaction remained subject to approvals as of early 2026.","owners":[{"id":"cmrxpjuvp01lqivheohs4h1mf","firm":"Blackstone","vehicle":"n.a.","fundName":"Blackstone Energy Transition Partners IV (BETP IV)","investmentYear":2025,"isActive":true}],"milestones":[{"date":"Feb 20, 2026","event":"Reuters reported that FERC approved the Blackstone transaction, with other approvals still pending.","category":"Expansion"},{"date":"Aug 1, 2025","event":"TXNM reported that its second-quarter equity issuance included $400 million issued to affiliates of Blackstone Infrastructure Partners.","category":"Financing"},{"date":"May 19, 2025","event":"TXNM Energy entered into an agreement to be acquired by Blackstone Infrastructure.","category":"Acquisition"},{"date":"2000","event":"PNM Resources, now TXNM Energy, was formed through the merger of Public Service Company of New Mexico and Texas-New Mexico Power.","category":"Founding"}],"sources":[{"label":"Txnmenergy — TXNM Energy","url":"https://www.txnmenergy.com/investors/acquisition.aspx","purpose":"MILESTONE_EVENT"},{"label":"Announcement date source — Blackstone — TXNM Energy","url":"https://www.blackstone.com/news/press/txnm-energy-enters-agreement-to-be-acquired-by-blackstone-infrastructure/","purpose":"OWNERSHIP_INVESTMENT"},{"label":"Investment date source — Blackstone — TXNM Energy","url":"https://www.prnewswire.com/news-releases/txnm-energy-reports-second-quarter-2025-results-302519323.html","purpose":"OWNERSHIP_INVESTMENT"},{"label":"Reuters — TXNM Energy","url":"https://www.reuters.com/legal/transactional/txnm-energy-gets-ferc-approval-115-billion-blackstone-deal-2026-02-20/","purpose":"SUPPORTING_CONTEXT"}]}

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
- https://www.blackstone.com/news/press/txnm-energy-enters-agreement-to-be-acquired-by-blackstone-infrastructure/
- https://www.txnmenergy.com/investors/acquisition.aspx
- https://www.prnewswire.com/news-releases/txnm-energy-reports-second-quarter-2025-results-302519323.html
- https://www.reuters.com/legal/transactional/txnm-energy-gets-ferc-approval-115-billion-blackstone-deal-2026-02-20/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.

