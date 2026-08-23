Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Arco Norte
MANAGERS TO RESOLVE: CPP Investments; Ontario Teachers' Pension Plan
TASK: ledger:0190:arco-norte:b9067e32
CANONICAL KEY: arco-norte|mexico

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"The CPP Investments census holding maps to Arco Norte, while the accepted Ontario Teachers' repo-only judgment says the underlying concession is captured within the IDEAL Group platform investment and should not be separately counted. The repository also contains a likely duplicate named Autopista Arco Norte, S.A. de C.V. Identify the correct canonical keep record and manager-level boundary; do not infer a merge merely from the repo judgment.","censusRows":[{"manager":"CPP Investments","holdingId":"032-cpp-investments:holding:004:arco-norte"}],"repoOnlyRows":[{"manager":"Ontario Teachers Pension Plan","disposition":"MATCHED_ELSEWHERE","rationale":"Underlying concession is captured within IDEAL Group platform investment and should not be separately counted."}],"repoRows":[{"productionCompanyId":"cmrxpjmb4017tivhe2f61twxg","seedKey":"arco norte|Mexico","sourcePresence":"BOTH"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Arco Norte","country":"Mexico","status":"Active","sector":"Transportation","subsector":"Toll road concession","investmentYear":2016,"headquarters":"State of Mexico, Hidalgo, Tlaxcala, and Puebla","description":"The repository counts the 224-kilometer central-Mexico toll-road concession separately and says IDEAL, CPP Investments and Ontario Teachers' have owned it together since 2016. It also contains a second published record, Autopista Arco Norte, S.A. de C.V., with overlapping operations and ownership.","owners":[{"firm":"Ontario Teachers' Pension Plan","vehicle":"n.a.","investmentYear":2016,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true},{"firm":"CPP Investments","vehicle":"Real Assets (Infrastructure)","investmentYear":2016,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"milestones":[{"date":"Jul 2009","event":"First phase opened.","category":"Expansion"},{"date":"2011","event":"Second phase to Atlacomulco opened.","category":"Expansion"},{"date":"Jun 9, 2016","event":"IDEAL, CPP Investments and Ontario Teachers' announced/acquired interests through their partnership.","category":"Acquisition"},{"date":"Oct 2, 2018","event":"The consortium expanded its toll-road partnership through Pacifico Sur.","category":"Expansion"}],"sources":[{"url":"https://www.cppinvestments.com/newsroom/project-summit/"},{"url":"https://www.cppinvestments.com/newsroom/cppib-invests-mexican-infrastructure/"},{"url":"https://www.otpp.com/en-ca/about-us/news-and-insights/2016/impulsora-del-desarrollo-y-el-empleo-en-america-latina-s-a-b-de-c-v-cppib-and-ontario-teachers-pension-plan-create-strategic-partnership-to-invest-in/"},{"url":"https://www.arconorte.com.mx/en/about-us/"}]}

TRANSACTION AND OWNERSHIP QUESTIONS
Resolve whether Arco Norte and Autopista Arco Norte, S.A. de C.V. are the same canonical concession/company and which name should survive. Determine whether the concession is a separately held manager-level direct infrastructure investment or merely an underlying asset that should be represented only through IDEAL/IDEAL Group. Verify the 2016 partnership mechanics, legal owners, vehicles, exact stakes, announcement versus closing dates and current ownership. Search for later stake sales, IDEAL privatization/restructuring, concession extension, refinancing, transfer, termination or signed pending transactions through the as-of date. Treat Pacifico Sur as a separate concession unless evidence establishes a single investee platform.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, duplicate records, current/former owners and platform/concession/SPV boundaries.
- Test both possible consolidations: merge the duplicate Arco Norte records, and separately determine whether Arco Norte itself belongs under IDEAL Group.
- Verify every direct owner, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer a vehicle, stake or closing.
- Search through 2026-08-19 for acquisition close, sale, transfer, refinancing, concession change, restructuring, cancellation and signed pending transactions.
- Verify geography, concession length/term, operations, customers/revenue model and current status.
- Reopen direct pages. Prefer CPP Investments, Ontario Teachers', IDEAL, Arco Norte, Mexican government/regulator and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.cppinvestments.com/newsroom/project-summit/
- https://www.cppinvestments.com/newsroom/cppib-invests-mexican-infrastructure/
- https://www.otpp.com/en-ca/about-us/news-and-insights/2016/impulsora-del-desarrollo-y-el-empleo-en-america-latina-s-a-b-de-c-v-cppib-and-ontario-teachers-pension-plan-create-strategic-partnership-to-invest-in/
- https://www.arconorte.com.mx/en/about-us/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
