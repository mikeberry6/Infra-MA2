Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: 400 Paul Avenue Data Center
MANAGERS TO RESOLVE: CIM Group
TASK: ledger:0175:400-paul-avenue-data-center:e79f51df
CANONICAL KEY: 400-paul-avenue-data-center|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Accepted CIM Group repo-only judgment requires one consolidated proposal: 400 Paul Avenue was MATCHED_ELSEWHERE beneath the manager-level Novva Data Centers platform. Identify the canonical keep record and consolidation boundary; do not infer a merge before verifying the transaction close and post-close operating identity.","censusRows":[],"repoOnlyRows":[{"manager":"CIM Group","disposition":"MATCHED_ELSEWHERE","rationale":"Consolidated beneath the manager-level Novva Data Centers platform.","evidenceUrls":["https://www.datacenterdynamics.com/en/news/novva-takes-over-400-paul-avenue/"]}],"repoRows":[{"productionCompanyId":"cmrxpjbrb00rjivhekt5680ah","seedKey":"400 paul avenue data center|United States","sourcePresence":"BOTH"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjbrb00rjivhekt5680ah","name":"400 Paul Avenue Data Center","country":"United States","status":"Active","sector":"Digital","subsector":"Hyperscale and wholesale data centers","investmentYear":2017,"headquarters":"California","description":"The repository treats 400 Paul Avenue as a San Francisco data-center campus developed on a 7.3-acre site by CIM Group and fifteenfortyseven Critical Systems Realty. It records an approximately 240,000-square-foot campus and later marketing of about 24 MW, with no disclosed JV percentages.","owners":[{"firm":"CIM Group","vehicle":"CIM Group / 1547 CSR JV","investmentYear":2017,"stake":"Not publicly disclosed","isActive":true}],"milestones":[{"date":"2017","event":"CIM Group invested through the CIM Group / 1547 CSR joint venture.","category":"Financing"},{"date":"Apr 16, 2018","event":"CIM Group and 1547 marked the start of construction.","category":"Expansion"},{"date":"2022","event":"Marketing referenced approximately 24 MW of powered-shell capacity.","category":"Expansion"}],"sources":[{"url":"https://www.datacenterdynamics.com/en/news/1547-and-cim-are-planning-a-data-center-in-san-francisco/"},{"url":"https://www.cimgroup.com/press-releases/cim-group-and-fifteenfortyseven-critical-systems-realty-begin-construction-of-bay-area-data-center-campus"},{"url":"https://www.datacenterdynamics.com/en/news/cim-group-offering-24mw-data-center-for-lease-in-san-francisco/"},{"url":"https://baxtel.com/data-center/400-paul-ave-1547"}]}

RELATED CANONICAL COMPANY TO TEST
Novva Data Centers exists separately in production under CIM Group. The repository treats Novva as a manager-level U.S. data-center platform founded in 2020, backed by CIM and Novva's founders, with later CIM growth equity and financing. Determine whether Novva legally acquired 400 Paul Avenue, the acquisition/closing date, whether CIM or 1547 retained any direct interest, whether the campus is now operated and marketed solely as a Novva facility, and whether one Novva canonical row plus a 400 Paul alias/history/redirect is the correct boundary.

RESEARCH RULES
- Resolve canonical legal/display identity, site names, owners, predecessor/successor names, and platform-versus-campus/project boundaries.
- Determine whether 400 Paul Avenue remains a standalone manager-level PortCo or is now an underlying Novva campus. A report that Novva "takes over" is insufficient without checking legal close and current operator evidence.
- Verify every current and former direct owner, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer a fund, stake or closing.
- Preserve CIM/1547 development and ownership history if recommending consolidation; do not erase the site lineage.
- Search through 2026-08-19 for acquisition closing, sale, exit, transfer, recapitalization, rebrand, lease, construction completion, operating commencement and pending transactions.
- Verify geography, capacity, footprint, project status, products/services, customers/end markets and current operating status.
- Reopen direct pages. Prefer Novva, CIM, 1547, regulator/filing, transaction-party and reliable industry sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.datacenterdynamics.com/en/news/novva-takes-over-400-paul-avenue/
- https://www.datacenterdynamics.com/en/news/1547-and-cim-are-planning-a-data-center-in-san-francisco/
- https://www.cimgroup.com/press-releases/cim-group-and-fifteenfortyseven-critical-systems-realty-begin-construction-of-bay-area-data-center-campus
- https://www.datacenterdynamics.com/en/news/cim-group-offering-24mw-data-center-for-lease-in-san-francisco/
- https://baxtel.com/data-center/400-paul-ave-1547

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
