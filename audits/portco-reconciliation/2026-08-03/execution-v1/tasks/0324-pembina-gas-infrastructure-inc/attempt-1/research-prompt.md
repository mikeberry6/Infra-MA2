Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census, linked-task, and Deal Database claim as unverified.

REQUESTED COMPANY: Pembina Gas Infrastructure Inc.
MANAGERS TO RESOLVE: KKR; Apollo Global Management; Pembina Pipeline Corporation as a direct strategic co-owner
TASK: ledger:0324:pembina-gas-infrastructure-inc:de0cbf95
CANONICAL KEY: pembina-gas-infrastructure-inc|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CORRECT_COMPANY","ADD_PENDING_TRANSACTION"],"rationale":"The KKR census mapped to the existing Pembina Gas Infrastructure Inc. record and recorded Apollo's announced purchase of KKR's 40% interest as pending. A linked stale alias task for Pembina Gas Infrastructure JV was routed here after preliminary research suggested current PGI pages now identify Apollo-managed funds as the 40% owner. Independently establish whether the sale legally closed, the exact closing date if disclosed, and the complete current/former ownership after-image.","productionCompanyId":"cmrxpjjwg0141ivhecv1bf8dw","seedKey":"pembina gas infrastructure inc.|Canada","linkedTaskId":"ledger:0058:pembina-gas-infrastructure-jv:50280eda","sourceHoldingIds":["064-kkr:holding:014:pembina-gas-infrastructure-inc","010-apollo-global-management:holding:019:pembina-gas-infrastructure-jv"],"startingEvidence":["https://www.apollo.com/insights-news/pressreleases/2026/04/apollo-funds-to-acquire-40-interest-in-pembina-gas-infrastructure-3279810","https://www.pembina.com/operations/partnerships/pembina-gas-infrastructure/about-us","https://www.pembina.com/operations/partnerships/pembina-gas-infrastructure/our-owners"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Pembina Gas Infrastructure Inc.","country":"Canada","status":"Active","sector":"Midstream","subsector":"Natural gas processing, transportation, and NGL services","yearFounded":2022,"investmentYear":2022,"headquarters":"Alberta; British Columbia","owners":[{"firm":"KKR","vehicle":"KKR Global Infrastructure Funds","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2022,"isActive":true}],"description":"PGI is described as a Western Canadian gas-processing and midstream platform serving Montney and Duvernay producers. Pembina and KKR formed the joint venture in 2022, with Pembina retaining 60% and KKR infrastructure funds holding 40%.","milestones":[{"date":"Mar 1, 2022","event":"Pembina and KKR announced agreements to combine their Western Canadian processing assets into PGI.","category":"Financing"},{"date":"Aug 15, 2022","event":"Pembina announced closing of the PGI joint venture and the 60%/40% split.","category":"Financing"},{"date":"Apr 23, 2026","event":"Apollo-managed funds agreed to acquire KKR's 40% interest, with closing expected by the end of Q2 2026.","category":"Divestiture"}],"relatedDeal":{"id":"INF-2026-183","status":"Announced","date":"2026-04-20","buyer":"Apollo Global Management","seller":"KKR","stake":"40%","closingDate":null}}

LINKED-TASK CLAIMS TO REOPEN — DO NOT ASSUME CORRECT
Prior research mapped “Pembina Gas Infrastructure JV” to the existing PGI company and reported current owners as Pembina Pipeline Corporation 60% and Apollo-managed funds 40%, with KKR's 40% former. It found no exact Apollo closing date and proposed 2026 year precision. Reopen the current PGI pages and transaction sources. Do not promote the announcement to CLOSED_ACTIVE merely because a portfolio page changed unless direct current evidence supports that conclusion. Do not infer an Apollo fund, acquisition SPV, or exact closing day.

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the exact legal identity and aliases of Pembina Gas Infrastructure Inc., PGI, “Pembina Gas Infrastructure JV,” and PGI Midstream. Determine the platform boundary relative to Pembina Pipeline Corporation, Veresen Midstream, Energy Transfer Canada, individual processing plants, batteries, gathering systems, and projects contributed to or acquired by PGI. Establish the original 2022 legal closing and exact 60% Pembina / 40% KKR split; the correct KKR manager, infrastructure fund or vehicle wording; Apollo's 2026 announcement, legal closing status and date precision; every current and former direct owner; and whether any later recapitalization, sale, dilution, pending exit, or ownership transfer occurred through the cutoff. Verify the manager-level infrastructure strategy basis, Canadian qualification, operating scope, official website, founding/formation year, headquarters wording, scale metrics, and whether the published company remains active. State whether the related Deal Database record appears stale, but do not modify it.

RESEARCH RULES
- Resolve canonical identity, aliases, platform/JV/subsidiary boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit date, and transaction state. Keep announcement and closing distinct.
- Search through 2026-08-19 for subsequent ownership transfers, recapitalizations, exits, and signed pending transactions.
- Count PGI once. Do not create separate PortCos for predecessor businesses, contributed assets, plants, pipelines, batteries, or projects beneath the platform.
- Reopen direct pages and filings. Prefer PGI/Pembina, Apollo, KKR, regulatory/filing, and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE, or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.pembina.com/operations/partnerships/pembina-gas-infrastructure/about-us
- https://www.pembina.com/operations/partnerships/pembina-gas-infrastructure/our-owners
- https://www.pembina.com/media-centre/news/details/26e3477b-f34f-4c9f-877d-8cbe4ad170af
- https://www.apollo.com/insights-news/pressreleases/2026/04/apollo-funds-to-acquire-40-interest-in-pembina-gas-infrastructure-3279810
- https://www.prnewswire.com/news-releases/pembina-pipeline-corporation-and-kkr-create-joint-venture-to-merge-western-canadian-processing-assets-301492668.html

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
