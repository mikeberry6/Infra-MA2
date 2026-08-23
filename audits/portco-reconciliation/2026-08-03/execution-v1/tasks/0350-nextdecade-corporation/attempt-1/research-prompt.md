Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: NextDecade Corporation
REQUESTED MANAGER: Mubadala; distinguish Mubadala’s public-company security from GIP/BlackRock, TotalEnergies and other direct Rio Grande LNG investors
TASK: ledger:0350:nextdecade-corporation:a6b7db27
CANONICAL KEY: nextdecade-corporation|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":[],"rationale":"The repository publishes NextDecade as an active Mubadala PortCo based on a 2019 US$50 million common-stock private placement. The manager census did not retain it and the repo-only judgment classified the exposure as out of scope because it appears to be a public-company security rather than direct manager-level infrastructure ownership. Determine whether to remove Mubadala’s ownership period, exclude the company for this manager, retain it because a qualifying direct infrastructure mandate is proven, or map a different direct Rio Grande LNG interest.","productionCompanyIds":["cmrxpjlpv016tivheo8lwhkzy"],"seedKeys":["nextdecade corporation|United States"],"sourceRepoOnlyId":"070-mubadala:repo-only:006:nextdecade-corporation","startingEvidence":["https://investors.next-decade.com/news-releases/news-release-details/nextdecade-announces-us50-million-investment-mubadala"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
The published company is NextDecade Corporation, U.S. midstream/LNG export development, active, founded 2010, investment year 2019, with one active Mubadala owner and no vehicle/stake. It describes a Nasdaq-listed developer centered on Rio Grande LNG in Brownsville, Texas, plus carbon-capture plans. Existing milestones include the 2017 Nasdaq listing, Mubadala’s October 24, 2019 agreement to buy US$50 million of common stock, GIP’s July 2023 Rio Grande LNG Phase 1 investment, and TotalEnergies’ September 2025 investments. Existing narrative conflates investment in the listed parent with direct project capital. Treat every claim as provisional.

SCOPE AND OWNERSHIP QUESTIONS
Determine exactly what Mubadala bought in 2019: security type, number of shares, purchase price, percentage at signing/closing, voting or governance rights, investing legal entity/vehicle, infrastructure-strategy mandate, lockups or registration rights, and whether the shares were in a then-public Nasdaq company. Verify the legal closing and the January 2020 registration event. Trace all stock sales, dilutions, conversions, subsequent offerings, 13D/13G/13F filings, shareholder disclosures, beneficial-ownership tables and exits through 2026-08-19 to determine whether Mubadala remained a shareholder and, if so, whether that public-security exposure qualifies under the census rules.

The fixed census rules exclude public-market securities and require evidence tying a direct equity investment to the manager’s infrastructure strategy, vehicle, team, managed account or direct infrastructure mandate. A privately negotiated PIPE in a listed company is not automatically in scope. Do not convert Mubadala’s corporate shareholding into direct ownership of Rio Grande LNG unless legal evidence proves a project-company or holdco interest. Conversely, distinguish direct project-level owners such as GIP/BlackRock-managed vehicles, TotalEnergies and any other Rio Grande LNG equity participants; those owners may support the company context but do not make Mubadala a direct project owner.

IDENTITY AND BOUNDARY
Resolve the canonical parent, Rio Grande LNG entities/holdcos, Next Carbon Solutions and individual train/project companies. Decide whether the manager-level PortCo should be the listed parent, a direct project holdco, or excluded for Mubadala. Do not double-count the parent, the liquefaction facility, individual trains, pipeline/interconnections or carbon-capture subsidiary. Verify current project status, train FIDs/financing, capacity with units, offtakers/customers, headquarters, website and North American infrastructure basis only to the extent needed for the list decision.

RESEARCH RULES
- Resolve canonical identity, listed-parent/project/subsidiary boundary, current/former direct owners and exact manager/fund/vehicle attribution.
- Verify every stake, security type, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, dilution, stock disposal, direct project investments, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer NextDecade SEC filings/investor releases, Mubadala, Rio Grande LNG, GIP/BlackRock, TotalEnergies and regulatory/project-finance sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return EXCLUDED if Mubadala’s only exposure is an out-of-scope public-company security or has been realized, PROPOSED_CORRECTION if a qualifying direct ownership period exists but the record is wrong, VERIFIED_NO_CHANGE only if active in-scope ownership is directly supported, PROPOSED_MERGE if a duplicate is proven, or DEFERRED if the instrument/current status remains materially unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://investors.next-decade.com/news-releases/news-release-details/nextdecade-announces-us50-million-investment-mubadala
- https://investors.next-decade.com/news-releases/news-release-details/nextdecade-registers-shares-previously-issued-mubadala
- https://www.sec.gov/edgar/browse/?CIK=1612720&owner=exclude
- https://www.global-infra.com/media/press-releases/2023/07/12/global-infrastructure-partners-announces-investment-in-rio-grande-lng-phase-1/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
