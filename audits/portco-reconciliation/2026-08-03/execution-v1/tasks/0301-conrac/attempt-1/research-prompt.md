Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: ConRAC
MANAGER TO RESOLVE: iCON Infrastructure; identify Conrac Solutions, current/former owners and all relevant platform vehicles
TASK: ledger:0301:conrac:6d35f5f9
CANONICAL KEY: conrac|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"The iCON census identifies a current U.S. consolidated rental-car facility platform described as ConRAC, supported by a 2020 partnership announcement with Conrac Solutions, but no repository company exists. Verify whether the investee is Conrac Solutions, a separate facility portfolio/JV, or another legal entity before proposing creation.","productionCompanyId":null,"seedKey":null,"sourceHoldingId":"054-icon-infrastructure:holding:001:conrac","startingEvidence":["https://iconinfrastructure.com/investments/","https://www.conracsolutions.com/news/conrac-solutions-and-icon-infrastructure-announce-partnership"]}

CURRENT CENSUS SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"ConRAC","website":"https://www.conracsolutions.com/","country":"United States","status":"Active","sector":"Transportation","subsector":"Consolidated airport rental-car facilities","headquarters":null,"investmentYear":null,"owners":[{"firm":"iCON Infrastructure","vehicle":"NOT_PUBLICLY_DISCLOSED","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":null,"isActive":true}],"description":"The census describes a manager-level portfolio of consolidated rental-car facilities across U.S. airports rather than individual airport-project records. A December 2020 Conrac Solutions release announced a partnership with iCON."}

IDENTITY, OWNERSHIP AND PLATFORM QUESTIONS
Resolve the exact canonical and legal investee identity: ConRAC, Conrac Solutions, Conrac Solutions Project Delivery, CFC/ConRAC facility entities, the 2020 iCON partnership/JV, or another holding company. Determine whether iCON acquired equity in the management/development company, invested in a portfolio of airport concessions, or formed a vehicle that owns selected facilities. Reconstruct the 2020 transaction and any subsequent closings: exact iCON fund/vehicle, announcement and legal entry dates, stake/control, sellers, retained management ownership and current status. Search through the cutoff for new facilities, concession awards, refinancings, recapitalizations, platform sales, owner changes, exits and signed pending transactions. Define one manager-level canonical boundary only when direct evidence supports it; list individual airport ConRACs, project companies, parking/transportation centers and bonds as subsidiaries/assets/projects rather than separate PortCos. Verify headquarters, facility portfolio, airport customers, concession/lease model, operations and active status. Check for any same-named airport projects already represented elsewhere in the queue.

RESEARCH RULES
- Do not assume the marketing label ConRAC is the legal company name or that iCON owns all Conrac Solutions operations.
- Require direct evidence for platform-level equity, fund/vehicle, stake, announcement/closing date and current status; use NOT_PUBLICLY_DISCLOSED rather than inference.
- Distinguish corporate/platform equity from project finance, municipal bonds, concessions and individual airport facility ownership.
- Search through 2026-08-19 for later owner changes, facility sales, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer iCON, Conrac Solutions, airport authorities, concession/project documents, corporate registries and transaction sources. Use UNRESOLVED for material identity or current ownership; either blocks application.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://iconinfrastructure.com/investments/
- https://www.conracsolutions.com/
- https://www.conracsolutions.com/news/conrac-solutions-and-icon-infrastructure-announce-partnership

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
