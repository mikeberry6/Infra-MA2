Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Long Beach Container Terminal
MANAGERS TO RESOLVE: Macquarie Asset Management; MEAG; identify every direct current and former owner
TASK: ledger:0328:long-beach-container-terminal:d95cebc8
CANONICAL KEY: long-beach-container-terminal|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_OWNER"],"rationale":"The Macquarie and MEAG censuses map to the same existing Long Beach Container Terminal record. The seed records only Macquarie, while MEAG separately identifies an investment in the container terminal. Independently reconstruct the acquisition and current cap table before adding an owner or percentage.","productionCompanyId":"cmrxpjk8n014jivhecvfuv0ei","seedKey":"long beach container terminal|United States","sourceHoldingIds":["065-macquarie-asset-management:holding:014:long-beach-container-terminal","066-meag:holding:006:long-beach-container-terminal"],"startingEvidence":["https://www.macquarie.com/au/en/about/company/macquarie-asset-management/our-portfolio/long-beach-container-terminal.html","https://www.meag.com/en/news/meag-invests-in-container-terminal-in-long-beach.html"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Long Beach Container Terminal","country":"United States","status":"Active","sector":"Transportation","subsector":"Marine container terminal","website":"https://www.lbct.com/about-us/","yearFounded":2016,"investmentYear":2019,"headquarters":"California","owners":[{"firm":"Macquarie Asset Management","vehicle":"Macquarie Infrastructure Partners IV","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2019,"isActive":true}],"description":"LBCT operates the automated Pier E container terminal at the Port of Long Beach. The seed says a Macquarie-managed fund acquired it in 2019 and records no MEAG ownership.","milestones":[{"date":"2016","event":"The current Pier E facility opened.","category":"Expansion"},{"date":"2019","event":"A Macquarie-managed fund acquired LBCT.","category":"Acquisition"},{"date":"2022","event":"LBCT launched its Net Zero 2030 plan.","category":"Management"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the exact legal identity and aliases of Long Beach Container Terminal, LLC, LBCT, the Pier E concession/lease, any acquisition holding companies, and the seller's project entity. Establish the 2019 transaction announcement and legal close, seller, total interest transferred, purchaser consortium, precise Macquarie and MEAG manager/fund/vehicle attribution, each disclosed stake, and whether MEAG invested at the initial close or through a later syndication/co-investment. Determine whether other co-investors or strategic owners remain. Search through the cutoff for refinancing, recapitalization, stake sale, ownership transfer, concession change, operator change, signed pending exit, or other disposition. Verify active ownership from direct current sources rather than relying only on a historical acquisition release. Verify operating status, official website, facility opening/founding distinction, terminal footprint/capacity, location, services, customer/end-market profile, and infrastructure qualification.

BOUNDARY RULES
Count LBCT once as the manager-level terminal operating/concession company. Do not separately count Pier E, individual berths, cranes, rail assets, or holding SPVs. Keep International Transportation Service, TraPac, and other terminal operators separate unless direct evidence proves a legal identity combination. Preserve Macquarie and MEAG as separate ownership periods/owners even if both invested through the same consortium; do not collapse them into one manager label.

RESEARCH RULES
- Resolve canonical identity, aliases, company/concession/SPV boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit date, and transaction state; do not infer equal ownership or a percentage from consortium participation.
- Search through 2026-08-19 for subsequent ownership transfers, recapitalizations, exits, concession changes, and signed pending transactions.
- Reopen direct pages and filings. Prefer LBCT, Macquarie, MEAG, Port of Long Beach/port records, seller, and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE, or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.lbct.com/about-us/
- https://www.macquarie.com/au/en/about/company/macquarie-asset-management/our-portfolio/long-beach-container-terminal.html
- https://www.meag.com/en/news/meag-invests-in-container-terminal-in-long-beach.html
- https://www.macquarie.com/au/en/insights/supporting-long-term-and-sustainable-outcomes-in-us-shipping.html

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
