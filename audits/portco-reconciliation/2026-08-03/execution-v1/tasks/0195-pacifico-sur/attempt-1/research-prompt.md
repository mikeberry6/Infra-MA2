Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Pacifico Sur
MANAGERS TO RESOLVE: CPP Investments; Ontario Teachers' Pension Plan
TASK: ledger:0195:pacifico-sur:c39347ba
CANONICAL KEY: pacifico-sur|mexico

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"The CPP Investments census holding maps to Pacifico Sur, while the accepted Ontario Teachers' repo-only judgment says the toll-road asset is part of the IDEAL platform and should not be separately counted under platform-level deduplication. Identify the correct manager-level boundary; do not infer a merger merely from the repo judgment.","censusRows":[{"manager":"CPP Investments","holdingId":"032-cpp-investments:holding:010:pacifico-sur"}],"repoOnlyRows":[{"manager":"Ontario Teachers Pension Plan","disposition":"MATCHED_ELSEWHERE","rationale":"Toll road asset is part of IDEAL platform and excluded under platform-level deduplication."}],"repoRows":[{"productionCompanyId":"cmrxpjckc00ssivhet8xg6gs5","seedKey":"pacifico sur|Mexico","sourcePresence":"BOTH"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjckc00ssivhet8xg6gs5","name":"Pacifico Sur","country":"Mexico","status":"Active","sector":"Transportation","subsector":"Toll road","investmentYear":2018,"headquarters":"Guerrero; Morelos; State of Mexico","description":"The repository counts Pacifico Sur separately as a 309-kilometer Mexican toll-road concession. It attributes the 2018 consortium stakes as 51% IDEAL, 29% CPP Investments and 20% Ontario Teachers', while the repo-only judgment proposes consolidation beneath IDEAL.","owners":[{"firm":"CPP Investments","vehicle":"Real Assets (Infrastructure)","investmentYear":2018,"stake":"29%","isActive":true},{"firm":"Ontario Teachers' Pension Plan","vehicle":"n.a.","investmentYear":2018,"stake":"20%","isActive":true}],"milestones":[{"date":"Oct 2, 2018","event":"IDEAL, CPP Investments and Ontario Teachers' announced the Pacifico Sur transaction.","category":"Acquisition"},{"date":"2018","event":"The announcement disclosed 51% IDEAL, 29% CPP Investments and 20% Ontario Teachers' interests.","category":"Financing"},{"date":"2020","event":"Ontario Teachers' included Pacifico Sur within its Mexican infrastructure partnership.","category":"Expansion"}],"sources":[{"url":"https://www.cppinvestments.com/newsroom/ideal-cppib-and-ontario-teachers-expand-mexican-infrastructure-partnership-pacifico-sur-toll-road/"},{"url":"https://www.otpp.com/en-ca/about-us/news-and-insights/2018/ideal-cppib-and-ontario-teachers-expand-mexican-infrastructure-partnership-with-pacifico-sur-toll-road/"}]}

TRANSACTION AND OWNERSHIP QUESTIONS
Determine whether Pacifico Sur is a separately held direct infrastructure concession suitable as a manager-level PortCo, or only an underlying asset that should be represented through IDEAL/IDEAL Group. Resolve the legal concession/company identity, 2018 transaction mechanics, exact ownership percentages, announcement versus legal closing date, owner vehicles and current ownership. Search for subsequent stake sales, IDEAL privatization/restructuring, concession transfer or extension, refinancing, termination, or signed pending transaction through the as-of date. Keep Pacifico Sur distinct from Arco Norte unless evidence establishes a single legal investee platform rather than merely a shared consortium.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, current/former owners and platform/concession/SPV boundaries.
- Test whether Pacifico Sur should remain a separate canonical company or consolidate beneath IDEAL, without conflating it with Arco Norte.
- Verify every direct owner, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer that announcement equals closing.
- Search through 2026-08-19 for acquisition close, sale, transfer, refinancing, concession change, restructuring, cancellation and signed pending transactions.
- Verify geography, concession length/term, operating roads/bypasses, customers/revenue model and current status.
- Reopen direct pages. Prefer CPP Investments, Ontario Teachers', IDEAL, concession-company, Mexican government/regulator and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.cppinvestments.com/newsroom/ideal-cppib-and-ontario-teachers-expand-mexican-infrastructure-partnership-pacifico-sur-toll-road/
- https://www.otpp.com/en-ca/about-us/news-and-insights/2018/ideal-cppib-and-ontario-teachers-expand-mexican-infrastructure-partnership-with-pacifico-sur-toll-road/
- https://www.globenewswire.com/news-release/2018/10/02/1600447/0/en/IDEAL-CPPIB-and-Ontario-Teachers-Expand-Mexican-Infrastructure-Partnership-with-Pacifico-Sur-Toll-Road.html

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
