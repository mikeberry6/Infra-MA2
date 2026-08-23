Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Pivot Energy
MANAGER TO RESOLVE: Energy Capital Partners (ECP)
TASK: ledger:0231:pivot-energy:e0f42706
CANONICAL KEY: pivot-energy|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_OWNER"],"rationale":"The exact company identity exists in production, but the census ownership holding requires individual review. The repository already records ECP, so determine whether this is an alias-resolved existing owner rather than a true addition.","productionCompanyId":"cmrxpjdnz00ugivhezk5dzw98","seedKey":"pivot energy|United States","startingEvidence":["https://www.ecpgp.com/equity/portfolio/pivot-energy","https://www.pivotenergy.net/energy-capital-partners"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Pivot Energy","country":"United States","status":"Active","sector":"Power & ET","subsector":"Distributed and community solar and storage","yearFounded":2009,"investmentYear":2021,"headquarters":"Multi-state United States","description":"The repository says Pivot develops, finances, builds, owns and manages U.S. distributed/community solar and storage, and ECP acquired it in June 2021.","owners":[{"firm":"ECP","vehicle":"NOT_PUBLICLY_DISCLOSED","investmentYear":2021,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"milestones":[{"date":"2009","event":"Pivot Energy was founded.","category":"Founding"},{"date":"Jun 1, 2021","event":"ECP completed its acquisition of Pivot Energy.","category":"Acquisition"},{"date":"Aug 2024","event":"Pivot announced a Microsoft development framework.","category":"Expansion"},{"date":"Jan 2026","event":"Pivot reported roughly 4.3 GW completed or under development.","category":"Expansion"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Verify Pivot Energy's canonical legal/display identity and its boundary versus subsidiaries, project SPVs, community-solar portfolios, storage assets and financing vehicles. Reconstruct ECP's 2021 acquisition: exact seller and buyer entities, ECP fund/vehicle, stake/control, announcement and legal closing dates, co-investors and current ownership. Search through the as-of date for corporate equity raises, recapitalizations, project portfolio sales, company sale, owner transfer, ECP portfolio removal, exit or signed pending transaction. Distinguish project purchasers, tax-equity providers, lenders and offtakers such as Microsoft from company-level equity owners. Resolve whether the census ECP holding is already represented; do not add a duplicate because ECP and Energy Capital Partners are aliases.

RESEARCH RULES
- Resolve canonical identity, aliases, current/former owners and platform/subsidiary/project boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer percentages or closing from an announcement.
- Search through 2026-08-19 for sale, transfer, recapitalization, refinancing, merger, rebrand, asset disposition, portfolio removal and signed pending transactions.
- Verify official website/status, headquarters, founding year, products/services, customers/end markets, operating/development footprint and disclosed scale.
- Reopen direct pages. Prefer Pivot, ECP, regulatory/filing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.pivotenergy.net/
- https://www.pivotenergy.net/about-us
- https://www.ecpgp.com/about/news-and-insights/press-releases/2021/ecp-announces-acquisition-of-pivot-energy
- https://www.ecpgp.com/equity/portfolio/pivot-energy
- https://www.pivotenergy.net/energy-capital-partners

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
