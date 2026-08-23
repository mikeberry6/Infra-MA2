Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Rowan Temple
REQUESTED MANAGER: Quinbrook Infrastructure Partners; identify every current/former direct owner
TASK: ledger:0401:rowan-temple:fb4df5a1
CANONICAL KEY: rowan-temple|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Rowan Temple exists as a separate published PortCo, but the manager census classified it as a Texas data-center campus developed under Rowan Digital Infrastructure rather than a manager-level Quinbrook holding. Verify the ownership/platform boundary and whether the record should be removed/merged into Rowan Digital Infrastructure or retained because a distinct sponsor-level investment exists.","productionCompanyIds":["cmrxpjmrm018mivhenapgu698"],"seedKeys":["rowan temple|United States"],"sourceRepoOnlyId":"083-quinbrook-infrastructure-partners:repo-only:013:rowan-temple","startingEvidence":["https://rowan.digital/portfolio/temple/","https://www.quinbrook.com/portfolio/rowan-digital-infrastructure/"]}

Resolve the relationship among Rowan Temple, campus/project SPVs, Rowan Digital Infrastructure, Quinbrook, land/power counterparties, lenders, customers and any co-owners. Determine whether Quinbrook made a separately governed investment in Temple or whether exposure is solely through Rowan Digital Infrastructure. Projects beneath an already-counted platform should not remain separate PortCos absent a distinct sponsor-level vehicle or mandate. Do not treat construction debt, land options, power agreements, customer leases or contractor relationships as equity.

Verify development/acquisition dates, current construction/operating status, direct owner/operator, location, planned/operating capacity, customers if disclosed and any sale or transfer through 2026-08-19. Search for project-level sponsor changes, recapitalizations, exits and signed pending transactions. If subordinate, recommend the exact merge/removal boundary while preserving campus facts as platform milestones/assets.

RESEARCH RULES
- Resolve canonical identity, aliases, campus/SPV/platform boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Reopen Rowan, Quinbrook, local permits/utilities, financing and official project announcements; verify every date/stake and search through 2026-08-19 for ownership changes.
- Return PROPOSED_MERGE or EXCLUDED if Temple is subordinate to Rowan Digital Infrastructure; VERIFIED_NO_CHANGE only if a distinct manager-level PortCo is proven; PROPOSED_CORRECTION if separate but inaccurate; DEFERRED if the boundary remains unresolved. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material uncertainty. This is a research packet only.

STARTING SOURCES TO REOPEN
- https://rowan.digital/portfolio/temple/
- https://www.quinbrook.com/portfolio/rowan-digital-infrastructure/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
