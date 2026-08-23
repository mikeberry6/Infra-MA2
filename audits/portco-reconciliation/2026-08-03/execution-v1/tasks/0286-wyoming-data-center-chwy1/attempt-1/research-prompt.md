Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Wyoming Data Center (CHWY1)
MANAGERS TO RESOLVE: Harrison Street; FifteenFortySeven Critical Systems Realty / 1547 Critical Systems Realty; CIM Group; identify all direct current and former owners
TASK: ledger:0286:wyoming-data-center-chwy1:c8f7768a
CANONICAL KEY: wyoming-data-center-chwy1|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"The manager census treated CHWY1 as one facility in the Harrison Street/1547 four-asset acquisition and proposed rolling it into the manager-level 1547 Critical Systems Realty platform. The repository publishes CHWY1 as a standalone PortCo. Independently verify the correct portfolio/facility boundary and ownership.","productionCompanyId":"cmrxpjhza0112ivhee9ol0nj7","seedKey":"wyoming data center (chwy1)|United States","linkedTaskId":"ledger:0273:1547-critical-systems-realty:8e267688","startingEvidence":["https://www.businesswire.com/news/home/20211102006105/en/fifteenfortyseven-Critical-Systems-Realty-and-Harrison-Street-Acquire-Portfolio-of-Four-Strategically-Located-Data-Centers-in-New-York-Chicago-and-Wyoming","https://harrisonst.com/exclusive-harrison-street-and-fifteenfortyseven-acquire-four-data-center-facilities-in-u-s/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Wyoming Data Center (CHWY1)","country":"United States","status":"Active","sector":"Digital","subsector":"Colocation data center","website":null,"yearFounded":null,"investmentYear":2021,"headquarters":"Wyoming","owners":[{"firm":"Harrison Street","vehicle":"Harrison Street Digital Fund","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2021,"isActive":true}],"description":"The repository describes an approximately 42,000-square-foot Cheyenne colocation facility operated within the 1547 platform and fully leased at the 2021 acquisition announcement. It says Harrison Street and 1547 acquired it from CIM Group in November 2021 through Harrison Street Digital Fund, with no disclosed ownership split.","milestones":[{"date":"Nov 2, 2021","event":"Harrison Street and 1547 announced the acquisition from CIM Group.","category":"Acquisition"},{"date":"Nov 2, 2021","event":"The facility was described as fully leased to a national virtual-infrastructure and IT-services customer.","category":"Expansion"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the exact facility/legal identity, address, CHWY1 alias, tenant/operating boundary, property/operating SPVs and relationship to 1547 Critical Systems Realty. Determine what Harrison Street and 1547 acquired from CIM Group in 2021, whether and when it legally closed, every four-asset portfolio/JV vehicle, direct owner, fund and stake, and whether 1547 is co-owner, operator, sponsor or service provider. Do not infer ownership of the 1547 management platform from asset-JV ownership, and do not infer the Harrison Street Digital Fund label without direct evidence. Search through the cutoff for later sale, recapitalization, refinancing, tenant change, operator/brand change, ownership transfer or signed pending transaction. Verify whether CHWY1 remains operational, leased and marketed, and confirm its current footprint/power if public. Define whether CHWY1 is a standalone manager-level investment, an individual facility beneath a broader four-asset holding/platform, or a facility requiring another canonical grouping. State explicitly how task 286 relates to linked task 273 and which record should survive if consolidation is correct.

RESEARCH RULES
- Resolve canonical identity, aliases, platform/JV/portfolio/facility-SPV boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing/entry date, exit date and transaction state; use NOT_PUBLICLY_DISCLOSED rather than inference.
- Search through 2026-08-19 for ownership transfers, recapitalizations, exits and signed pending transactions.
- Count the manager-level investment once. An individual facility in a jointly acquired portfolio is not a separate PortCo unless the manager treats that facility as the direct holding boundary.
- Reopen direct pages and filings. Prefer Harrison Street, 1547, CIM, property/financing records and transaction parties. Use UNRESOLVED when material identity or current ownership cannot be established.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.businesswire.com/news/home/20211102006105/en/fifteenfortyseven-Critical-Systems-Realty-and-Harrison-Street-Acquire-Portfolio-of-Four-Strategically-Located-Data-Centers-in-New-York-Chicago-and-Wyoming
- https://harrisonst.com/exclusive-harrison-street-and-fifteenfortyseven-acquire-four-data-center-facilities-in-u-s/
- https://dgtlinfra.com/1547-critical-systems-realty/
- https://www.1547realty.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
