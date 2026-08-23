Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Union Station Data Center and Carrier Hotel
MANAGERS TO RESOLVE: Harrison Street; FifteenFortySeven Critical Systems Realty / 1547 Critical Systems Realty; Global Access Point and prior owners; identify all direct current and former owners
TASK: ledger:0283:union-station-data-center-and-carrier-hotel:a3bf1cb4
CANONICAL KEY: union-station-data-center-and-carrier-hotel|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"The manager census treated Union Station as a South Bend carrier-hotel asset held within the Harrison Street/1547 relationship and proposed rolling it into the manager-level 1547 Critical Systems Realty platform. The repository publishes Union Station as a standalone PortCo. Independently verify the correct platform/facility boundary and ownership.","productionCompanyId":"cmrxpjhv3010vivhe86ahld32","seedKey":"union station data center and carrier hotel|United States","linkedTaskId":"ledger:0273:1547-critical-systems-realty:8e267688","startingEvidence":["https://harrisonst.com/fifteenfortyseven-critical-systems-realty-and-harrison-street-acquire-the-union-station-data-center-and-carrier-hotel-in-south-bend-indiana/","https://globalaccesspoint.net/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Union Station Data Center and Carrier Hotel","country":"United States","status":"Active","sector":"Digital","subsector":"Carrier hotel and interconnection data center","website":null,"yearFounded":null,"investmentYear":2024,"headquarters":"Indiana","owners":[{"firm":"Harrison Street","vehicle":"Harrison Street Digital Fund","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2024,"isActive":true}],"description":"The repository describes a South Bend, Indiana carrier hotel on transcontinental fiber routes with more than 20 network service providers. It says Harrison Street and 1547 acquired the facility in September 2024 through Harrison Street Digital Fund and planned capacity upgrades, with no disclosed ownership split.","milestones":[{"date":"Sep 4, 2024","event":"Harrison Street and 1547 announced the acquisition of Union Station.","category":"Acquisition"},{"date":"2024","event":"The buyers disclosed planned capacity and facility upgrades.","category":"Expansion"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the exact facility/legal identity, address, Union Station Technology Center aliases, Global Access Point operating relationship, property/operating SPVs and connection to 1547 Critical Systems Realty. Determine what Harrison Street and 1547 acquired in 2024, seller, whether and when it legally closed, direct acquiring/holding entities, fund/vehicle, stakes and whether 1547 is co-owner, operator, sponsor or service provider. Do not infer ownership of the broader 1547 management platform from an asset acquisition and do not infer the Harrison Street Digital Fund label without direct evidence. Search through the cutoff for later sale, recapitalization, refinancing, expansion, operator/brand change, ownership transfer or signed pending transaction. Verify current operation, facility footprint, power/capacity, provider count and current marketing identity. Define whether Union Station is itself the manager-level operating-company/property holding that should remain a standalone PortCo, an underlying facility beneath a broader Harrison Street/1547 portfolio/platform, or an asset requiring another canonical grouping. State explicitly how task 283 relates to linked task 273 and which record should survive if consolidation is warranted.

RESEARCH RULES
- Resolve canonical identity, aliases, platform/JV/company/facility-SPV boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing/entry date, exit date and transaction state; use NOT_PUBLICLY_DISCLOSED rather than inference.
- Search through 2026-08-19 for ownership transfers, recapitalizations, exits and signed pending transactions.
- Count the manager-level investment once, while recognizing that a separately acquired carrier-hotel company/property may be the direct holding boundary.
- Reopen direct pages and filings. Prefer Harrison Street, 1547, Global Access Point, seller/property records, financing sources and transaction parties. Use UNRESOLVED when material identity or current ownership cannot be established.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://harrisonst.com/fifteenfortyseven-critical-systems-realty-and-harrison-street-acquire-the-union-station-data-center-and-carrier-hotel-in-south-bend-indiana/
- https://globalaccesspoint.net/
- https://www.1547realty.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
