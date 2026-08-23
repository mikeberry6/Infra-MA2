Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: UGE International Ltd.
REQUESTED MANAGER: NOVA Infrastructure; identify every current/former direct owner
TASK: ledger:0364:uge-international-ltd:3aed0a3e
CANONICAL KEY: uge-international-ltd|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"No exact normalized production or seed match exists. The census classified UGE International Ltd. as a current NOVA Infrastructure energy-transition holding.","productionCompanyIds":[],"seedKeys":[],"sourceHoldingId":"072-nova-infrastructure:holding:006:uge-international-ltd","startingEvidence":["https://novainfrastructure.com/investments/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
No exact UGE International company or seed record is mapped to this holding. The only starting evidence is NOVA Infrastructure's portfolio page. Determine from scratch whether a list-ready canonical company is missing, whether NOVA's acquisition legally closed, whether UGE remains current and private, and whether any successor, sale or restructuring changes the list decision.

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the canonical legal/commercial identity, exchange-listed predecessor status, aliases, subsidiaries, headquarters and any post-transaction legal name. Establish NOVA's acquisition/take-private announcement, shareholder and court approvals, legal closing date, delisting/privatization date, direct acquisition vehicle/fund, exact stake/control terms, consideration, rollover shareholders, co-investors and retained management interests. Identify every former direct owner only when relevant to the ownership chain; do not treat public-market shareholders as separate infrastructure-manager owners.

Search through 2026-08-19 for recapitalizations, new equity investors, project portfolio sales, platform sales, mergers, insolvency/restructuring events and signed pending transactions. Confirm NOVA's current ownership from the latest direct company/manager, securities or corporate evidence. Distinguish sale of individual solar/storage projects, tax equity, project debt, construction financing and customer/offtake arrangements from ownership of UGE itself.

BOUNDARY AND OPERATING PROFILE
Confirm official website, headquarters, founding year, business model, solar/storage development and operating footprint, owned/managed project capacity, markets, customers/offtakers, community-solar exposure and disclosed pipeline/operating scale with dates. Establish why UGE qualifies as North American infrastructure. Count UGE once at the manager-level platform and treat individual community-solar projects, project SPVs, development portfolios, tax-equity vehicles and acquired project assets as underlying operations unless evidence proves a separate manager-level portfolio investment.

RESEARCH RULES
- Resolve canonical identity, aliases, predecessor/successor names, platform/subsidiary/project boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer UGE, NOVA, Canadian securities/exchange/court filings, U.S. project regulators, government, financing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW only if a missing list-ready canonical company and current qualifying ownership are proven, PROPOSED_CORRECTION if an existing successor record should be used, PROPOSED_MERGE if duplicate identities are proven, EXCLUDED if current direct equity or infrastructure qualification is disproven, or DEFERRED if current identity or ownership remains unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCE TO REOPEN
- https://novainfrastructure.com/investments/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
