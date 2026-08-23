Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Potters Industries LLC
MANAGERS TO RESOLVE: Macquarie Asset Management; UniSuper; Partners Capital; TJC; identify all direct current/former owners and the exact Macquarie infrastructure mandate
TASK: ledger:0331:potters-industries-llc:e5212b53
CANONICAL KEY: potters-industries-llc|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CORRECT_COMPANY","ADD_PENDING_TRANSACTION"],"rationale":"Macquarie announced in November 2025 that a Macquarie-led consortium would acquire a majority stake in Potters from TJC. The seed incorrectly presents Macquarie as an active owner despite finding no closing source and describes the transaction as pending. Independently determine whether it closed, its current cap table and whether Potters qualifies under Macquarie's direct infrastructure strategy rather than a non-infrastructure industrial/private-equity mandate.","productionCompanyId":"cmrxpjkc9014qivheyfmy3lle","seedKey":"potters industries llc|United States","sourceHoldingId":"065-macquarie-asset-management:holding:021:potters-industries-llc","startingEvidence":["https://www.macquarie.com/au/en/about/news/2025/mam-led-consortium-agrees-to-acquire-potters-industries-from-tjc.html"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Potters Industries LLC","country":"United States","status":"Active","sector":"Transportation","subsector":"Road-marking materials and engineered glass media","website":"https://www.pottersindustries.com/","yearFounded":null,"investmentYear":2025,"headquarters":"Pennsylvania; North America; Europe","owners":[{"firm":"Macquarie Asset Management","vehicle":"n.a.","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2025,"isActive":true}],"description":"The seed describes a road-marking glass-bead and engineered-materials manufacturer with 26 manufacturing/logistics sites and a Malvern, Pennsylvania headquarters. It says Macquarie, UniSuper and Partners Capital announced a majority acquisition from TJC in November 2025 but no reviewed source confirmed closing.","milestones":[{"date":"2021","event":"Potters moved to a Malvern corporate and R&D headquarters.","category":"Other"},{"date":"2024","event":"Potters acquired Franklin Paint and UCM.","category":"Acquisition"},{"date":"2025","event":"Potters opened a Wilson, North Carolina plant.","category":"Expansion"},{"date":"Nov 11, 2025","event":"Macquarie-led consortium agreed to acquire a majority stake from TJC.","category":"Acquisition"}]}

IDENTITY, OWNERSHIP AND ELIGIBILITY QUESTIONS
Resolve Potters's exact legal identity, aliases, predecessor/successor names, headquarters, founding history and platform/subsidiary boundary. Establish the November 2025 announcement and definitive agreement, transaction state, regulatory approvals, legal closing date if completed, seller, retained TJC interest, exact consortium members, each disclosed stake, acquisition company, Macquarie-managed fund/account/vehicle, UniSuper and Partners Capital roles, and any management rollover or co-investors. Search through the cutoff for closing announcements, current portfolio listings, financing, recapitalization, later sale, ownership transfer, termination, or signed pending exit. If no closing occurred, keep TJC as the current legal owner and represent Macquarie only as SIGNED_PENDING_INCOMING. If closing occurred, retire TJC only to the supported extent and add the closed owners without inferring equal stakes.

Independently test infrastructure eligibility. Determine whether Macquarie invested through an infrastructure/real-assets mandate in an operating road-safety materials platform, or through private equity/industrial strategy. Evidence that products are used in infrastructure is insufficient by itself. State the precise infrastructure-strategy basis or recommend EXCLUDED if exposure is non-infrastructure. Verify products/services, customers/end markets, operating footprint, site count, official website and North American qualification.

BOUNDARY RULES
Count Potters once at the manager-level platform. Do not separately count Franklin Paint, UCM, manufacturing plants, product brands or local subsidiaries. Do not invent a founding year, exact manager-level stake, vehicle, or closed status. Keep transaction announcement and legal close distinct.

RESEARCH RULES
- Resolve canonical identity, aliases, platform/subsidiary boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit date, and transaction state.
- Search through 2026-08-19 for subsequent ownership transfers, recapitalizations, exits, termination, and signed pending transactions.
- Reopen direct pages and filings. Prefer Potters, Macquarie, UniSuper, Partners Capital, TJC, regulatory/competition, financing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity, eligibility or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE, or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.macquarie.com/au/en/about/news/2025/mam-led-consortium-agrees-to-acquire-potters-industries-from-tjc.html
- https://www.pottersindustries.com/
- https://www.pottersindustries.com/about-us/history/
- https://www.pottersindustries.com/contact/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
