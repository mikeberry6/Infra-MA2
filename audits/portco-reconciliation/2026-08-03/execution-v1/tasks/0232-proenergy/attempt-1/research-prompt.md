Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: PROENERGY
MANAGER TO RESOLVE: Energy Capital Partners (ECP)
TASK: ledger:0232:proenergy:f5e9cdb0
CANONICAL KEY: proenergy|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_OWNER"],"rationale":"The exact company identity exists in production, but the census ownership holding requires individual review. The repository already records ECP, so determine whether this is an alias-resolved existing owner rather than a true addition.","productionCompanyId":"cmrxpjdoi00uhivhenpf9ydgf","seedKey":"proenergy|United States","startingEvidence":["https://www.ecpgp.com/equity/portfolio","https://www.proenergyservices.com/"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"PROENERGY","country":"United States","status":"Active","sector":"Utilities","subsector":"Fast-start gas generation equipment, services, and contracted power","yearFounded":2002,"investmentYear":2024,"headquarters":"Missouri and Texas","description":"The repository says PROENERGY manufactures/services aeroderivative generation equipment and owns or operates contracted generation through WattBridge; ECP acquired a majority stake in August 2024.","owners":[{"firm":"ECP","vehicle":"NOT_PUBLICLY_DISCLOSED","investmentYear":2024,"stake":"Majority interest; exact percentage not publicly disclosed","isActive":true}],"milestones":[{"date":"2002","event":"PROENERGY was founded.","category":"Founding"},{"date":"Aug 2024","event":"ECP acquired a majority interest in PROENERGY.","category":"Acquisition"},{"date":"2024","event":"Transaction materials included the WattBridge ERCOT portfolio.","category":"Acquisition"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Verify PROENERGY's canonical legal/display identity and its boundary versus PROENERGY Services, WattBridge, turbine/equipment businesses, generation subsidiaries and individual ERCOT plants. Reconstruct ECP's 2024 majority investment: seller/founder rollover, exact buyer organization/fund/vehicle, disclosed stake/control, announcement and legal closing dates, co-investors and current ownership. Search through the as-of date for follow-on equity, recapitalization, WattBridge or plant sales, company sale, owner transfer, ECP portfolio removal, exit or signed pending transaction. Determine whether WattBridge is an owned subsidiary/brand within one manager-level platform or a separately countable PortCo in the manager's own portfolio taxonomy. Resolve whether the census ECP holding is already represented; do not add a duplicate because ECP and Energy Capital Partners are aliases.

RESEARCH RULES
- Resolve canonical identity, aliases, current/former owners and parent/subsidiary/asset boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer percentages or closing from an announcement.
- Search through 2026-08-19 for sale, transfer, recapitalization, refinancing, merger, rebrand, asset disposition, portfolio removal and signed pending transactions.
- Verify official website/status, headquarters, founding year, products/services, customers/end markets, operating footprint, generation capacity and disclosed scale.
- Reopen direct pages. Prefer PROENERGY, ECP, WattBridge, regulatory/filing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.proenergyservices.com/
- https://www.proenergyservices.com/meet-the-pros/about-us/
- https://www.ecpgp.com/about/news-and-insights/press-releases/2024/energy-capital-partners--ecp--acquires-majority-interest-in-proe
- https://www.ecpgp.com/equity/portfolio/proenergy
- https://www.ecpgp.com/equity/portfolio

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
