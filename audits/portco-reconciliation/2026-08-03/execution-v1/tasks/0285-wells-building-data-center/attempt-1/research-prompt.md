Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Wells Building Data Center
MANAGERS TO RESOLVE: Harrison Street; FifteenFortySeven Critical Systems Realty / 1547 Critical Systems Realty; identify all direct current and former owners
TASK: ledger:0285:wells-building-data-center:43636a55
CANONICAL KEY: wells-building-data-center|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"The manager census treated the Wells Building as a Milwaukee carrier-hotel asset held within the Harrison Street/1547 relationship and proposed rolling it into the manager-level 1547 Critical Systems Realty platform. The repository publishes the Wells Building as a standalone PortCo. Independently verify the correct platform/facility boundary and ownership.","productionCompanyId":"cmrxpjhxb010zivhelk49c64f","seedKey":"wells building data center|United States","linkedTaskId":"ledger:0273:1547-critical-systems-realty:8e267688","startingEvidence":["https://www.1547realty.com/data-center/milwaukee-wi-miwi1/","https://www.1547realty.com/resource/1547-and-harrison-street-acquire-historic-milwaukee-carrier-hotel-and-data-center/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Wells Building Data Center","country":"United States","status":"Active","sector":"Digital","subsector":"Carrier hotel and colocation data center","website":null,"yearFounded":null,"investmentYear":2020,"headquarters":"Wisconsin","owners":[{"firm":"Harrison Street","vehicle":"Harrison Street Digital Fund","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2020,"isActive":true}],"description":"The repository describes a 15-story, 165,000-square-foot carrier hotel at 324 East Wisconsin Avenue in downtown Milwaukee, served by more than 35 telecommunications providers. It says Harrison Street and 1547 acquired the facility in September 2020, with no disclosed ownership split.","milestones":[{"date":"Sep 3, 2020","event":"Harrison Street and 1547 announced the Wells Building acquisition.","category":"Acquisition"},{"date":"Nov 2, 2021","event":"The firms referenced Wells Building as an earlier acquisition when announcing a four-asset deal.","category":"Acquisition"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the exact facility/legal identity, MIWI1 alias, historic building/property ownership, operating entities and relationship to 1547 Critical Systems Realty. Determine what Harrison Street and 1547 acquired in 2020, seller, whether and when it legally closed, direct acquiring/holding entities, fund/vehicle, stakes and whether 1547 is co-owner, operator, sponsor or service provider. Do not infer ownership of the broader 1547 management platform from an asset acquisition and do not infer the Harrison Street Digital Fund label without direct evidence. Search through the cutoff for later sale, recapitalization, refinancing, capital improvements, operator/brand change, ownership transfer or signed pending transaction. Verify current operation, address, footprint, connectivity and facility scale. Define whether Wells Building is itself the direct manager-level holding that should remain a PortCo, an underlying facility beneath a broader Harrison Street/1547 portfolio/platform, or an asset requiring another canonical grouping. State explicitly how task 285 relates to linked task 273 and which record should survive if consolidation is warranted.

RESEARCH RULES
- Resolve canonical identity, aliases, platform/JV/company/facility-SPV boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing/entry date, exit date and transaction state; use NOT_PUBLICLY_DISCLOSED rather than inference.
- Search through 2026-08-19 for ownership transfers, recapitalizations, exits and signed pending transactions.
- Count the manager-level investment once, while recognizing that a separately acquired operating carrier-hotel property may be the direct holding boundary.
- Reopen direct pages and filings. Prefer 1547, Harrison Street, seller/property records, financing sources and transaction parties. Use UNRESOLVED when material identity or current ownership cannot be established.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.1547realty.com/data-center/milwaukee-wi-miwi1/
- https://www.1547realty.com/resource/1547-and-harrison-street-acquire-historic-milwaukee-carrier-hotel-and-data-center/
- https://www.1547realty.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
