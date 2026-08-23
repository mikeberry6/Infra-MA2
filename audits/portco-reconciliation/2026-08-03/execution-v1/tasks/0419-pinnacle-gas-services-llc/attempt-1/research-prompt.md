Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Pinnacle Gas Services LLC
REQUESTED MANAGER: Sixth Street; identify Comstock Resources and every current/former direct owner
TASK: ledger:0419:pinnacle-gas-services-llc:94e9c671
CANONICAL KEY: pinnacle-gas-services-llc|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"No exact normalized production or seed match exists. The census classified Pinnacle Gas Services LLC as a Sixth Street North American infrastructure holding based on a reported $600 million strategic investment. Verify the legal structure, equity classification, closing state, canonical company boundary and whether qualifying ownership remains current.","productionCompanyIds":[],"seedKeys":[],"sourceHoldingId":"088-sixth-street:holding:001:pinnacle-gas-services-llc","startingEvidence":["https://sixthstreet.com/investment_announce/comstock-announces-600-million-strategic-investment-by-sixth-street-in-pinnacle-gas-services/","https://www.sec.gov/Archives/edgar/data/23194/000119312526272060/crk-20260615.htm"]}

IDENTITY, TRANSACTION AND BOUNDARY QUESTIONS
Resolve Pinnacle Gas Services LLC's legal identity, parent/subsidiary chain, relationship to Comstock Resources, aliases, official/operator page and asset perimeter. Establish signing and legal closing dates, Sixth Street fund/vehicle, exact security/investment type, stake/economic interest, governance/control rights, consideration/capital commitment, Comstock retained interest, co-investors and conditions precedent. Determine whether the $600 million is common equity, preferred equity, structured capital, debt or a mixed arrangement and whether it creates qualifying direct infrastructure ownership.

Search through 2026-08-19 for closing confirmations, amendments, additional funding, project additions, refinancings, redemptions, repurchases, ownership transfers, Comstock strategic changes, Sixth Street exits and signed pending transactions. Preserve a signed-but-unclosed deal as pending incoming, not active ownership. Do not infer current ownership from an announcement if conditions remained outstanding.

Separate the manager-level midstream platform from Haynesville upstream producers, gathering lines, processing facilities, offtake contracts, lenders and construction/service providers. Do not treat debt providers, customers, operators or Comstock affiliates as direct owners without evidence. Count project/SPV assets beneath the canonical platform unless a separate manager-level investment is proven.

OPERATING PROFILE
Confirm headquarters, founding/formation date, natural-gas gathering/processing/transportation services, Haynesville footprint, pipeline mileage, capacity, customers/end markets, development and operating status with dated sources. Establish the North American midstream-infrastructure basis and current operator.

RESEARCH RULES
- Resolve canonical identity, aliases, parent/subsidiary/platform/SPV boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, security type, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, redemptions, recapitalizations, exits and signed pending transactions.
- Reopen Sixth Street, Comstock, SEC/regulatory, asset/operator and transaction-party pages. Prefer primary sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity, equity classification or current-ownership uncertainty.
- Return PROPOSED_NEW only if a missing list-ready canonical company and current qualifying equity ownership are proven; PROPOSED_CORRECTION if the identity, owner roster, dates, stake, security/transaction state or boundary differs from the census; VERIFIED_NO_CHANGE only if no list mutation is warranted; EXCLUDED if the exposure is debt-like/non-equity/ineligible; PROPOSED_MERGE if duplicate identities are proven; or DEFERRED if material identity/equity/current ownership remains unresolved. This is a research packet only.

STARTING SOURCES TO REOPEN
- https://sixthstreet.com/investment_announce/comstock-announces-600-million-strategic-investment-by-sixth-street-in-pinnacle-gas-services/
- https://www.sec.gov/Archives/edgar/data/23194/000119312526272060/crk-20260615.htm

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
