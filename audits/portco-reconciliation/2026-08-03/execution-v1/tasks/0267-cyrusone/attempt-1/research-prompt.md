Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: CyrusOne
MANAGERS TO RESOLVE: KKR; Global Infrastructure Partners / BlackRock; identify all direct current and former owners
TASK: ledger:0267:cyrusone:541adafa
CANONICAL KEY: cyrusone|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"The repository correctly has CyrusOne under KKR but omits GIP as co-owner despite the joint 2022 take-private. Verify the complete current ownership roster, funds/vehicles, stakes and any changes resulting from BlackRock's acquisition of GIP before adding the co-owner.","productionCompanyId":"cmrxpjjte013vivhep3ejd8c0","seedKey":"cyrusone|United States","startingEvidence":["https://www.cyrusone.com/","https://www.global-infra.com/news/global-infrastructure-partners-and-kkr-complete-acquisition-of-cyrusone/","https://www.global-infra.com/news/kkr-and-gip-complete-acquisition-of-cyrusone/"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"CyrusOne","country":"United States","status":"Active","sector":"Digital","subsector":"Hyperscale and enterprise data centers","yearFounded":2001,"investmentYear":2022,"headquarters":"United States; Europe; Asia","owners":[{"firm":"KKR","vehicle":"KKR Global Infrastructure Investors V","investmentYear":2022,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"description":"The repository records a global data-center platform with more than 60 operating facilities and over 50 in development. It says KKR and GIP completed a US$15 billion take-private in March 2022 but stores only KKR as an owner.","milestones":[{"date":"2001","event":"CyrusOne was founded.","category":"Founding"},{"date":"Mar 25, 2022","event":"KKR and GIP completed the US$15 billion acquisition of CyrusOne.","category":"Acquisition"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve CyrusOne's exact legal parent and brand, aliases, subsidiaries and data-center/campus boundary. Reconstruct the 2021 announcement and March 2022 take-private: seller/public shareholders, acquisition vehicle(s), KKR and GIP organizations/funds/managed accounts, exact stakes if disclosed, announcement and legal closing dates, and whether debt/co-investors held equity. Identify both current owners even if percentages are not public. Determine whether BlackRock's acquisition of GIP changed only the manager/successor platform or transferred the underlying CyrusOne interest, and record the correct current manager name without creating duplicate BlackRock/GIP owners. Search through the cutoff for recapitalization, minority sale, infrastructure fund continuation/transfer, IPO plan, data-center platform sale, owner exit or signed pending transaction. Verify current global operating/development scale, customers/end markets and headquarters.

RESEARCH RULES
- Resolve canonical identity, aliases, parent/acquisition-vehicle/subsidiary boundary, current/former direct owners and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit date and transaction state. Do not infer equal KKR/GIP stakes.
- Search through 2026-08-19 for sale, transfer, refinancing, recapitalization, fund continuation, IPO, owner exit and signed pending transactions.
- Verify facility/campus count, geographies, power/development scale, customer segments and current operating status.
- Reopen direct pages and filings. Prefer CyrusOne, KKR, GIP/BlackRock, merger/SEC filings, regulatory and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.cyrusone.com/
- https://www.cyrusone.com/company/about
- https://www.kkr.com/invest/portfolio/heres-the-deal/cyrusone
- https://www.global-infra.com/news/kkr-and-gip-complete-acquisition-of-cyrusone/
- https://www.global-infra.com/news/global-infrastructure-partners-and-kkr-complete-acquisition-of-cyrusone/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
