Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Divert, Inc.
MANAGERS TO RESOLVE: Ara Partners; GIC; Ontario Power Generation Pension Fund; identify all direct current and former owners and later investors
TASK: ledger:0263:divert-inc:e7a24939
CANONICAL KEY: divert-inc|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The repository lists GIC as an active infrastructure co-investor based on a 2021 US$100 million round with Ara Partners and Ontario Power Generation Pension Fund. The accepted review questioned whether GIC's position belongs to an infrastructure strategy rather than growth/technology exposure. Resolve direct ownership, manager-strategy attribution and current continuity without discarding valid Ara Partners infrastructure ownership.","productionCompanyId":"cmrxpjg9f00yeivhenhq6ifso","seedKey":"divert, inc.|United States","startingEvidence":["https://www.prnewswire.com/news-releases/divert-inc-secures-100-million-investment-from-ara-partners-gic-and-ontario-power-generation-pension-fund-to-accelerate-deployment-of-diverts-patented-technologies-301305306.html"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Divert, Inc.","country":"United States","status":"Active","sector":"Power & ET","subsector":"Food waste recycling and renewable natural gas","yearFounded":2007,"investmentYear":2021,"headquarters":"Massachusetts; multi-state U.S.","owners":[{"firm":"GIC","vehicle":"GIC Infrastructure (Co-Investor)","investmentYear":2021,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"description":"The repository records a U.S. food-waste processing and circularity platform with logistics, processing facilities and renewable-natural-gas production. It says Ara Partners, GIC and OPG Pension Fund invested US$100 million in 2021, but stores only GIC as owner and does not establish GIC's strategy/vehicle, individual stakes or later ownership changes.","milestones":[{"date":"2007","event":"Divert was founded.","category":"Founding"},{"date":"Jun 22, 2021","event":"Divert announced a US$100 million investment from Ara Partners, GIC and OPG Pension Fund.","category":"Financing"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve Divert's exact legal parent, aliases, subsidiaries/facilities and manager-level boundary. Reconstruct all equity rounds and ownership from formation through the 2021 US$100 million investment and every later strategic investment, financing, recapitalization or transaction. Verify Ara Partners, GIC and OPG Pension Fund stakes, fund/vehicle, direct versus LP/co-invest status, announcement and legal closing/funding dates, board/control rights and current continuity. Establish whether GIC invested through an infrastructure mandate or an out-of-scope growth/technology strategy; do not infer strategy from GIC's name alone. Identify all current qualifying infrastructure-manager owners even if GIC is excluded. Search through the cutoff for sale, transfer, investor exit, new controlling investment, merger, financing-to-equity conversion or signed pending transaction. Distinguish corporate equity from debt/project financing, equipment/offtake/customer partnerships and facility-level ownership.

RESEARCH RULES
- Resolve canonical identity, aliases, parent/subsidiary/facility boundary, current/former direct owners and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing/funding date, entry date, exit date and transaction state. Distinguish infrastructure equity, growth/technology equity, LP exposure, debt and strategic/customer relationships.
- Search through 2026-08-19 for sale, transfer, refinancing, recapitalization, new equity round, owner exit and signed pending transactions.
- Verify facility/network scale, customers/end markets, food-waste volumes, RNG assets and current operations.
- Reopen direct pages and filings. Prefer Divert, Ara Partners, GIC, OPG Pension Fund, regulatory/transaction filings and official company sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.prnewswire.com/news-releases/divert-inc-secures-100-million-investment-from-ara-partners-gic-and-ontario-power-generation-pension-fund-to-accelerate-deployment-of-diverts-patented-technologies-301305306.html
- https://divertinc.com/
- https://divertinc.com/divert-inc-announces-significant-business-momentum/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
