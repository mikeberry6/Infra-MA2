Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Ash Creek Solar
REQUESTED MANAGER: Quinbrook Infrastructure Partners; identify every current/former direct owner
TASK: ledger:0391:ash-creek-solar:5c31cc8f
CANONICAL KEY: ash-creek-solar|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Ash Creek Solar exists as a separate published PortCo, but the manager census classified it as an underlying Primergy Solar project rather than a manager-level Quinbrook holding. Verify the exact ownership and platform boundary, and determine whether the separate record should be removed/merged into Primergy or retained because a distinct sponsor-level investment structure exists.","productionCompanyIds":["cmrxpjmjj0186ivhewu4o37et"],"seedKeys":["ash creek solar|United States"],"sourceHoldingId":"083-quinbrook-infrastructure-partners:repo-only:001:ash-creek-solar","startingEvidence":["https://www.primergypower.com/projects/ash-creek-solar-project","https://www.quinbrook.com/portfolio/primergy-solar/"]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the legal/commercial relationship among Ash Creek Solar, the project company/SPVs, Primergy Solar, Quinbrook Infrastructure Partners, project lenders, tax-equity investors, offtakers and any co-owners. Determine whether Quinbrook made a separately governed fund/co-investment acquisition in Ash Creek, or whether its exposure is solely through ownership of the Primergy manager-level platform.

Apply the census boundary strictly. Subsidiaries and projects beneath an already-counted manager-level platform should not remain separate PortCos unless direct evidence shows a distinct sponsor-level ownership vehicle or investment mandate comparable to the separately held Gemini continuation-fund asset. Do not treat construction debt, tax equity, PPAs, development rights or contractor relationships as company equity.

Verify project development/acquisition dates, commercial-operation status, direct owner/operator, capacity, location, offtaker and any sale or transfer through 2026-08-19. Search for later equity sales, project-level sponsor changes, recapitalizations and signed pending transactions. If Ash Creek remains wholly within Primergy, recommend the exact merge/removal boundary while preserving project facts as Primergy milestones or assets.

BOUNDARY AND OPERATING PROFILE
Confirm official project page, location, solar/BESS capacity, construction and commercial-operation dates, customer/offtake arrangement and current status. Distinguish Ash Creek from similarly named projects and from Primergy's other assets.

RESEARCH RULES
- Resolve canonical identity, aliases, project/SPV/platform boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Primergy, Quinbrook, project counterparties, grid/regulatory filings, lenders and official project announcements. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_MERGE or EXCLUDED if Ash Creek is a subordinate Primergy project; VERIFIED_NO_CHANGE only if a distinct manager-level PortCo is proven and the existing record is accurate; PROPOSED_CORRECTION if it remains separate but facts need updating; DEFERRED if the sponsor-level boundary remains unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.primergypower.com/projects/ash-creek-solar-project
- https://www.quinbrook.com/portfolio/primergy-solar/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
