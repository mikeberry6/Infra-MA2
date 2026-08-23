Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Arcadian Infracom
REQUESTED MANAGER: Nuveen Infrastructure; identify TIAA, Tillman Global Holdings and every current/former direct owner
TASK: ledger:0365:arcadian-infracom:27de01bd
CANONICAL KEY: arcadian-infracom|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"No exact normalized production or seed match exists. The census classified Arcadian Infracom as a current Nuveen Infrastructure digital-infrastructure holding.","productionCompanyIds":[],"seedKeys":[],"sourceHoldingId":"073-nuveen-infrastructure:holding:001:arcadian-infracom","startingEvidence":["https://www.arcadianinfra.com/","https://www.nuveen.com/en-us/insights/infrastructure/arcadian-infracom"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
No exact Arcadian Infracom company or seed record is mapped to this holding. The census relies on Arcadian's site and a Nuveen investment page. Determine from scratch whether a list-ready canonical company is missing, the correct Nuveen/TIAA ownership structure, the role of Tillman Global Holdings, and whether current ownership or the platform boundary changed through the as-of date.

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the canonical legal and commercial identity, aliases, founding/platform-formation history, parent/holding companies and relationship to Tillman Global Holdings or other Tillman entities. Establish Nuveen/TIAA's investment announcement and legal closing dates, direct investment mandate/fund/managed account, acquisition vehicle, exact stake/control terms, seller or primary-capital structure, co-investors and retained founder/management/Tillman interests. Do not collapse Nuveen, TIAA and an underlying account into separate owners unless the legal/economic evidence supports distinct ownership periods.

Search through 2026-08-19 for recapitalizations, new equity investors, mergers, sales, partial transfers, restructurings and signed pending transactions. Confirm current ownership from the latest direct company/manager, regulatory or financing evidence; a stale investment page alone is insufficient. Distinguish investment in Arcadian's platform from financing or partnership on individual fiber routes. Do not treat lenders, construction contractors, carriers, utilities, municipalities, customers, dark-fiber purchasers or IRU counterparties as equity owners.

BOUNDARY AND OPERATING PROFILE
Confirm official website, headquarters, founding year, long-haul and middle-mile network footprint, route miles, planned/completed routes, landing/connection points, customers/end markets, services and disclosed development/construction status with dates. Establish why Arcadian qualifies as North American digital infrastructure. Count the manager-level platform once and treat individual routes, conduit, fiber pairs, regeneration sites, project SPVs and joint-build arrangements as underlying operations unless evidence proves a separate manager-level portfolio investment.

RESEARCH RULES
- Resolve canonical identity, aliases, predecessor/successor names, platform/subsidiary/project boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Arcadian, Nuveen/TIAA, Tillman, FCC/state regulators, government, financing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW only if a missing list-ready canonical company and current qualifying ownership are proven, PROPOSED_CORRECTION if an existing successor record should be used, PROPOSED_MERGE if duplicate identities are proven, EXCLUDED if direct equity or infrastructure qualification is disproven, or DEFERRED if current identity or ownership remains unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.arcadianinfra.com/
- https://www.nuveen.com/en-us/insights/infrastructure/arcadian-infracom

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
