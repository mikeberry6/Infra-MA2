Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Leeward Renewable Energy
REQUESTED MANAGER: OMERS Infrastructure; identify ArcLight and every current/former direct owner
TASK: ledger:0370:leeward-renewable-energy:acc199f8
CANONICAL KEY: leeward-renewable-energy|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_OWNER"],"rationale":"The exact company identity exists and already records one active OMERS ownership period. Determine whether ADD_OWNER is a census/repository matching false positive, whether the existing period needs correction, and whether any co-owner or former-owner periods must be represented.","productionCompanyIds":["cmrxpjm8v017pivhepl8l8kkk"],"seedKeys":["leeward renewable energy|United States"],"sourceHoldingId":"075-omers-infrastructure:holding:008:leeward-renewable-energy","startingEvidence":["https://www.omersinfrastructure.com/investments/leeward-renewable-energy"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
The published record treats Leeward Renewable Energy as an active U.S. utility-scale wind, solar and storage platform owned only by OMERS, with no disclosed fund/vehicle or stake and an investment year of 2018. It says OMERS acquired the business from ArcLight, describes roughly 4 GW of operating capacity, and records a March 2018 announcement plus the April 2021 First Solar U.S. development-platform acquisition. Rebuild the canonical identity, legal owner, transaction timing, current scale and complete current/former ownership history from direct evidence.

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the canonical legal/commercial identity and relationship among Leeward Renewable Energy, LLC, Leeward Renewable Energy Development, LLC, Leeward Asset Management, individual project companies, the legacy Infigen U.S. business and any successor or intermediate holding companies. Count the manager-level renewable owner/developer platform once; do not split wind, solar, storage projects, development portfolios or financing SPVs into separate PortCos.

Trace the ownership history from ArcLight's acquisition or formation of the U.S. portfolio through OMERS Infrastructure's 2018 agreement and legal closing. Verify announcement and close dates, whether OMERS acquired 100%, any disclosed investment account/fund/vehicle, and whether ArcLight fully exited. Determine whether the existing single OMERS owner period is already correct or whether the queue's ADD_OWNER reflects only a manager-label matching issue. Identify any current co-investors only when direct platform-level equity is proven.

Search through 2026-08-19 for subsequent stake sales, recapitalizations, continuation vehicles, new investors, signed pending transactions or an OMERS exit. Confirm current ownership from the latest Leeward, OMERS, filing, transaction-party or regulatory evidence. Distinguish platform equity from tax equity, project finance, construction debt, power-purchase agreements, project acquisitions, joint-development arrangements, lenders and project-level minority interests.

BOUNDARY AND OPERATING PROFILE
Confirm official website, headquarters, founding or platform-formation year, current operating and development capacity, asset count, technologies, U.S. footprint, customers/end markets and disclosed acquisition or construction scale with dates. Establish why it qualifies as U.S. power and energy-transition infrastructure. Do not infer current portfolio size from stale acquisition announcements.

RESEARCH RULES
- Resolve canonical identity, aliases, parent/subsidiary/project boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Leeward, OMERS, ArcLight, seller/buyer releases, FERC/SEC/regulatory filings and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_CORRECTION if the existing owner set, stake, dates, vehicle, operating profile or boundary needs updating, VERIFIED_NO_CHANGE only if every material existing claim is supported, PROPOSED_MERGE if duplicate identities are proven, EXCLUDED if OMERS lacks qualifying current equity, or DEFERRED if current ownership remains unresolved. Do not add a duplicate OMERS period merely because the queue says ADD_OWNER. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.omersinfrastructure.com/investments/leeward-renewable-energy
- https://www.omers.com/news/omers-infrastructure-announces-agreement-to-acquire-leeward-renewable-energy
- https://www.lreus.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
