Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Metrus Energy
MANAGER TO RESOLVE: Energy Capital Partners (ECP)
TASK: ledger:0228:metrus-energy:3f2ae5fa
CANONICAL KEY: metrus-energy|north-america

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_OWNER"],"rationale":"The exact company identity exists in production, but the census ownership holding requires individual review. The repository already records ECP, so determine whether this is an alias-resolved existing owner rather than a true addition.","productionCompanyId":"cmrxpjdmc00udivhejaxw2vbz","seedKey":"metrus energy|North America","startingEvidence":["https://www.ecpgp.com/equity/portfolio","https://www.metrusenergy.com/"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjdmc00udivhejaxw2vbz","name":"Metrus Energy","country":"North America","countryTags":["United States","Canada"],"status":"Active","sector":"Power & ET","subsector":"Energy-as-a-service financing for efficiency and distributed energy","investmentYear":2022,"headquarters":"Multi-state United States","website":null,"description":"The repository says Metrus finances, owns and manages energy-efficiency and distributed-energy infrastructure under long-term service agreements, and ECP acquired it in July 2022.","owners":[{"firm":"ECP","vehicle":"NOT_PUBLICLY_DISCLOSED","investmentYear":2022,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"milestones":[{"date":"2009","event":"Metrus was founded.","category":"Founding"},{"date":"Jul 7, 2022","event":"Metrus announced its acquisition by ECP.","category":"Acquisition"},{"date":"2024","event":"Metrus reported more than 760 project sites across 32 states.","category":"Expansion"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Verify Metrus Energy's canonical legal/display identity, aliases, domicile and boundary versus project companies, special-purpose asset owners, installer partners and individual customer projects. Reconstruct ECP's 2022 acquisition: seller, exact buyer organization/fund/vehicle, stake/control, announcement and legal closing dates, co-investors, and current ownership. Search through the as-of date for follow-on equity, project-level financing, recapitalization, corporate sale, owner transfer, ECP portfolio removal, exit or signed pending transaction. Distinguish project lenders, tax-equity providers and financing counterparties from manager-level equity owners. Resolve whether the census ECP holding is already fully represented; do not add a duplicate because ECP and Energy Capital Partners are aliases. Verify whether the company truly operates in Canada or whether the North America country label should be corrected to the United States.

RESEARCH RULES
- Resolve canonical identity, aliases, current/former owners and platform/SPV/project boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer percentages or closing from an announcement.
- Search through 2026-08-19 for sale, transfer, recapitalization, refinancing, merger, rebrand, asset disposition, portfolio removal and signed pending transactions.
- Verify official website/status, headquarters, founding year, products/services, customers/end markets, operating footprint and disclosed scale.
- Reopen direct pages. Prefer Metrus, ECP, regulatory/government, filing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.metrusenergy.com/
- https://www.metrusenergy.com/resources/blog/metrus-acquisition-by-ecp
- https://www.ecpgp.com/equity/portfolio/metrus-energy
- https://www.ecpgp.com/equity/portfolio
- https://www.metrusenergy.com/impact-reports/2024-impact-report

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
