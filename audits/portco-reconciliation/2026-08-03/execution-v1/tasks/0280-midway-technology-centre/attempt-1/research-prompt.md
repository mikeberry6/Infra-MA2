Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Midway Technology Centre
MANAGERS TO RESOLVE: Harrison Street; FifteenFortySeven Critical Systems Realty / 1547 Critical Systems Realty; CIM Group; identify all direct current and former owners
TASK: ledger:0280:midway-technology-centre:9f8844f1
CANONICAL KEY: midway-technology-centre|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"The manager census treated Midway Technology Centre as one facility in the Harrison Street/1547 four-asset acquisition and proposed rolling it into the manager-level 1547 Critical Systems Realty platform. The repository publishes Midway as a standalone PortCo. Independently verify the correct portfolio/facility boundary and ownership.","productionCompanyId":"cmrxpjhqr010nivhe7nzdhd12","seedKey":"midway technology centre|United States","linkedTaskId":"ledger:0273:1547-critical-systems-realty:8e267688","startingEvidence":["https://harrisonst.com/exclusive-harrison-street-and-fifteenfortyseven-acquire-four-data-center-facilities-in-u-s/","https://www.datacenterdynamics.com/en/news/harrison-street-and-1547-acquire-four-data-center-facilities-in-the-us-from-cim-group/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Midway Technology Centre","country":"United States","status":"Active","sector":"Digital","subsector":"Colocation data center","website":null,"yearFounded":null,"investmentYear":2021,"headquarters":"Illinois","owners":[{"firm":"Harrison Street","vehicle":"Harrison Street Digital Fund","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2021,"isActive":true}],"description":"The repository describes a roughly 230,000-square-foot, 26 MW Chicago colocation facility operated within the 1547 platform. It says Harrison Street and 1547 acquired the property from CIM Group in November 2021 as part of a four-asset portfolio totaling more than 560,000 square feet, with no disclosed ownership split.","milestones":[{"date":"Nov 2, 2021","event":"Harrison Street and 1547 announced the acquisition of Midway Technology Centre within a four-asset portfolio from CIM Group.","category":"Acquisition"},{"date":"Nov 2, 2021","event":"The portfolio announcement described Midway's fiber proximity and expansion potential.","category":"Expansion"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the exact facility/legal identity, address, aliases, property/operating SPVs and relationship to 1547 Critical Systems Realty. Determine what Harrison Street and 1547 acquired from CIM Group in 2021, whether and when it legally closed, every four-asset portfolio/JV vehicle, direct owner, fund and stake, and whether 1547 is co-owner, operator, sponsor or service provider. Do not infer ownership of the 1547 management platform from asset-JV ownership, and do not infer the Harrison Street Digital Fund label without direct evidence. Search through the cutoff for later sale, recapitalization, refinancing, redevelopment, operator/brand change, ownership transfer or signed pending transaction. Verify whether Midway remains operational, its current footprint/power and whether it is still marketed within 1547's portfolio. Define whether Midway is a standalone manager-level investment, an individual facility beneath a broader four-asset holding/platform, or a facility requiring another canonical grouping. State explicitly how task 280 relates to linked task 273 and which record should survive if consolidation is correct.

RESEARCH RULES
- Resolve canonical identity, aliases, platform/JV/portfolio/facility-SPV boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing/entry date, exit date and transaction state; use NOT_PUBLICLY_DISCLOSED rather than inference.
- Search through 2026-08-19 for ownership transfers, recapitalizations, exits and signed pending transactions.
- Count the manager-level investment once. An individual facility in a jointly acquired portfolio is not a separate PortCo unless the manager treats that facility as the direct holding boundary.
- Reopen direct pages and filings. Prefer Harrison Street, 1547, CIM, property/financing records and transaction parties. Use UNRESOLVED when material identity or current ownership cannot be established.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://harrisonst.com/exclusive-harrison-street-and-fifteenfortyseven-acquire-four-data-center-facilities-in-u-s/
- https://www.datacenterdynamics.com/en/news/harrison-street-and-1547-acquire-four-data-center-facilities-in-the-us-from-cim-group/
- https://www.1547realty.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
