Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: AlohaNAP
MANAGERS TO RESOLVE: Harrison Street; FifteenFortySeven Critical Systems Realty / 1547 Critical Systems Realty; identify all direct current and former owners
TASK: ledger:0274:alohanap:51454abf
CANONICAL KEY: alohanap|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"The manager census treated AlohaNAP as an individual data-center asset operated within the 1547 Critical Systems Realty relationship and proposed rolling it into the manager-level 1547 platform. The repository instead publishes AlohaNAP as a standalone PortCo. Independently verify the actual legal ownership and portfolio boundary; do not assume the proposed merge is correct.","productionCompanyId":"cmrxpjhg30107ivhenj7apjo2","seedKey":"alohanap|United States","linkedTaskId":"ledger:0273:1547-critical-systems-realty:8e267688","startingEvidence":["https://www.1547realty.com/data-center/kapolei-hi-haii1/","https://harrisonst.com/harrison-street-and-fifteenfortyseven-critical-systems-realty-acquire-strategically-located-carrier-hotel-data-center-in-hawaii-announce-expansion-plans/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"AlohaNAP","country":"United States","status":"Active","sector":"Digital","subsector":"Carrier-neutral interconnection data center","website":null,"yearFounded":2015,"investmentYear":2024,"headquarters":"Hawaii","owners":[{"firm":"Harrison Street","vehicle":"Harrison Street Digital Fund","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2024,"isActive":true}],"description":"AlohaNAP is described as a carrier-neutral interconnection-focused data center in Kapolei, Oahu serving carriers, cloud/content networks and enterprises through submarine-cable, satellite and colocation connectivity. The record states Phase 1 is a 22,800-square-foot, 2.7 MW facility with access to five submarine cable networks and more than 40 satellites; Harrison Street and 1547 announced its acquisition and campus expansion in October 2024.","milestones":[{"date":"2015","event":"Public reporting indicates the AlohaNAP facility launched in Kapolei.","category":"Founding"},{"date":"2024","event":"The owners announced expansion plans to convert the site into a multi-building campus.","category":"Other"},{"date":"Oct 15, 2024","event":"Harrison Street and 1547 announced the acquisition of AlohaNAP.","category":"Acquisition"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the exact legal and brand identity of AlohaNAP, including HAI1, the Kapolei facility/campus, asset-owning SPVs, prior operator Cloud NAP, and any relationship to 1547 Critical Systems Realty. Determine what Harrison Street and 1547 actually acquired in 2024, whether and when it legally closed, every direct/acquisition-vehicle owner, the relevant Harrison Street fund or managed account, each disclosed stake, and whether 1547 is a co-owner, operator, sponsor or service provider. Do not turn a fund-and-operator asset joint venture into ownership of the broader 1547 management company without direct evidence. Conversely, do not retain a project/facility as a separate PortCo if the correct manager-level holding is a broader multi-asset platform or joint venture. Search through the cutoff for campus expansion, additional capital, later sale, recapitalization, operator change, ownership transfer, signed pending exit or other disposition. Verify launch/founding date, facility footprint and capacity, active operations, website, location and customer/end-market claims. Identify the correct relationship to linked task 273 and state explicitly whether task 274 should remain separate, merge into 1547, be treated as an underlying asset excluded from the PortCo census, or receive a narrower correction.

RESEARCH RULES
- Resolve canonical identity, aliases, platform/JV/asset-SPV boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit date and transaction state; do not infer equal ownership or the Harrison Street Digital Fund label.
- Search through 2026-08-19 for ownership transfers, recapitalizations, exits and signed pending transactions.
- Count the manager-level investment once. Distinguish ownership of AlohaNAP/HAI1 from ownership of 1547 Critical Systems Realty and from operation by 1547.
- Reopen direct pages and filings. Prefer Harrison Street, 1547, seller/operator, permitting/land records and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.1547realty.com/data-center/kapolei-hi-haii1/
- https://harrisonst.com/harrison-street-and-fifteenfortyseven-critical-systems-realty-acquire-strategically-located-carrier-hotel-data-center-in-hawaii-announce-expansion-plans/
- https://www.datacenterdynamics.com/en/news/harrison-street-and-fifteenfortyseven-acquire-data-center-in-hawaii-announce-expansion-plans/
- https://www.1547realty.com/video/alohanap-data-center-at-a-glance/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
