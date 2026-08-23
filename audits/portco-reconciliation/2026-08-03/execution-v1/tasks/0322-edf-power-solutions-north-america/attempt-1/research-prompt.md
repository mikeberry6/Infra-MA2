Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: EDF Power Solutions North America
MANAGER TO RESOLVE: KKR; identify EDF, founders/management and all current/former owners or transaction vehicles
TASK: ledger:0322:edf-power-solutions-north-america:20c2fa23
CANONICAL KEY: edf-power-solutions-north-america|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"KKR announced a definitive agreement to acquire EDF Power Solutions North America, but no production or seed company exists. The census treats the signed acquisition as pending. Verify exact legal identity, geographic boundary, current EDF ownership, KKR vehicle and closing status before creating a pending company record.","productionCompanyId":null,"seedKey":null,"sourceHoldingId":"064-kkr:holding:021:edf-power-solutions-north-america","startingEvidence":["https://www.edf-re.com/press-releases/kkr-to-acquire-edf-power-solutions-north-america/"]}

CURRENT CENSUS SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"EDF Power Solutions North America","formerNameClaim":"EDF Renewables North America","website":"https://www.edf-re.com/","country":"Canada / Mexico / United States","status":"Pending incoming acquisition","sector":"Power & ET","subsector":"Utility-scale renewable generation, storage and services","headquarters":null,"investmentYear":null,"owners":[{"firm":"EDF group / EDF power solutions","vehicle":null,"stake":"Current legal owner; percentage NOT_PUBLICLY_DISCLOSED","investmentYear":null,"isActive":true}],"pendingTransaction":{"buyer":"KKR","seller":"EDF group","stake":"NOT_PUBLICLY_DISCLOSED","announcementDate":null,"closingDate":null,"state":"SIGNED_PENDING_INCOMING"}}

IDENTITY, OWNERSHIP AND TRANSACTION QUESTIONS
Resolve the exact legal/canonical identity and scope of EDF Power Solutions North America, including its relationship to EDF Renewables North America, EDF power solutions, EDF Inc., U.S./Canada/Mexico subsidiaries and any businesses excluded from the sale. Reconstruct KKR's definitive agreement: announcement/signing date, buyer and seller entities, exact KKR strategy/fund/vehicle, stake/control, consideration if disclosed, regulatory conditions and expected closing. Search through the cutoff for regulatory approvals, legal closing, termination, amended terms or other owner changes; classify CLOSED_ACTIVE only with direct closing evidence, otherwise preserve current EDF ownership and SIGNED_PENDING_INCOMING. Verify the platform's assets/development pipeline, generation/storage/services businesses, countries, headquarters and infrastructure-strategy basis. Define one manager-level North American platform; treat project SPVs, individual wind/solar/storage assets and service subsidiaries beneath it as underlying entities. Establish any excluded EDF operations (for example non-North-American or retained businesses) so the canonical boundary matches the transaction.

RESEARCH RULES
- Signed definitive transactions count, but KKR is not an active owner until legal closing is directly established; keep EDF active while pending.
- Require direct evidence for legal identity/scope, seller, buyer, fund/vehicle, stake, signing date, closing conditions and current state. Use NOT_PUBLICLY_DISCLOSED rather than inference.
- Do not sweep global EDF power solutions operations or excluded North American activities into the acquired platform.
- Search through 2026-08-19 for closing, termination, owner changes and subsequent exits.
- Reopen direct pages and filings. Prefer EDF/EDF Power Solutions, KKR, competition/regulatory agencies and transaction advisers. Use UNRESOLVED for material identity or current ownership; either blocks application.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.edf-re.com/press-releases/kkr-to-acquire-edf-power-solutions-north-america/
- https://www.edf-re.com/
- https://www.kkr.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
