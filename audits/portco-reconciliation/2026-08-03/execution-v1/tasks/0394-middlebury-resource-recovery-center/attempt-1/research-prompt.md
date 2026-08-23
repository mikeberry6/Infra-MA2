Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Middlebury Resource Recovery Center
REQUESTED MANAGER: Quinbrook Infrastructure Partners; identify every current/former direct owner
TASK: ledger:0394:middlebury-resource-recovery-center:08b27d77
CANONICAL KEY: middlebury-resource-recovery-center|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Middlebury Resource Recovery Center exists as a separate published PortCo, but the manager census classified it as an underlying PurposeEnergy anaerobic-digestion facility rather than a manager-level Quinbrook holding. Verify the exact ownership and platform boundary, and determine whether the separate record should be removed/merged into PurposeEnergy or retained because a distinct sponsor-level investment structure exists.","productionCompanyIds":["cmrxpjmmo018civhe8frg363n"],"seedKeys":["middlebury resource recovery center|United States"],"sourceHoldingId":"083-quinbrook-infrastructure-partners:repo-only:009:middlebury-resource-recovery-center","startingEvidence":["https://purposeenergy.com/project/purposeenergy-middlebury/","https://www.quinbrook.com/portfolio/purposeenergy/"]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the legal/commercial relationship among Middlebury Resource Recovery Center, PurposeEnergy, Quinbrook Infrastructure Partners, the project company/SPVs, local counterparties, lenders and any co-owners. Determine whether Quinbrook made a separately governed fund/co-investment acquisition in the facility, or whether its exposure is solely through ownership of the PurposeEnergy manager-level platform.

Apply the census boundary strictly. Subsidiaries and facilities beneath an already-counted manager-level platform should not remain separate PortCos unless direct evidence shows a distinct sponsor-level ownership vehicle or investment mandate. Do not treat project debt, tax credits, feedstock/offtake agreements, municipal permits or contractor relationships as company equity.

Verify facility development/acquisition dates, commercial-operation status, direct owner/operator, location, digestion/energy capacity, host/customer relationship and any sale or transfer through 2026-08-19. Search for later equity sales, project-level sponsor changes, recapitalizations and signed pending transactions. If Middlebury remains wholly within PurposeEnergy, recommend the exact merge/removal boundary while preserving facility facts as PurposeEnergy milestones or assets.

BOUNDARY AND OPERATING PROFILE
Confirm official project page, Vermont location, feedstock and outputs, capacity, construction and commercial-operation dates, customers/offtakers and current status. Distinguish the facility from PurposeEnergy's other projects.

RESEARCH RULES
- Resolve canonical identity, aliases, facility/SPV/platform boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer PurposeEnergy, Quinbrook, project counterparties, Vermont/local permits, lenders and official project announcements. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_MERGE or EXCLUDED if Middlebury is a subordinate PurposeEnergy facility; VERIFIED_NO_CHANGE only if a distinct manager-level PortCo is proven and the existing record is accurate; PROPOSED_CORRECTION if it remains separate but facts need updating; DEFERRED if the sponsor-level boundary remains unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://purposeenergy.com/project/purposeenergy-middlebury/
- https://www.quinbrook.com/portfolio/purposeenergy/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
