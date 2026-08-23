Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: BYD EV Fleet Asset SPVs
MANAGERS TO RESOLVE: Generate Capital; BYD; identify any formed joint venture, leasing platform and direct asset owners
TASK: ledger:0253:byd-ev-fleet-asset-spvs:e914a6d4
CANONICAL KEY: byd-ev-fleet-asset-spvs|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"The repository treats the 2018 Generate/BYD electric-bus leasing program and unspecified asset SPVs as an active PortCo. The accepted manager review proposed retirement because these are legacy asset-level leasing vehicles without current platform-level ownership evidence. Verify whether a durable manager-level company was formed and whether Generate still owns qualifying equity or fleet assets.","productionCompanyId":"cmrxpjfxa00xwivheazgpv3e4","seedKey":"byd ev fleet asset spvs|United States","startingEvidence":["https://generatecapital.com/technology-companies/","https://www.metro-magazine.com/news/byd-partners-to-launch-first-ever-electric-bus-leasing-program"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"BYD EV Fleet Asset SPVs","country":"United States","status":"Active","sector":"Transportation","subsector":"Electric bus and fleet leasing","investmentYear":2018,"headquarters":"Multiple U.S. states","owners":[{"firm":"Generate Capital","vehicle":"Asset Owner","investmentYear":2018,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"description":"The repository describes financing and ownership vehicles supporting U.S. electric-bus deployments, with Generate funding/owning vehicle assets and BYD supplying equipment. It records a 2018 launch and initial US$200 million allocation but no legal SPV names, current fleet scale or continuing ownership evidence.","milestones":[{"date":"2018","event":"Generate and BYD structured the electric-bus leasing program.","category":"Financing"},{"date":"Jul 10, 2018","event":"The parties announced a joint venture and US$200 million initial allocation.","category":"Financing"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Determine whether the announced arrangement created a legally named joint venture, operating leasing platform or only deal-by-deal financing/asset SPVs. Identify any exact legal entities, ownership percentages, manager/fund/vehicle attribution, funded commitments, buses/fleets/customers and whether Generate held sponsor equity, title to leased vehicles, debt exposure or a managed-account interest. Search subsequent Generate and BYD materials, filings and customer deployments for evidence the program closed, expanded, was renamed, transferred, wound down, sold or remains active. Identify any successor such as Generate's broader sustainable-mobility platform and avoid double-counting underlying leases or customer fleets. Search through the as-of date for portfolio sale, lease termination, asset disposition, recapitalization, Generate exit or signed pending transaction. Decide whether to retain one manager-level platform, merge into a broader company, retire Generate's ownership or exclude the record because only unnamed asset SPVs/financing exposures exist.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, platform/SPV/fleet boundary, direct owners and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing/funding date, entry date, exit date and transaction state. Distinguish equity ownership, vehicle title, secured lending, leasing and equipment-supply roles.
- Search through 2026-08-19 for formation, funding, deployment, sale, transfer, refinancing, wind-down, asset disposition and signed pending transactions.
- Verify disclosed capital commitment, deployed fleet/customer scale, geography and operating continuity.
- Reopen direct pages and filings. Prefer Generate, BYD, formed entity, customer/transit agency, regulatory/UCC/filing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://generatecapital.com/technology-companies/
- https://www.metro-magazine.com/news/byd-partners-to-launch-first-ever-electric-bus-leasing-program
- https://en.byd.com/page/59/?s=BYD

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
