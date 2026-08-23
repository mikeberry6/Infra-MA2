Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Coastal GasLink Pipeline
MANAGER TO RESOLVE: KKR; also identify AIMCo, TC Energy, Indigenous investor groups and all current/former owners or vehicles
TASK: ledger:0321:coastal-gaslink-pipeline:b82e2db4
CANONICAL KEY: coastal-gaslink-pipeline|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"Production contains Coastal GasLink Pipeline while a second seed-only record named Coastal GasLink Pipeline Project appears to describe the same asset. Census confirms KKR but exact identity, owner split and any later Indigenous ownership require review. Resolve one canonical pipeline and consolidate the duplicate seed identity.","candidateKeep":{"name":"Coastal GasLink Pipeline","productionCompanyId":"cmrxpj4e100geivhe4lo6qn4w","seedKey":"coastal gaslink pipeline|Canada"},"candidateDuplicate":{"name":"Coastal GasLink Pipeline Project","productionCompanyId":null,"seedKey":"coastal gaslink pipeline project|Canada"},"sourceHoldingId":"064-kkr:holding:006:coastal-gaslink-pipeline","startingEvidence":["https://www.coastalgaslink.com/whats-new/news-stories/2020/tc-energy-completes-partial-monetization-and-project-financing-transactions-for-coastal-gaslink/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"candidateKeep":{"name":"Coastal GasLink Pipeline","country":"Canada","status":"Active","sector":"Midstream","subsector":"Natural gas transmission pipeline","yearFounded":2012,"headquarters":"British Columbia","ownersClaimed":[{"firm":"KKR","vehicle":"NOT_PUBLICLY_DISCLOSED","stake":"Part of combined 65% with AIMCo","investmentYear":2020,"isActive":true},{"firm":"TC Energy","vehicle":null,"stake":"35%","investmentYear":2012,"isActive":true}]},"candidateDuplicate":{"name":"Coastal GasLink Pipeline Project","country":"Canada","status":"Active","sameAssetSuspected":true},"descriptionClaim":"An approximately 670 km pipeline connecting northeastern British Columbia gas supply to LNG Canada near Kitimat."}

IDENTITY, OWNERSHIP AND PIPELINE QUESTIONS
Prove whether Coastal GasLink Pipeline and Coastal GasLink Pipeline Project are the same legal/operating asset, and identify the correct canonical/legal name and owner entity. Reconstruct TC Energy's project formation, KKR/AIMCo's combined 65% acquisition: announcement and May 25, 2020 legal closing, purchaser vehicles, individual beneficial stakes if disclosed, and TC Energy's retained position. Investigate the 2022 agreement for a coalition of 16 First Nations to acquire a 10% interest: seller(s), transaction state, financing, legal closing and whether it ever completed; keep signed pending ownership explicit if still unclosed. Search through the cutoff for in-service/commercial-operation dates, cost/financing restructurings, owner changes, exits and signed pending transactions. Verify current owners using company, TC Energy, KKR, AIMCo, Indigenous coalition and bond/credit materials. Consolidate exactly one company/seed record and one ownership set; preserve Pipeline Project as alias/redirect and treat route segments, compressor stations, project-finance issuers and contractors as underlying assets/entities.

RESEARCH RULES
- Do not split the operating pipeline and “Pipeline Project” into separate PortCos.
- Do not divide KKR/AIMCo's combined 65% without direct evidence of individual percentages.
- Treat the Indigenous 10% agreement as pending unless legal closing is directly proved; do not replace current owners on announcement alone.
- Require direct evidence for each current owner, vehicle, stake, entry/closing date and current status. Use NOT_PUBLICLY_DISCLOSED rather than inference.
- Search through 2026-08-19 for later closings, owner changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Coastal GasLink, TC Energy, KKR, AIMCo, First Nations coalition/government, bond/credit and regulatory materials. Use UNRESOLVED for material identity or current ownership; either blocks application.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.coastalgaslink.com/about/
- https://www.coastalgaslink.com/whats-new/news-stories/2020/tc-energy-completes-partial-monetization-and-project-financing-transactions-for-coastal-gaslink/
- https://www.aimco.ca/insights/investment-in-tc-energy-coastal-gaslink-pipeline-project
- https://www.tcenergy.com/operations/natural-gas/coastal-gaslink/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
