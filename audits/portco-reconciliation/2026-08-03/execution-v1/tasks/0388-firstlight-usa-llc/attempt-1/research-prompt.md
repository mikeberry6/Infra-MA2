Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: FirstLight USA, LLC
REQUESTED MANAGER: PSP Investments; identify every current/former direct owner
TASK: ledger:0388:firstlight-usa-llc:61bc946d
CANONICAL KEY: firstlight-usa-llc|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER","ADD_PENDING_TRANSACTION","CORRECT_COMPANY"],"rationale":"The July 2026 census treated FirstLight USA as 100%-owned by PSP since 2016 with a signed pending sale to Hull Street Energy, but the canonical ledger has no current production record. A separate FirstLight Fiber record is unrelated telecom infrastructure. Verify the hydro-platform identity, exact sale state/closing and successor ownership before deciding whether to create an active, pending or former-owner record.","productionCompanyIds":[],"seedKeys":[],"sourceHoldingId":"081-psp-investments:holding:007:firstlight-usa-llc","startingEvidence":["https://www.investpsp.com/en/news/psp-investments-announces-sale-of-firstlights-us-portfolio-to-hull-street-energy","https://www.firstlightpower.com/"]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the canonical legal/commercial relationship among FirstLight USA, LLC, FirstLight Power, FirstLight Power Resources, FirstLight Hydro Generating Company, Housatonic/Connecticut River assets, PSP Investments and Hull Street Energy. Explicitly distinguish this hydroelectric/power platform from Antin's unrelated FirstLight Fiber telecom company. Count the manager-level power platform once; do not split individual hydro stations, pumped storage, batteries, operating subsidiaries, project companies or financing issuers.

Verify PSP's acquisition announcement and exact legal closing date, sellers, acquisition vehicle/account, exact stake and any co-investors. Verify the Hull Street sale announcement, assets/entity included, seller/buyer, stake, regulatory conditions and exact legal closing date if it occurred. Search through 2026-08-19 for approval orders, closing announcements, subsequent ownership changes, recapitalizations and signed pending transactions. Keep PSP active only if the sale was still unclosed; if closed, retire PSP at the legal close and add the successor owner. Do not represent an announced buyer as active before closing.

Determine whether the sold U.S. portfolio remained branded FirstLight Power, was renamed, combined with another Hull Street platform or split among buyers. Identify all current/former owners at the same company level and separate corporate equity from project debt, power contracts, regulatory licenses and asset-level joint ventures.

BOUNDARY AND OPERATING PROFILE
Confirm official website, headquarters, formation/founding year, generation/storage technologies, operating footprint, number/capacity of facilities, customer/end markets and two to four material milestones. State the canonical public scorecard name and aliases after any sale/rebrand.

RESEARCH RULES
- Resolve canonical identity, aliases, power-platform/asset/subsidiary boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer FirstLight Power, PSP, Hull Street, FERC/regulatory orders, transaction releases and official financing disclosures. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW if a qualifying distinct company record is still required; PROPOSED_CORRECTION if the task should map to an existing hydro-platform record; PROPOSED_MERGE only if duplicate hydro identities are proven; DEFERRED if legal closing/current ownership remains unresolved. Never merge with FirstLight Fiber. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.investpsp.com/en/news/psp-investments-announces-sale-of-firstlights-us-portfolio-to-hull-street-energy
- https://www.firstlightpower.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
