Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: WANRack
MANAGERS TO RESOLVE: CBRE Investment Management
TASK: ledger:0169:wanrack:62ec8ee0
CANONICAL KEY: wanrack|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: CBRE Investment Management MATCHED_ELSEWHERE: Consolidated beneath Gateway Fiber after merger and brand unification into a single operating platform","censusRows":[],"repoOnlyRows":[{"manager":"CBRE Investment Management","sourceDisposition":"MATCHED_ELSEWHERE","disposition":"CONSOLIDATION_REVIEW","rationale":"Consolidated beneath Gateway Fiber after merger and brand unification into a single operating platform","evidenceUrls":["https://www.cbreim.com/press-releases/cbre-investment-management-funds-to-merge-fiber-portfolio-companies","https://www.gatewayfiber.com/news/gateway-fiber-unifies-under-single-brand-following-strategic-merger"]}],"repoRows":[{"productionCompanyId":"cmrxpjase00q0ivhe08oo2btg","seedKey":"wanrack|United States","sourcePresence":"BOTH","disposition":"RETAIN_UNLINKED"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjase00q0ivhe08oo2btg","name":"WANRack","country":"United States","status":"Active","sector":"Digital","subsector":"Fiber broadband and institutional connectivity","investmentYear":2021,"headquarters":"Multiple US states","description":"WANRack builds and operates fiber networks for schools, municipalities, enterprises, and institutional users. The repository says CBRE Caledon acquired WANRack in 2021, WANRack acquired KwiKom in 2023, and CBRE IM announced a strategic merger of WANRack and Gateway Fiber in 2025.","owners":[{"firm":"CBRE Investment Management","vehicle":"CBRE Private Infrastructure","investmentYear":2021,"isActive":true}],"milestones":[{"date":"Jul 2, 2021","event":"CBRE Caledon completed the acquisition of WANRack after regulatory approvals.","category":"Acquisition"},{"date":"2023","event":"WANRack expanded through the KwiKom acquisition.","category":"Expansion"},{"date":"2025","event":"CBRE IM announced the strategic merger of WANRack and Gateway Fiber.","category":"Other"}],"sources":[{"url":"https://www.wanrack.com/about"},{"url":"https://www.wanrack.com/news/blog-post-one-nt6jb-ns5wd-42tsj"},{"url":"https://www.wanrack.com/news/3aij243b5fsb9toxikgct72kxdsaxs-zf4b2-paw8m-rkz5h-kr2xc"},{"url":"https://www.cbreim.com/press-releases/cbre-investment-management-funds-to-merge-fiber-portfolio-companies"}]}

RELATED CANONICAL COMPANY TO TEST
Gateway Fiber exists separately in production under CBRE Investment Management. Determine whether the 2025 transaction legally closed, whether WANRack ceased to be a standalone platform or brand, which identity survived, whether former WANRack operations are now represented by Gateway Fiber, and whether one canonical row plus alias/redirect is the correct boundary.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, predecessor/successor names, and platform-versus-subsidiary/project boundaries.
- Determine whether WANRack remains a distinct manager-level operating platform or should be merged into Gateway Fiber. An announced merger alone is insufficient; verify legal closing and subsequent brand/operating evidence.
- Verify every current and former direct owner, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer a fund, stake or closing.
- Preserve historical ownership and operating lineage if recommending a canonical merge; do not erase WANRack's 2021 entry or KwiKom history.
- Search through 2026-08-19 for closing, sale, exit, divestiture, transfer, recapitalization, merger, rebrand, bankruptcy and signed pending transactions.
- Verify North American geography, official website, headquarters, founding year, products/services, customers/end markets, operating footprint, scale and current operating status.
- Reopen direct pages. Prefer company, manager, regulator/government, filings and transaction-party releases. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.cbreim.com/press-releases/cbre-investment-management-funds-to-merge-fiber-portfolio-companies
- https://www.gatewayfiber.com/news/gateway-fiber-unifies-under-single-brand-following-strategic-merger
- https://www.wanrack.com/about
- https://www.wanrack.com/news/blog-post-one-nt6jb-ns5wd-42tsj
- https://www.wanrack.com/news/3aij243b5fsb9toxikgct72kxdsaxs-zf4b2-paw8m-rkz5h-kr2xc

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
