Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Wind Facility
MANAGER TO RESOLVE: InfraRed Capital Partners; identify the exact Texas wind project, seller entity and ownership vehicle
TASK: ledger:0316:wind-facility:66fa043e
CANONICAL KEY: wind-facility|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"Production uses the generic placeholder Wind Facility for an unnamed 202 MW south Texas wind farm that InfraRed announced acquiring from Duke Energy on May 30, 2024. The operating date, capacity, geography and turbine facts may identify the project as Mesteno/Mesteño Windpower, but no exact identity was approved. Prove the name through direct transaction/entity evidence or retire/defer the generic record rather than infer it.","productionCompanyId":"cmrxpjj6e012wivhe4nxzbbvd","seedKey":"wind facility|United States","sourceHoldingId":"059-infrared-capital-partners:holding:010:wind-facility","startingEvidence":["https://www.ircp.com/news/infrared-announces-acquisition-of-texas-onshore-wind-farm/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Wind Facility","website":null,"country":"United States","status":"Active","sector":"Power & ET","subsector":"Onshore wind generation","yearFounded":2019,"headquarters":"Texas","investmentYear":2024,"owners":[{"firm":"InfraRed Capital Partners","vehicle":"NOT_PUBLICLY_DISCLOSED","stake":null,"investmentYear":2024,"isActive":true}],"descriptionClaim":"An operational 202 MW wind farm in south Texas, using Vestas turbines, in service since 2019 and acquired from Duke Energy with all-cash equity and no leverage or tax equity."}

IDENTITY, OWNERSHIP AND PROJECT QUESTIONS
Identify the exact project and legal entities behind InfraRed's May 2024 acquisition. Test Mesteno/Mesteño Windpower and every Duke Energy Renewables project against the full fact pattern—202 MW, south Texas county, 2019 commercial operation, Vestas turbines, seller, interconnection, tax-credit/financing structure and transaction timing. Require a source explicitly linking the named project or project entity to the InfraRed purchase; matching characteristics alone are not sufficient. Reconstruct announcement and legal closing date, exact InfraRed fund/vehicle, stake/control, seller and current owner. Search FERC eLibrary, ERCOT, PUCT, county records, Duke filings, project-finance releases and adviser materials for change-of-control evidence. Search through the cutoff for later sale, refinancing, ownership change, exit or signed pending transaction. If identity is proved, recommend renaming/correcting the existing company and aliases. If not, determine whether a generic unpublished/placeholder company is acceptable, should be excluded, or must remain DEFERRED. Keep the standalone project as one PortCo and do not duplicate turbines, project SPVs or tax-equity entities.

RESEARCH RULES
- Do not rename the record from circumstantial capacity/geography matching alone; require direct project-to-transaction evidence.
- Require direct evidence for the exact identity, InfraRed ownership, fund/vehicle, stake, closing date and current status. Use NOT_PUBLICLY_DISCLOSED rather than inference.
- Distinguish legal ownership from O&M, tax-equity, debt and power-offtake relationships.
- Search through 2026-08-19 for later owner changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer InfraRed, Duke Energy, FERC/PUCT/ERCOT, county records, project filings and transaction advisers. Use UNRESOLVED for material identity or current ownership; either blocks application.
- Return PROPOSED_CORRECTION, VERIFIED_NO_CHANGE, EXCLUDED or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.ircp.com/news/infrared-announces-acquisition-of-texas-onshore-wind-farm/
- https://www.ircp.com/investments/energy-transition-renewables/
- https://news.duke-energy.com/releases/duke-energy-renewables-mesteno-windpower-project-begins-commercial-operation-in-texas
- https://elibrary.ferc.gov/eLibrary/search

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
