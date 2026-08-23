Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: 407 International Inc.
REQUESTED MANAGER: PSP Investments; identify every current/former direct owner
TASK: ledger:0384:407-international-inc:e9ed737e
CANONICAL KEY: 407-international-inc|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"The census treated 407 International Inc. as a current PSP Investments toll-road holding entered in 2025, but no canonical production or seed record exists and the starting evidence was only PSP's general website. Verify the exact 2025 transaction, current multi-owner cap table, concession-company boundary and continued status before creation.","productionCompanyIds":[],"seedKeys":[],"sourceHoldingId":"081-psp-investments:holding:001:407-international-inc","startingEvidence":["https://www.investpsp.com/en/","https://www.407etr.com/"]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the canonical relationship among 407 International Inc., 407 ETR Concession Company Limited, Highway 407 ETR, concession holding companies and operating/service entities. Count the manager-level concession business once; do not split roadway segments, toll systems, financing issuers, maintenance contractors or subsidiary companies unless public evidence proves a separate sponsor-level platform.

Rebuild the ownership history sufficiently to establish the current cap table. Verify PSP Investments' transaction announcement and exact legal closing date in 2025, seller, acquisition vehicle/account, exact stake and whether PSP acquired direct equity in 407 International, its concession subsidiary or an intermediate holding company. Identify every current direct/economic owner and exact comparable stake, including CPP Investments, Ferrovial/Cintra, AtkinsRéalis/SNC-Lavalin or successors where applicable. Preserve former owners and entry/exit dates when directly supportable.

Search through 2026-08-19 for later stake sales, options, recapitalizations, restructurings, new investors and signed pending ownership transactions. Distinguish company equity from concession rights, project debt, refinancing, operating contracts and Ontario government arrangements. Do not infer stake totals across different entity levels.

BOUNDARY AND OPERATING PROFILE
Confirm official website, headquarters, company/concession formation dates, concession term/expiry, route length, customer/end-market role, toll-system scale and two to four material milestones. Establish the correct company name for a public scorecard and record 407 ETR as a brand/operator alias if appropriate.

RESEARCH RULES
- Resolve canonical identity, aliases, concession/holding-company/operator boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer 407 ETR/407 International, PSP, CPP Investments, Ferrovial/Cintra, AtkinsRéalis, Ontario sources, securities filings and transaction-party releases. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW only if a qualifying distinct canonical company should be created; PROPOSED_MERGE if an existing 407 identity is found; EXCLUDED if PSP lacks qualifying direct equity; DEFERRED if the company boundary or current cap table remains unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.investpsp.com/en/
- https://www.407etr.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
