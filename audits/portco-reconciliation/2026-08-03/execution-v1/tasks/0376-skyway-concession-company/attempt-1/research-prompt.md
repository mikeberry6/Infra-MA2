Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Skyway Concession Company
REQUESTED MANAGER: Ontario Teachers Pension Plan; identify every current/former direct owner
TASK: ledger:0376:skyway-concession-company:7c24f455
CANONICAL KEY: skyway-concession-company|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["RETIRE_OWNERSHIP"],"rationale":"The repository still shows Ontario Teachers' as active, while the accepted repo-only judgment says its interest was sold in the 2022 Chicago Skyway transaction. Verify the full seller/buyer set, closing date, stakes and current ownership before retiring the period.","productionCompanyIds":["cmrxpjmfz0183ivhe4rnk8kic"],"seedKeys":["skyway concession company|United States"],"sourceRepoOnlyId":"076-ontario-teachers-pension-plan:repo-only:001:skyway-concession-company","startingEvidence":["https://atlasarteria.com/wp-content/uploads/2022/03/Atlas-Arteria-to-acquire-Chicago-Skyway.pdf"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
The published record treats Skyway Concession Company as the active operator of the 7.8-mile Chicago Skyway under a 99-year lease that began in 2005. It shows Ontario Teachers' as the sole active owner from 2016 with no stake or vehicle, yet its milestones also claim a 2022 sale in which Atlas Arteria acquired 66.67% and the Canadian consortium retained the balance. That combination may be stale or internally wrong. Rebuild the legal entity, concession boundary, complete ownership history and current owner set.

IDENTITY AND CONCESSION BOUNDARY
Resolve the canonical legal/commercial identity and relationship among Skyway Concession Company LLC, Chicago Skyway, Chicago Skyway Toll Bridge System, concession/lease entities, holding companies and financing SPVs. Count one manager-level concession platform; do not count the City of Chicago, the road/bridge, tolling vendors, lenders or holding SPVs as separate PortCos.

OWNERSHIP HISTORY
Establish the 2004-2005 privatization/concession award and closing, initial Cintra/Macquarie ownership, the Canadian pension consortium's acquisition announcement and legal close, and exact stakes held by CPP Investments, OMERS and Ontario Teachers'. Verify Ontario Teachers Pension Plan / Ontario Teachers' as one manager lineage.

Rebuild the 2022 transaction from signing through legal closing. Identify every seller, buyer, direct acquisition vehicle and exact stake. Specifically determine whether Atlas Arteria bought 66.67% while PSP Investments or another investor acquired the remaining 33.33%, or whether any Canadian consortium member retained an interest. Do not infer current ownership from the announcement alone; find the closing and latest direct owner evidence.

Search through 2026-08-19 for later sales, recapitalizations, new investors, concession amendments, lease termination/extension, government buyback, signed pending transaction or ownership transfer. Distinguish equity ownership from debt, toll-rate approvals and concession rights.

OPERATING PROFILE
Confirm official website, headquarters, formation year, concession term/expiry, route length, services, customers/end markets, traffic or other disclosed scale, and two to four material milestones. Explain why the asset qualifies as North American transportation infrastructure.

RESEARCH RULES
- Resolve canonical identity, aliases, concession/holding-company boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, exits, restructurings and signed pending transactions.
- Reopen direct pages. Prefer the company, City/FHWA, Atlas Arteria, PSP Investments, Ontario Teachers', OMERS, CPP Investments, Macquarie/Cintra, regulatory filings and transaction-party sources.
- Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_CORRECTION if the company remains included but ownership/history/details need updating; VERIFIED_NO_CHANGE only if every material existing claim is supported; PROPOSED_MERGE if duplicate identities are proven; EXCLUDED only if the canonical record lacks qualifying infrastructure; or DEFERRED if current ownership remains unresolved.
- Retire Ontario Teachers' ownership if direct evidence proves its exit, but keep the company active if other current owners remain. Do not mark the company realized merely because the requested manager exited.
- This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://atlasarteria.com/wp-content/uploads/2022/03/Atlas-Arteria-to-acquire-Chicago-Skyway.pdf
- https://www.chicagoskyway.org/
- https://www.fhwa.dot.gov/ipd/project_profiles/il_chicago_skyway.aspx

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones.

Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction.

Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState.

Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls.

Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary.

Recommend exactly one primary source.
