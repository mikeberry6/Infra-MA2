Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Prospect Storage
REQUESTED MANAGER: Quinbrook Infrastructure Partners; identify every current/former direct owner
TASK: ledger:0396:prospect-storage:78e66bf0
CANONICAL KEY: prospect-storage|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Prospect Storage exists as a separate published PortCo, but the manager census classified it as an underlying GlidePath Power Solutions battery project rather than a manager-level Quinbrook holding. Verify the exact ownership and platform boundary, and determine whether the separate record should be removed/merged into GlidePath or retained because a distinct sponsor-level investment structure exists.","productionCompanyIds":["cmrxpjmo2018fivhesphmyffh"],"seedKeys":["prospect storage|United States"],"sourceHoldingId":"083-quinbrook-infrastructure-partners:repo-only:006:prospect-storage","startingEvidence":["https://www.quinbrook.com/projects/prospect-storage/","https://www.quinbrook.com/portfolio/glidepath/"]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the legal/commercial relationship among Prospect Storage, the battery project company/SPVs, GlidePath Power Solutions, Quinbrook Infrastructure Partners, project lenders, market counterparties and any co-owners. Determine whether Quinbrook made a separately governed fund/co-investment acquisition in Prospect, or whether its exposure is solely through ownership of the GlidePath manager-level platform.

Apply the census boundary strictly. Subsidiaries and projects beneath an already-counted manager-level platform should not remain separate PortCos unless direct evidence shows a distinct sponsor-level ownership vehicle or investment mandate. Do not treat construction debt, tax equity, tolling/market contracts, interconnection rights or contractor relationships as company equity.

Verify project acquisition/development dates, commercial-operation status, direct owner/operator, capacity, location, market participation and any sale or transfer through 2026-08-19. Search for later equity sales, project-level sponsor changes, recapitalizations and signed pending transactions. If Prospect remains wholly within GlidePath, recommend the exact merge/removal boundary while preserving project facts as GlidePath milestones or assets.

BOUNDARY AND OPERATING PROFILE
Confirm official project page, location, battery power/energy capacity, construction and commercial-operation dates, revenue/market role and current status. Distinguish Prospect from similarly named projects and from GlidePath's other storage assets.

RESEARCH RULES
- Resolve canonical identity, aliases, project/SPV/platform boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer GlidePath, Quinbrook, project counterparties, grid/regulatory filings, lenders and official project announcements. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_MERGE or EXCLUDED if Prospect is a subordinate GlidePath project; VERIFIED_NO_CHANGE only if a distinct manager-level PortCo is proven and the existing record is accurate; PROPOSED_CORRECTION if it remains separate but facts need updating; DEFERRED if the sponsor-level boundary remains unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.quinbrook.com/projects/prospect-storage/
- https://www.quinbrook.com/portfolio/glidepath/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
