Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: St. Albans Industrial Treatment (SAINT)
REQUESTED MANAGER: Quinbrook Infrastructure Partners; identify every current/former direct owner
TASK: ledger:0402:st-albans-industrial-treatment-saint:0567aff2
CANONICAL KEY: st-albans-industrial-treatment-saint|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"St. Albans Industrial Treatment (SAINT) exists as a separate published PortCo, but the manager census classified it as an underlying PurposeEnergy renewable-energy facility rather than a manager-level Quinbrook holding. Verify the ownership/platform boundary and whether the record should be removed/merged into PurposeEnergy or retained because a distinct sponsor-level investment exists.","productionCompanyIds":["cmrxpjms4018nivhe4b9fmlk9"],"seedKeys":["st. albans industrial treatment (saint)|United States"],"sourceRepoOnlyId":"083-quinbrook-infrastructure-partners:repo-only:010:st-albans-industrial-treatment-saint","startingEvidence":["https://purposeenergy.com/news-insights/purposeenergy-to-build-new-18m-biogas-plant-in-vermont-for-ben-jerrys-2/","https://www.quinbrook.com/portfolio/purposeenergy/"]}

Resolve the legal/commercial relationship among SAINT, PurposeEnergy, Quinbrook, any project SPV, Ben & Jerry's/Unilever, lenders and co-owners. Determine whether Quinbrook made a separately governed investment in SAINT or whether exposure is solely through PurposeEnergy. Subsidiaries and facilities beneath an already-counted platform should not remain separate PortCos absent a distinct sponsor-level vehicle or mandate. Do not treat construction debt, grants, tax credits, feedstock/offtake or host agreements, permits, or contractor relationships as equity.

Verify development/acquisition dates, construction and commercial-operation status, direct owner/operator, Vermont location, treatment/biogas capacity, host/customer relationship and any sale or transfer through 2026-08-19. Search for later equity sales, project-level sponsor changes, recapitalizations, exits and signed pending transactions. If SAINT remains within PurposeEnergy, recommend the exact merge/removal boundary while preserving facility facts as platform milestones/assets.

RESEARCH RULES
- Resolve canonical identity, aliases, facility/SPV/platform boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Reopen PurposeEnergy, Quinbrook, project counterparties, permits, lenders and official announcements; search through 2026-08-19 for exits and pending transactions.
- Return PROPOSED_MERGE or EXCLUDED if SAINT is subordinate to PurposeEnergy; VERIFIED_NO_CHANGE only if a distinct manager-level PortCo is proven; PROPOSED_CORRECTION if it remains separate but facts need updating; DEFERRED if the boundary remains unresolved. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material uncertainty. This is a research packet only.

STARTING SOURCES TO REOPEN
- https://purposeenergy.com/news-insights/purposeenergy-to-build-new-18m-biogas-plant-in-vermont-for-ben-jerrys-2/
- https://www.quinbrook.com/portfolio/purposeenergy/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
