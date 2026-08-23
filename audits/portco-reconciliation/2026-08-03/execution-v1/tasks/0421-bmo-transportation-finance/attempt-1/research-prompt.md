Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: BMO Transportation Finance
REQUESTED MANAGER: Stonepeak; identify BMO and every current/former direct owner
TASK: ledger:0421:bmo-transportation-finance:551a3f7b
CANONICAL KEY: bmo-transportation-finance|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"No exact normalized production or seed match exists. The census classified BMO Transportation Finance as a Stonepeak North American infrastructure holding based on an announced acquisition. Verify the canonical business identity, legal closing, ownership state and whether an equipment-finance platform qualifies as direct infrastructure equity under this census.","productionCompanyIds":[],"seedKeys":[],"sourceHoldingId":"090-stonepeak:holding:002:bmo-transportation-finance","startingEvidence":["https://stonepeak.com/news/stonepeak-signs-agreement-to-acquire-bmo-transportation-finance","https://www.bmo.com/main/business/transportation-finance/"]}

IDENTITY, TRANSACTION AND OWNERSHIP QUESTIONS
Resolve the legal entity and operating brand sold by BMO, any successor/rebrand after closing, headquarters, official website, business perimeter and relationship to BMO's retained banking/finance operations. Establish signing and legal closing dates, Stonepeak fund/vehicle, stake/control, consideration, seller, co-investors, management rollover, regulatory approvals and transaction state. Search through 2026-08-19 for closing confirmation, rebranding, subsequent owners, recapitalizations, securitizations, sales and signed pending transactions. Preserve signed-but-unclosed ownership as pending incoming.

Determine whether Stonepeak acquired equity in an operating equipment-leasing/fleet-finance company, a loan portfolio, servicing platform, managed account or other financial asset. Distinguish ownership of a financial-services originator/lessor from ownership of transportation infrastructure itself. Include only if the business falls within the defined direct infrastructure-equity mandate; debt receivables, loan portfolios, securitizations and LP/fund exposures are excluded.

BOUNDARY AND OPERATING PROFILE
Confirm products/services, customer/end-market scope, equipment/fleet types, lease/loan receivables, owned versus financed assets, geographic footprint, employee/customer scale and current operating model with dated sources. Separate the canonical company from financed trucks, trailers, vehicles, dealer relationships, borrowers, securitization SPVs and BMO affiliates. Explain the exact infrastructure-strategy basis or why it is out of scope.

RESEARCH RULES
- Resolve canonical identity, aliases, predecessor/successor names, company/portfolio/servicing/SPV boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen Stonepeak, BMO, buyer/seller, regulatory and financing pages. Prefer primary sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity, closing, equity or eligibility uncertainty.
- Return PROPOSED_NEW only if a missing list-ready canonical company and current qualifying infrastructure-equity ownership are proven; PROPOSED_CORRECTION if the appropriate identity, dates, owner, state or boundary differs from the census; EXCLUDED if the acquired business is principally debt/financial services or otherwise outside scope; VERIFIED_NO_CHANGE only if no list mutation is warranted; PROPOSED_MERGE if duplicate identities are proven; or DEFERRED if material identity/closing/eligibility remains unresolved. This is a research packet only.

STARTING SOURCES TO REOPEN
- https://stonepeak.com/news/stonepeak-signs-agreement-to-acquire-bmo-transportation-finance
- https://www.bmo.com/main/business/transportation-finance/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
