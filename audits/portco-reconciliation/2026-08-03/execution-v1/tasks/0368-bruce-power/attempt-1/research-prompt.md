Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Bruce Power
REQUESTED MANAGER: OMERS Infrastructure; identify TC Energy and every current/former direct owner
TASK: ledger:0368:bruce-power:9c7e76e5
CANONICAL KEY: bruce-power|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_OWNER"],"rationale":"The exact company identity exists and already records one active OMERS ownership period. Determine whether ADD_OWNER is a census/repository matching false positive, whether the existing period needs correction, and whether other current owners must be represented.","productionCompanyIds":["cmrxpjm8e017oivhe1inhdhjr"],"seedKeys":["bruce power|Canada"],"sourceHoldingId":"074-omers-infrastructure:holding:001:bruce-power","startingEvidence":["https://www.omersinfrastructure.com/investments/bruce-power"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
The published record treats Bruce Power as an active Ontario nuclear-generation platform, with OMERS as the only displayed owner, an approximate 50% stake and a 2003 investment year. It describes about 6,550 MW and roughly 30% of Ontario's electricity supply. It has no fund or vehicle and milestones for OMERS's initial investment, 2024 generation, a December 2025 green bond and February 2026 isotope expansion. Rebuild the canonical entity, lease/operator boundary and complete current/former ownership table from direct evidence.

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the canonical legal/commercial identity and relationship among Bruce Power L.P., Bruce Power Inc., Bruce A/B generating stations, Bruce Power Refurbishment Implementation L.P., project/financing entities and Ontario Power Generation as site owner/lessor. Count the manager-level operating platform once; do not split reactors, stations, refurbishment programs, isotope ventures, lease entities or financing SPVs into separate PortCos.

Trace the ownership history from the original 2001/2003 consortium through later British Energy/Cameco/TransCanada or TC Energy, Borealis/OMERS, CPP Investments and union/shareholder changes. Verify OMERS's announcement and legal entry date, acquisition vehicle/fund or account, exact current stake, later stake purchases/sales and the full current co-owner set and percentages. Determine whether the existing approximate-50% fact is precise enough and whether OMERS 2003 is the correct first direct ownership date. Treat OMERS/Borealis label changes as one manager lineage where appropriate rather than duplicate owners.

Search through 2026-08-19 for later equity transfers, recapitalizations, lease changes, government transactions, new investors, signed pending transactions and exit announcements. Confirm current ownership from the latest Bruce Power, owner, filing or regulatory evidence. Distinguish equity ownership from bonds/debt, refurbishment contracts, power contracts, government support, leasehold interests and supplier/union roles; include unions only if they are disclosed direct equity holders.

BOUNDARY AND OPERATING PROFILE
Confirm official website, headquarters/site, founding/formation year, reactor/unit count, current capacity, generation share, operating/licence/lease term, electricity and isotope end markets and disclosed refurbishment/life-extension scale with dates. Establish why it qualifies as Canadian utility infrastructure.

RESEARCH RULES
- Resolve canonical identity, aliases, operator/lease/subsidiary boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Bruce Power, OMERS, TC Energy, owner/shareholder disclosures, CNSC/Ontario regulators, government and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_CORRECTION if the existing owner set, stake, dates, vehicle or boundary needs updating, VERIFIED_NO_CHANGE only if every material existing claim is supported, PROPOSED_MERGE if duplicate identities are proven, EXCLUDED if OMERS lacks qualifying current equity, or DEFERRED if current ownership remains unresolved. Do not add a duplicate OMERS period merely because the queue says ADD_OWNER. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCE TO REOPEN
- https://www.omersinfrastructure.com/investments/bruce-power

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
