Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: AEP Indiana Michigan Transmission Company
REQUESTED MANAGER: PSP Investments; identify every current/former direct owner
TASK: ledger:0385:aep-indiana-michigan-transmission-company:45ae9c1c
CANONICAL KEY: aep-indiana-michigan-transmission-company|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"The census treated AEP Indiana Michigan Transmission Company as a current PSP Investments holding entered in 2025 with a 19.9% consortium stake, but no canonical record exists and the only ledger evidence is AEP's general website. Verify the exact legal entity, transaction parties, each investor's economic stake, legal closing and current status before creation.","productionCompanyIds":[],"seedKeys":[],"sourceHoldingId":"081-psp-investments:holding:003:aep-indiana-michigan-transmission-company","startingEvidence":["https://www.aep.com/","https://www.aeptransmission.com/"]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the canonical legal identity and relationship among AEP Indiana Michigan Transmission Company, Inc., Indiana Michigan Power Company, AEP Transmission Company, AEP Transmission Holdco and any transaction holding vehicle. Determine whether the census subject is a distinct regulated transmission operating company or an intermediate legal entity that should be grouped with another manager-level platform. Count it once; do not split substations, lines, projects, regulatory jurisdictions or financing subsidiaries.

Verify the 2025 transaction announcement and exact legal closing date, seller/continuing owner AEP, every consortium buyer, acquisition vehicle/account, exact company-level stake and each investor's look-through interest. Determine whether PSP Investments directly owns part of the 19.9% interest, co-owns the acquisition vehicle with KKR or another manager, or is merely an LP/co-investor. Do not assign the full consortium percentage to PSP. Identify all current and former direct/economic owners at the comparable company level.

Search through 2026-08-19 for later closings, regulatory approvals, stake changes, recapitalizations, new investors, exits and signed pending ownership transactions. Distinguish equity ownership from FERC/state regulation, transmission-service agreements, construction programs and debt financing.

BOUNDARY AND OPERATING PROFILE
Confirm official website, headquarters, formation year, regulated-service territory, transmission-line/substation scale, rate-base or other disclosed scale, customers/end markets and two to four material milestones. Explain the boundary versus the parallel AEP Ohio Transmission Company transaction; do not merge the two regulated subsidiaries merely because the same investor consortium acquired stakes in both.

RESEARCH RULES
- Resolve canonical identity, aliases, parent/subsidiary/regulatory boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer AEP, PSP, consortium counterparties, FERC/state regulatory orders, SEC filings and transaction releases. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW only if a qualifying distinct canonical company should be created; EXCLUDED if PSP lacks qualifying direct/co-investment equity; PROPOSED_MERGE if an existing identity is found; DEFERRED if the legal entity, stake allocation or current ownership remains unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.aep.com/
- https://www.aeptransmission.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
