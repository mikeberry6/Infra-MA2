Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: SOLCAP (KeyState Renewables JVs)
MANAGERS TO RESOLVE: Generate Capital; KeyState Renewables; identify all formed SOLCAP entities, tax-equity investors and direct project owners
TASK: ledger:0259:solcap-keystate-renewables-jvs:349ca18f
CANONICAL KEY: solcap-keystate-renewables-jvs|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The repository treats SOLCAP as an active Generate/KeyState PortCo, while the accepted manager review classified it as an out-of-scope tax-equity JV financing structure rather than a Generate-owned infrastructure platform. Resolve its legal form, ownership role and project boundary.","productionCompanyId":"cmrxpjg5l00y7ivheolji6z5e","seedKey":"solcap (keystate renewables jvs)|United States","startingEvidence":["https://generatecapital.com/generate-capital-closes-85-million-community-solar-tax-equity-fund/"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"SOLCAP (KeyState Renewables JVs)","country":"United States","status":"Active","sector":"Power & ET","subsector":"Community solar tax equity","investmentYear":2021,"headquarters":"New York; Illinois","owners":[{"firm":"Generate Capital","vehicle":"Joint Venture (Generate & KeyState)","investmentYear":2021,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"description":"The repository describes a joint tax-equity platform financing community-solar projects. It records a 53.5 MWdc 11-project New York portfolio in 2024 and an US$85 million fund covering 38 MWdc in New York and Illinois in 2025, but no legal parent, ownership percentages or distinction between sponsor equity and tax-equity interests.","milestones":[{"date":"2021","event":"Generate and KeyState began the SOLCAP partnership.","category":"Financing"},{"date":"Aug 14, 2024","event":"A SOLCAP tax-equity facility covered 53.5 MWdc across 11 New York projects.","category":"Expansion"},{"date":"Oct 9, 2025","event":"Generate announced an US$85 million SOLCAP tax-equity fund for eight projects totaling 38 MWdc.","category":"Financing"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Identify every legally formed SOLCAP partnership/JV/fund entity and determine whether there is one continuing operating platform or separate tax-equity funds for different project portfolios. Establish Generate's and KeyState's roles: sponsor/member equity, tax-equity investor/manager, lender, arranger, asset manager or project owner. Verify stakes, fund/vehicle names, commitments, closings, project developer/sponsor owners, tax-equity flip structures and whether any interest qualifies as direct infrastructure ownership under the census rules. Distinguish temporary tax-equity ownership in ProjectCos from manager-level portfolio-company ownership and avoid counting individual projects beneath any qualified platform. Search through the as-of date for follow-on funds, project transfers, flip dates, buyouts, exits, refinancing, fund wind-down or signed pending ownership transaction. Decide whether SOLCAP should be excluded as financing/fund exposure, retained as a manager-level jointly owned platform, or represented another way.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, platform/fund/ProjectCo boundary, direct owners and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing/funding date, entry date, exit/flip date and transaction state. Distinguish sponsor equity, tax equity, debt, fund management and asset ownership.
- Search through 2026-08-19 for formation, funding, project acquisition/transfer, tax-equity flip/buyout, sale, refinancing, fund wind-down and signed pending transactions.
- Verify project counts, states, capacity, developers, commercial-operation status and disclosed capital.
- Reopen direct pages and filings. Prefer Generate, KeyState, project developers, tax-credit/regulatory filings and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://generatecapital.com/generate-capital-closes-85-million-community-solar-tax-equity-fund/
- https://generatecapital.com/generate-capital-and-keystate-renewables-solcap-platform-deliver-53-5-mwdc-in-community-solar-across-11-projects-in-new-york-with-latest-joint-tax-equity-facility-close/
- https://www.prnewswire.com/news-releases/generate-capital-closes-85-million-community-solar-tax-equity-fund-with-keystate-expanding-leadership-in-distributed-clean-energy-financing-302579282.html

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
