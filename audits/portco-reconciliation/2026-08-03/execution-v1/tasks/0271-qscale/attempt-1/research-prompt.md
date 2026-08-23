Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: QScale
MANAGERS TO RESOLVE: Goldman Sachs Asset Management / Goldman Sachs Alternatives; founders and management; identify all direct current and former owners
TASK: ledger:0271:qscale:f52cb49e
CANONICAL KEY: qscale|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"The census supports QScale as a new Canadian digital-infrastructure PortCo following Goldman Sachs Alternatives' May 2026 control acquisition, but the canonical ledger found no exact production or seed company. Verify identity, legal closing, ownership vehicle, retained founder/management equity and current status before creation.","productionCompanyId":null,"seedKey":null,"startingEvidence":["https://am.gs.com/en-us/advisors/news/press-release/2026/goldman-sachs-alternatives-acquire-qscale","https://www.qscale.com/company/about-us"]}

CURRENT CENSUS AND DEAL SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"QScale","country":"Canada","status":"Active","sector":"Digital","subsector":"AI and high-performance-computing data centers","investmentYear":2026,"headquarters":"Lévis, Québec","owners":[{"firm":"Goldman Sachs Asset Management / Goldman Sachs Alternatives","vehicle":"Infrastructure at Goldman Sachs Alternatives","investmentYear":2026,"stake":"Control investment; founders and management reinvested","isActive":true}],"description":"The census describes a Québec-headquartered developer and operator of AI-ready data-center campuses. A Deal Database row records Goldman Sachs Alternatives as having closed a control acquisition on May 13, 2026, with founders and management reinvesting.","milestones":[{"date":"May 13, 2026","event":"Goldman Sachs Alternatives announced it had closed the control acquisition of QScale.","category":"Acquisition"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve QScale, its exact legal parent, aliases, project/campus companies and operating-subsidiary boundary. Reconstruct Goldman Sachs' acquisition process: announcement versus closing date, sellers, acquisition vehicle, exact control stake if disclosed, retained founders/management interest, co-investors, debt-only participants and governance. Identify the precise Goldman Sachs infrastructure fund, strategy, managed account or vehicle; do not substitute the generic business-unit label when no fund is public. Search through the cutoff for later equity raises, recapitalization, secondary sales, strategic investors, merger, rebrand, owner exit or signed pending transaction. Verify headquarters, founding year, campuses, operational/development capacity, power characteristics, customers/end markets and operating status. Reconcile the census's inconsistent claim that a repository company existed with the canonical ledger's finding that no production/seed match exists.

RESEARCH RULES
- Resolve canonical legal identity, aliases, parent/subsidiary/campus boundary, current/former direct owners and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit date and transaction state. Do not infer a fund name or retained percentage.
- Search through 2026-08-19 for financing, recapitalization, minority investment, sale, transfer, owner exit and signed pending transactions.
- Keep QScale as the manager-level company; do not count individual campuses, buildings or project SPVs as separate PortCos.
- Reopen direct pages and filings. Prefer QScale, Goldman Sachs, seller/shareholder, government/regulatory and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.qscale.com/
- https://www.qscale.com/company/about-us
- https://am.gs.com/en-us/advisors/news/press-release/2026/goldman-sachs-alternatives-acquire-qscale
- https://am.gs.com/en-int/advisors/news/press-release/2026/goldman-sachs-alternatives-acquire-qscale

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
