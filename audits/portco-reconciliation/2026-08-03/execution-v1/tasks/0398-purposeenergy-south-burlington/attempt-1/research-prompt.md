Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: PurposeEnergy South Burlington
REQUESTED MANAGER: Quinbrook Infrastructure Partners; identify every current/former direct owner
TASK: ledger:0398:purposeenergy-south-burlington:5ec5aa6b
CANONICAL KEY: purposeenergy-south-burlington|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"PurposeEnergy South Burlington exists as a separate published PortCo, but the manager census classified it as an underlying PurposeEnergy renewable-energy facility rather than a manager-level Quinbrook holding. Verify the ownership and platform boundary, and determine whether the record should be removed/merged into PurposeEnergy or retained because a distinct sponsor-level investment structure exists.","productionCompanyIds":["cmrxpjmpo018iivhexgpftme7"],"seedKeys":["purposeenergy south burlington|United States"],"sourceHoldingId":"083-quinbrook-infrastructure-partners:repo-only:008:purposeenergy-south-burlington","startingEvidence":["https://purposeenergy.com/project/zero-gravity-brewery/","https://www.quinbrook.com/portfolio/purposeenergy/"]}

Resolve the legal/commercial relationship among the South Burlington/Zero Gravity Brewery facility, PurposeEnergy, Quinbrook, project SPVs, host/customer counterparties, lenders and any co-owners. Determine whether Quinbrook made a separately governed investment in the facility or whether exposure is solely through PurposeEnergy. Subsidiaries and facilities beneath an already-counted platform should not remain separate PortCos absent a distinct sponsor-level vehicle or mandate. Do not treat debt, tax credits, feedstock/offtake agreements, permits or contractor relationships as equity.

Verify development/acquisition dates, commercial-operation status, direct owner/operator, Vermont location, digestion/energy capacity, Zero Gravity/other host relationship and any sale or transfer through 2026-08-19. Search for later equity sales, project-level sponsor changes, recapitalizations and signed pending transactions. If the facility remains within PurposeEnergy, recommend the exact merge/removal boundary while preserving facility facts as platform milestones/assets.

RESEARCH RULES
- Resolve canonical identity, aliases, facility/SPV/platform boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Reopen PurposeEnergy, Quinbrook, project counterparties, permits, lenders and official announcements; search through 2026-08-19 for exits and pending transactions.
- Return PROPOSED_MERGE or EXCLUDED if South Burlington is subordinate to PurposeEnergy; VERIFIED_NO_CHANGE only if a distinct manager-level PortCo is proven; PROPOSED_CORRECTION if it remains separate but facts need updating; DEFERRED if the boundary remains unresolved. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material uncertainty. This is a research packet only.

STARTING SOURCES TO REOPEN
- https://purposeenergy.com/project/zero-gravity-brewery/
- https://www.quinbrook.com/portfolio/purposeenergy/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
