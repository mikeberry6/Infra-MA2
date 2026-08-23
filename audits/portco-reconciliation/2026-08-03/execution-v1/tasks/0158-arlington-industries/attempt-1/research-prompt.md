Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Arlington Industries
MANAGERS TO RESOLVE: Blackstone
TASK: ledger:0158:arlington-industries:c7b020cc
CANONICAL KEY: arlington-industries|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_PENDING_TRANSACTION"],"rationale":"The exact normalized company identity is established; ADD_PENDING_TRANSACTION requires individual review.","censusRows":[{"manager":"Blackstone","disposition":"PENDING_TRANSACTION","rationale":"The exact normalized company identity is established; ADD_PENDING_TRANSACTION requires individual review.","evidenceUrls":["https://www.blackstone.com/news/press/blackstone-announces-agreement-to-acquire-arlington-industries/"]}],"repoOnlyRows":[],"repoRows":[{"productionCompanyId":"cmrxpj97700niivhe5vpquzmk","seedKey":"arlington industries|United States","sourcePresence":"BOTH","disposition":"MATCHED_CENSUS"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpj97700niivhe5vpquzmk","name":"Arlington Industries","country":"United States","status":"Active","sector":"Power & ET","subsector":"Electrical fittings and wiring accessories","yearFounded":1949,"headquarters":"Pennsylvania","description":"Arlington Industries manufactures electrical fittings, boxes, cable management products, and related accessories used in residential, commercial, industrial, and data center installations. Its products are sold into electrical distribution channels and support contractors, OEMs, and end users involved in power, communications, and building systems projects. The business operates as a manufacturing platform with a substantial catalog of proprietary components and a long-established domestic production base in Pennsylvania. Public company materials describe a multi-decade operating history and broad product penetration across electrical end markets in North America. Blackstone announced an agreement to acquire Arlington Industries in January 2026, but current and post-closing ownership percentages were not publicly disclosed.","owners":[{"id":"cmrxpjuf701kzivhenfmcwf22","firm":"Blackstone","vehicle":"n.a.","fundName":"Blackstone Energy Transition Partners IV (BETP IV)","investmentYear":2026,"isActive":true}],"milestones":[{"date":"Jan 26, 2026","event":"Blackstone announced an agreement to acquire Arlington Industries.","category":"Acquisition"},{"date":"1956","event":"Current family ownership began when the company was acquired by the Shapiro family.","category":"Acquisition"},{"date":"1949","event":"Arlington Industries was founded.","category":"Founding"}],"sources":[{"label":"Aifittings — Arlington Industries","url":"https://www.aifittings.com/","purpose":"COMPANY_PROFILE"},{"label":"Aifittings — Arlington Industries","url":"https://www.aifittings.com/about/history","purpose":"COMPANY_PROFILE"},{"label":"Blackstone","url":"https://www.blackstone.com/news/press/blackstone-announces-agreement-to-acquire-arlington-industries/","purpose":"OWNERSHIP_INVESTMENT"}]}

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
- https://www.blackstone.com/news/press/blackstone-announces-agreement-to-acquire-arlington-industries/
- https://www.aifittings.com/
- https://www.aifittings.com/about/history

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.

