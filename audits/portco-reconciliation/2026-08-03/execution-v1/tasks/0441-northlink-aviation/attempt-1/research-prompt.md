Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: NorthLink Aviation
REQUESTED MANAGER: Tiger Infrastructure Partners; identify founders/co-owners and airport lessor as needed
TASK: ledger:0441:northlink-aviation:bbe08376
CANONICAL KEY: northlink-aviation|united-states

LEDGER ISSUE TO TEST
The Tiger census identifies NorthLink Aviation as an active U.S. airport-cargo infrastructure platform, while the repository publishes an active record with Tiger Infrastructure Partners Fund III and a 2021 controlling investment. Verify the company identity, ownership/control, fund/vehicle, entry/closing date, lease/concession, development status and any later transfer or exit.

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
The record says NorthLink is developing a 120-acre South Park Campus at Ted Stevens Anchorage International Airport under a 55-year lease, with an initial roughly 100,000-square-foot multi-tenant air-cargo terminal. It says Tiger Fund III announced a controlling investment in November 2021 and records Tiger as the sole active owner with no stake. Verify every claim, distinguish company equity from the airport lease, and establish whether the project is operating, under construction, delayed or cancelled.

IDENTITY, OWNERSHIP AND TRANSACTION QUESTIONS
Resolve NorthLink Aviation LLC and project/lease entities, founders/sellers, airport landlord and any development/operating partners. Reconstruct Tiger’s 2021 transaction: announcement and legal close dates, Fund III/acquisition vehicle, stake/control, governance and co-investors. Search Tiger, NorthLink, Alaska DOT&PF/airport, FAA, financing, permitting and corporate sources through 2026-08-19 for later equity raises, lease amendments, construction financings, ownership transfers, asset sale, sponsor exit and signed pending transactions.

PROJECT STATUS AND OPERATING PROFILE
Confirm lease execution/term, site acreage, planned phases, terminal/warehouse/apron specifications, groundbreaking, construction completion, tenants/customers, cargo throughput/capacity, commercial-service date and current status. Keep individual buildings and phases beneath NorthLink. A development-stage platform can remain in scope if Tiger owns it directly and the concession/project is active; do not describe planned facilities as operating before completion.

RESEARCH RULES
- Resolve canonical identity, current/former owners, funds/vehicles, stakes, announcement/closing/exit dates and transaction states.
- Search both the 2021 investment and subsequent exit/project-status evidence through 2026-08-19. Open direct pages rather than relying on snippets.
- Prefer Tiger, NorthLink, Alaska DOT&PF/airport, FAA, financing/regulatory and transaction-party sources.
- Require direct evidence tying the investment to Tiger’s infrastructure strategy. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity/current-ownership uncertainty.
- Return VERIFIED_NO_CHANGE only if active ownership and project status are supported; PROPOSED_CORRECTION if identity, ownership, status, dates, fund or scale needs correction; EXCLUDED if the project was cancelled, Tiger exited or exposure is not direct infrastructure equity; PROPOSED_MERGE if a duplicate is proven; or DEFERRED if material closing/ownership/project status remains unresolved.
- Keep project phases and buildings beneath one canonical company. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.tigerinfrastructure.com/portfolio/NorthLink-Aviation
- https://www.prnewswire.com/news-releases/tiger-infrastructure-partners-announces-investment-in-northlink-aviation-to-fund-construction-of-air-cargo-terminal-at-the-ted-stevens-anchorage-international-airport-301417223.html
- https://www.northlinkaviation.com/
- https://www.northlinkaviation.com/documents/FG/northlinkaviation/news/615095_Tiger_NorthLink_Press_Release_vFinal.pdf
- https://dot.alaska.gov/anc/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
