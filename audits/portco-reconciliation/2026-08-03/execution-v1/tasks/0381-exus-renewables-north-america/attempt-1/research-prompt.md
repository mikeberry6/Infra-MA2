Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Exus Renewables North America
REQUESTED MANAGER: Partners Group; identify every current/former direct owner
TASK: ledger:0381:exus-renewables-north-america:beef769f
CANONICAL KEY: exus-renewables-north-america|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"The census treated Exus Renewables North America as a current Partners Group infrastructure platform investment entered in 2023, but no canonical production or seed record exists and confidence was only medium. Verify the exact entity acquired, manager-versus-operating-platform boundary, direct equity and current status before creation.","productionCompanyIds":[],"seedKeys":[],"sourceHoldingId":"078-partners-group:holding:005:exus-renewables-north-america","startingEvidence":["https://www.partnersgroup.com/en/news/exus-renewables/","https://exusmanagement.com/"]}

IDENTITY, OWNERSHIP AND CLASSIFICATION QUESTIONS
Resolve the canonical legal/commercial identity and relationship among Exus Renewables North America, Exus Management Partners, Exus Renewables, Exus Management Partners North America and any acquired portfolio or holding company. Determine whether Partners Group acquired a North American renewable-energy operating/development platform, an asset portfolio managed by Exus, a stake in the Exus investment manager/adviser itself, or some combination. Do not equate an asset-management mandate with ownership.

Verify Partners Group's investment announcement and exact legal closing date, infrastructure strategy/vehicle, seller(s), co-investors, stake/control characterization, capital commitment and any retained Exus management interest. Identify all current and former direct owners. Search through 2026-08-19 for later equity sales, recapitalizations, new investors, asset transfers, rebrandings, exits and signed pending ownership transactions. Determine whether Partners Group still owns the same manager-level platform.

Apply the census boundary from first principles. Count one qualifying manager-level operating/development platform if it owns or controls the North American renewable business and assets. Do not separately count individual wind/solar/storage projects, project companies, development pipelines, asset-management funds or financing SPVs. Exclude the candidate if Partners Group's exposure is only to projects through managed funds, debt or LP/fund-of-funds interests, or if the named entity is merely an adviser with no qualifying direct infrastructure ownership.

BOUNDARY AND OPERATING PROFILE
Confirm official website, headquarters, formation/founding year, products/services, customers/counterparties, geographic footprint, operating/development MW scale, technologies and two to four material milestones. Distinguish Exus's global advisory/asset-management operations from the specific North American business Partners Group acquired.

RESEARCH RULES
- Resolve canonical identity, aliases, manager/adviser/operating-platform/project boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Partners Group, Exus, transaction counterparties, regulatory filings and official portfolio disclosures. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW only if a qualifying distinct canonical company should be created; EXCLUDED if the exposure is debt-only, LP/fund-of-funds or a non-owning adviser/manager; PROPOSED_MERGE if an existing identity is found; DEFERRED if identity, classification or current ownership remains unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.partnersgroup.com/en/news/exus-renewables/
- https://exusmanagement.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
