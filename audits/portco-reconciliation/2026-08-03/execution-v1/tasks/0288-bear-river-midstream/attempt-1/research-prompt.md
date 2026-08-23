Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Bear River Midstream
MANAGER TO RESOLVE: I Squared Capital; identify all direct current and former owners
TASK: ledger:0288:bear-river-midstream:6266be72
CANONICAL KEY: bear-river-midstream|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"The census found a new U.S. natural-gas-storage platform launched after I Squared completed its acquisition of Spire storage assets in June 2026. No production or seed company exists. Verify the platform identity, exact acquired asset boundary, closing, ownership vehicle, current status and any post-closing changes before proposing creation.","productionCompanyId":null,"seedKey":null,"sourceHoldingId":"053-i-squared-capital:holding:017:bear-river-midstream","startingEvidence":["https://isquaredcapital.com/news/acquisition-spire-storage-assets-bear-river-midstream/","https://bearrivermidstream.com/"]}

CURRENT CENSUS SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Bear River Midstream","country":"United States","status":"Active","sector":"Midstream","subsector":"Natural gas storage infrastructure","website":"https://bearrivermidstream.com/","yearFounded":2026,"investmentYear":2026,"headquarters":null,"owners":[{"firm":"I Squared Capital","vehicle":"NOT_PUBLICLY_DISCLOSED","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2026,"isActive":true}],"description":"The census describes a standalone U.S. midstream platform launched after I Squared completed the acquisition of Spire natural-gas-storage assets in Wyoming and Oklahoma on June 30, 2026.","milestones":[{"date":"Jun 30, 2026","event":"I Squared announced completion of the Spire storage acquisition and launch of Bear River Midstream.","category":"Acquisition"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve Bear River Midstream's canonical/legal identity, aliases, website, headquarters and platform-versus-subsidiary/asset boundary. Identify every acquired storage business, field, pipeline or operating entity formerly owned by Spire, seller chain, FERC/regulatory approvals, announcement/signing date, exact legal closing date and consideration if disclosed. Determine I Squared's direct acquiring/holding entities, fund or managed account, ownership stake, co-investors and current owner chain; do not infer full ownership or a fund name. Verify current operations, geography, working-gas/storage capacity, interconnects, customers and management-level platform scope. Search through the cutoff for any post-closing transfer, recapitalization, financing, sale or signed pending ownership transaction. Ensure individual fields, pipelines and operating subsidiaries are listed only as underlying assets and not separate PortCos. Search for predecessor or alternative platform names that may duplicate a repo company.

RESEARCH RULES
- Resolve canonical identity, aliases, platform/subsidiary/asset-SPV boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing/entry date, exit date and transaction state; use NOT_PUBLICLY_DISCLOSED rather than inference.
- Search through 2026-08-19 for ownership transfers, recapitalizations, exits and signed pending transactions.
- Include one manager-level operating platform; do not double-count storage fields, pipelines, acquired legal subsidiaries or projects beneath it.
- Reopen direct pages and filings. Prefer Bear River, I Squared, Spire, FERC/regulatory filings and transaction parties. Use UNRESOLVED when material identity or current ownership cannot be established.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://isquaredcapital.com/news/acquisition-spire-storage-assets-bear-river-midstream/
- https://bearrivermidstream.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
