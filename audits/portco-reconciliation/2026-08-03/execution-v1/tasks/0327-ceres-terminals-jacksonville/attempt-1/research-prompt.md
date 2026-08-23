Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census, and Deal Database claim as unverified.

REQUESTED COMPANY: Ceres Terminals Jacksonville
MANAGERS TO RESOLVE: Macquarie Asset Management; Carrix; SSA Marine; Ceres Terminals; identify the actual current/former direct owner and operator of the Jacksonville concession/business
TASK: ledger:0327:ceres-terminals-jacksonville:001d4d4e
CANONICAL KEY: ceres-terminals-jacksonville|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["RETIRE_OWNERSHIP"],"rationale":"The Macquarie repo-only review concluded that this Jacksonville record was part of the broader Ceres Terminals platform sold to Carrix in 2023, so Macquarie should not remain active. The seed already marks the company and Macquarie period realized but may conflate the sold Ceres platform, a local operating concession, and the TraPac Jacksonville terminal. Independently resolve the correct canonical boundary and current owner.","productionCompanyId":"cmrxpjk3t014aivhevebx57qf","seedKey":"ceres terminals jacksonville|United States","sourceRepoOnlyId":"065-macquarie-asset-management:repo-only:002:ceres-terminals-jacksonville","startingEvidence":["https://www.macquarie.com/us/en/about/news/2023/macquarie-infrastructure-partners-iii-completes-sales-of-ceres-terminals.html","https://www.jaxport.com/ceres-terminals-and-jaxport-announce-long-term-60-million-investment-in-trapac-jacksonville-container-terminal/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Ceres Terminals Jacksonville","country":"United States","status":"Realized","sector":"Transportation","subsector":"Marine container terminal","website":null,"yearFounded":null,"investmentYear":2015,"headquarters":"Florida","owners":[{"firm":"Macquarie Asset Management","vehicle":"Macquarie Infrastructure Partners III","stake":"49% at 2015 entry; 100% from 2019","investmentYear":2015,"exitYear":2023,"isActive":false}],"description":"The seed describes a JAXPORT terminal operation and concession associated with Ceres, including a 2022 20-year lease and modernization program for the TraPac Jacksonville terminal. Macquarie sold the broader Ceres Terminals platform to Carrix in 2023; post-sale Jacksonville ownership is not recorded.","milestones":[{"date":"2015","event":"MIP III acquired an initial 49% interest in Ceres Terminals.","category":"Acquisition"},{"date":"2019","event":"MIP III acquired 100% of Ceres Terminals.","category":"Acquisition"},{"date":"Feb 14, 2022","event":"JAXPORT approved a 20-year agreement with Ceres for the lease and modernization of the TraPac Jacksonville terminal.","category":"Expansion"},{"date":"Jun 28, 2023","event":"Macquarie announced an agreement to divest Ceres Terminals to Carrix.","category":"Divestiture"},{"date":"Oct 12, 2023","event":"Macquarie announced completion of the Ceres sale.","category":"Divestiture"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the exact identity and boundary of “Ceres Terminals Jacksonville,” Ceres Terminals Holdings LLC, Ceres Marine Terminals, the JAXPORT lease/operator business, TraPac Jacksonville, TraPac LLC, SSA Marine, and Carrix. Determine whether a separately ownable Jacksonville operating company or concession existed, whether it transferred with Ceres in 2023, whether the Ceres brand was integrated/rebranded after Carrix's acquisition, who currently holds and operates the lease/concession, and whether TraPac Jacksonville is the same business, an underlying facility, a landlord/tenant relationship, or a separate operator. Verify Macquarie's 2015 entry, 2019 ownership increase, 2023 announcement and legal close; exact stakes and vehicles; every subsequent owner; and any later sale, assignment, concession change, lease termination, pending exit, or ownership transfer through the cutoff. Verify active operating status, location, services, customers/end markets, official site, and infrastructure qualification.

COUNTING DECISION REQUIRED
State whether the existing Jacksonville record should remain as a realized Macquarie company with a current Carrix/SSA/Ceres successor owner, merge into a broader Ceres Terminals or Carrix/SSA platform, merge or map to TraPac LLC, be excluded as an underlying terminal/concession, or receive a narrower correction. Do not add Carrix or SSA as a direct owner unless sources show the legal ownership chain for the relevant company/lease. Do not count the same Jacksonville terminal under both Ceres and TraPac.

RESEARCH RULES
- Resolve canonical identity, aliases, platform/operator/concession/terminal boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit date, and transaction state. Distinguish ownership of Ceres from operation of the Jacksonville facility.
- Search through 2026-08-19 for subsequent ownership transfers, concession changes, recapitalizations, exits, and signed pending transactions.
- Reopen direct pages and filings. Prefer Macquarie, Carrix/SSA Marine/Ceres, JAXPORT, regulatory/port records, and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE, or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.macquarie.com/au/en/about/news/2023/macquarie-infrastructure-partners-iii-announces-agreement-to-divest-ceres-terminals.html
- https://www.macquarie.com/us/en/about/news/2023/macquarie-infrastructure-partners-iii-completes-sales-of-ceres-terminals.html
- https://www.jaxport.com/ceres-terminals-and-jaxport-announce-long-term-60-million-investment-in-trapac-jacksonville-container-terminal/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
