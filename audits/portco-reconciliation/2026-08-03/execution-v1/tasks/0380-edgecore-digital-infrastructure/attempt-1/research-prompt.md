Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: EdgeCore Digital Infrastructure
REQUESTED MANAGER: Partners Group; identify every current/former direct owner
TASK: ledger:0380:edgecore-digital-infrastructure:92394a7f
CANONICAL KEY: edgecore-digital-infrastructure|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"The census treated EdgeCore Digital Infrastructure as a current Partners Group infrastructure acquisition entered in 2022, but no canonical production or seed record exists. Verify the exact identity, legal close, owner set, acquisition vehicle and continued current status before creation.","productionCompanyIds":[],"seedKeys":[],"sourceHoldingId":"078-partners-group:holding:001:edgecore-digital-infrastructure","startingEvidence":["https://www.partnersgroup.com/en/news/edgecore-acquisition/","https://edgecore.com/"]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the canonical legal/commercial identity and aliases of EdgeCore Digital Infrastructure, EdgeCore Digital Infrastructure Holdings LLC and any predecessor, parent or acquisition holding company. Count the one manager-level hyperscale data-center platform; do not split campuses, individual facilities, development phases, land parcels, powered-shell assets, financing SPVs or customer contracts.

Verify Partners Group's acquisition announcement and exact legal closing date, infrastructure fund/vehicle/account, seller(s), co-investors, exact stake or control characterization, enterprise-value or capital-commitment disclosures and any retained management/founder interest. Identify all current and former direct owners. Distinguish manager-level equity from construction loans, project finance, joint ventures, land sellers, power arrangements and hyperscale customer commitments.

Search through 2026-08-19 for later equity sales, recapitalizations, continuation vehicles, new investors, joint ownership, mergers, exits and signed pending ownership transactions. Determine whether Partners Group remains the current owner and whether later transactions changed the manager-level cap table. Do not infer a fund or percentage without direct evidence.

BOUNDARY AND OPERATING PROFILE
Confirm official website, headquarters, founding year, products/services, customers/end markets, operating/development markets, campuses, powered capacity or other disclosed scale and two to four material milestones. Reconcile announcements versus completed campus operations by preserving metric date and definition.

RESEARCH RULES
- Resolve canonical identity, aliases, platform/campus/facility boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer EdgeCore, Partners Group, sellers/transaction counterparties, regulatory filings and official financing disclosures. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW only if a qualifying distinct canonical company should be created; EXCLUDED if Partners Group's exposure is debt-only, LP/fund-of-funds or otherwise outside the direct-infrastructure boundary; PROPOSED_MERGE if an existing identity is found; DEFERRED if identity/current ownership remains unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.partnersgroup.com/en/news/edgecore-acquisition/
- https://edgecore.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
