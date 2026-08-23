Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: I-595 Express Corridor Improvements Project
REQUESTED MANAGER: Nuveen Infrastructure; identify TIAA, ACS/Iridium and every current/former direct owner
TASK: ledger:0367:i-595-express-corridor-improvements-project:6895d500
CANONICAL KEY: i-595-express-corridor-improvements-project|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"No exact normalized production or seed match exists. The census classified the I-595 Express Corridor Improvements Project as a current Nuveen Infrastructure transportation holding.","productionCompanyIds":[],"seedKeys":[],"sourceHoldingId":"073-nuveen-infrastructure:holding:002:i-595-express-corridor-improvements-project","startingEvidence":["https://www.fdot.gov/projects/i595/","https://www.tiaa.org/public/about-tiaa/news-press/press-releases/2013/2013-03-18-infrastructure-investment"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
No exact I-595 Express project/company or seed record is mapped to this holding. The census relies on FDOT project information and a 2013 TIAA infrastructure-investment announcement. Determine from scratch whether this is a missing manager-level concession company, whether TIAA/Nuveen remains a qualifying direct owner, and whether later ownership or manager changes alter the list decision.

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the canonical concessionaire/legal project-company identity and its relationship to I-595 Express, I-595 Express LLC, I-595 Express Corridor Improvements Project, Florida Department of Transportation, ACS Infrastructure/Iridium and the operator/maintenance entities. Count the DBFOM concession once; do not split express lanes, general-purpose lanes, interchanges, toll systems, construction packages, operators or financing SPVs into separate PortCos.

Establish the original concession award/financial close and every later equity transaction. Verify TIAA's 2013 announcement and legal closing date, direct investment account/fund/vehicle, seller, exact stake/control terms, co-investors and retained ACS/Iridium interest. Determine whether the position belongs to the TIAA General Account, TIAA Real Estate Account, Nuveen Infrastructure or another mandate, and avoid creating separate owners for manager/affiliate labels that represent one underlying investment. Search through 2026-08-19 for subsequent sales, transfers, refinancing, concession amendments, defaults, termination, new investors and signed pending transactions.

Confirm current legal ownership from the latest direct concessionaire, manager, FDOT/regulatory or financing evidence; a stale 2013 announcement alone is insufficient. Distinguish equity ownership from PAB/TIFIA/bank debt, construction/O&M contracts, state oversight and toll-system relationships.

BOUNDARY AND OPERATING PROFILE
Confirm official project/concession website, concession term and expiry, corridor length, express-lane configuration, location/interchanges, operations/maintenance responsibilities, tolling model, users/end market and current disclosed scale with dates. Establish why it qualifies as North American transportation infrastructure. Keep other Florida express-lane projects and ACS/Iridium concessions separate.

RESEARCH RULES
- Resolve canonical identity, aliases, concession/subsidiary boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer FDOT, the concessionaire, TIAA/Nuveen, ACS/Iridium, USDOT/FHWA, regulatory, financing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW only if a missing list-ready canonical concession and current qualifying ownership are proven, PROPOSED_CORRECTION if an existing successor record should be used, PROPOSED_MERGE if duplicate identities are proven, EXCLUDED if Nuveen/TIAA lacks qualifying direct equity, or DEFERRED if current identity or ownership remains unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.fdot.gov/projects/i595/
- https://www.tiaa.org/public/about-tiaa/news-press/press-releases/2013/2013-03-18-infrastructure-investment

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
