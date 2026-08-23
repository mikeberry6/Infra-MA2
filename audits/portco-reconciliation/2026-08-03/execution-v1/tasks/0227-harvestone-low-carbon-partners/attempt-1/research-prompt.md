Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Harvestone Low Carbon Partners
MANAGER TO RESOLVE: Energy Capital Partners (ECP)
TASK: ledger:0227:harvestone-low-carbon-partners:184c949c
CANONICAL KEY: harvestone-low-carbon-partners|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_OWNER"],"rationale":"The exact company identity exists in production, but the census ownership holding requires individual review. The repository already records ECP, so determine whether this is an alias-resolved existing owner rather than a true addition.","productionCompanyId":"cmrxpjdja00ucivher3kcpgs2","seedKey":"harvestone low carbon partners|United States","startingEvidence":["https://www.ecpgp.com/equity/portfolio","https://www.harvestonelcp.com/"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjdja00ucivher3kcpgs2","name":"Harvestone Low Carbon Partners","country":"United States","status":"Active","sector":"Power & ET","subsector":"Low-carbon ethanol and carbon capture","investmentYear":2022,"headquarters":"North Dakota and Indiana","website":null,"description":"The repository says Harvestone is a 2022 Harvestone Group/ECP platform owning ethanol and carbon-management assets at Blue Flint, Dakota Spirit and Iroquois Bio-Energy.","owners":[{"firm":"ECP","vehicle":"NOT_PUBLICLY_DISCLOSED","investmentYear":2022,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"milestones":[{"date":"2022","event":"Harvestone Low Carbon Partners was formed by Harvestone Group and ECP.","category":"Financing"},{"date":"Sep 2024","event":"Harvestone announced $205 million of tax-equity financing for Blue Flint CCS.","category":"Financing"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Verify Harvestone Low Carbon Partners' canonical legal/display identity and its boundary versus Harvestone Group, Harvestone Commodities, Blue Flint, Dakota Spirit, Iroquois Bio-Energy, carbon-capture project entities and other subsidiaries/assets. Reconstruct the platform's 2022 formation: every direct current/former owner, ECP fund or vehicle, Harvestone Group's role, stakes/control, announcement and legal closing dates, and any co-investors. Search through the as-of date for follow-on equity, tax-equity structures, recapitalizations, facility sales, merger, owner transfer, ECP portfolio removal, exit or signed pending transaction. Do not treat project-level tax equity or lenders as manager-level ownership. Resolve whether the census ECP holding is already represented by the existing ECP period; do not create a duplicate owner because ECP and Energy Capital Partners are aliases.

RESEARCH RULES
- Resolve canonical identity, aliases, current/former owners and platform/subsidiary/facility boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer percentages or closing from an announcement.
- Search through 2026-08-19 for sale, transfer, recapitalization, refinancing, merger, rebrand, asset disposition, portfolio removal and signed pending transactions.
- Verify official website/status, headquarters, founding year, products/services, customers/end markets, operating footprint, capacity and disclosed scale.
- Reopen direct pages. Prefer Harvestone, ECP, regulatory/government, filing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://harvestonelcp.com/
- https://www.ecpgp.com/equity/portfolio/harvestone-low-carbon-partners
- https://www.ecpgp.com/equity/portfolio
- https://harvestonelcp.com/fccp-about-19627
- https://harvestonelcp.com/storyArchives-375

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
