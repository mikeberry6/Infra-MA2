Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Milestone Equipment Holdings
REQUESTED MANAGER: Partners Group; identify every current/former direct owner
TASK: ledger:0382:milestone-equipment-holdings:c1b0b537
CANONICAL KEY: milestone-equipment-holdings|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"The census treated Milestone Equipment Holdings as a current Partners Group infrastructure investment entered in 2021, but no canonical production or seed record exists and confidence was medium. Verify the exact identity, transaction close, owner set, leasing-platform boundary and continued current status before creation.","productionCompanyIds":[],"seedKeys":[],"sourceHoldingId":"078-partners-group:holding:006:milestone-equipment-holdings","startingEvidence":["https://www.partnersgroup.com/en/news/milestone/","https://www.milestonetrailers.com/"]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the canonical legal/commercial identity and relationship among Milestone Equipment Holdings, Milestone Equipment Holdings LLC, Milestone Trailer Leasing, Milestone Chassis and any predecessor, parent or acquisition vehicle. Count the one manager-level transport-equipment leasing platform; do not split trailer, chassis, container, branch, fleet or financing subsidiaries, individual equipment pools or securitization issuers.

Verify Partners Group's investment announcement and exact legal closing date, infrastructure strategy/vehicle, seller(s), co-investors, stake/control characterization and any retained management interest. Identify all current and former direct owners. Determine whether Partners Group acquired the company outright, invested through a joint venture, or provided another form of capital.

Search through 2026-08-19 for later equity sales, recapitalizations, continuation vehicles, new investors, mergers, divestitures and signed pending ownership transactions. Determine whether Partners Group remains a current owner. Distinguish manager-level equity from warehouse facilities, asset-backed securitizations, equipment finance, customer leases, fleet purchases and lender relationships. Do not infer a fund or percentage without direct evidence.

BOUNDARY AND OPERATING PROFILE
Confirm official website, headquarters, founding year, products/services, customer/end markets, branch and fleet footprint, equipment categories and two to four material milestones. Establish why the platform qualifies as manager-level transportation infrastructure rather than a pure financial-lessor or equipment retailer, and state any classification uncertainty plainly.

RESEARCH RULES
- Resolve canonical identity, aliases, platform/fleet/subsidiary/financing boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Milestone, Partners Group, transaction counterparties, regulatory filings, securitization disclosures and official portfolio sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW only if a qualifying distinct canonical company should be created; EXCLUDED if Partners Group's exposure is debt-only, LP/fund-of-funds or the company is outside the infrastructure boundary; PROPOSED_MERGE if an existing identity is found; DEFERRED if identity, classification or current ownership remains unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.partnersgroup.com/en/news/milestone/
- https://www.milestonetrailers.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
