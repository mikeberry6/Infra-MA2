Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Next Wave Energy
MANAGER TO RESOLVE: Energy Capital Partners (ECP)
TASK: ledger:0230:next-wave-energy:b4bcb6ea
CANONICAL KEY: next-wave-energy|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The census holding Next Wave Energy has only a heuristic repository candidate, Next Wave Energy Partners, LP. Confirm exact identity and current ownership before mapping or correcting it.","candidateProductionCompany":{"id":"cmrxpjdne00ufivheo8adf9nm","name":"Next Wave Energy Partners, LP","seedKey":"next wave energy partners, lp|United States"},"startingEvidence":["https://www.ecpgp.com/equity/portfolio/next-wave-energy-partners-lp","https://www.nextwaveenergy.com/about-us/our-partners"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjdne00ufivheo8adf9nm","name":"Next Wave Energy Partners, LP","country":"United States","status":"Active","sector":"Midstream","subsector":"Alkylate production, processing, and fuels logistics","yearFounded":2014,"investmentYear":2015,"headquarters":"Texas","website":null,"description":"The repository says Next Wave develops and operates downstream/midstream processing and fuels-logistics assets, principally Project Traveler near the Houston Ship Channel; ECP committed up to $500 million in 2015.","owners":[{"firm":"ECP","vehicle":"NOT_PUBLICLY_DISCLOSED","investmentYear":2015,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"milestones":[{"date":"2014","event":"Next Wave Energy Partners, LP was founded.","category":"Founding"},{"date":"Apr 14, 2015","event":"Next Wave announced up to $500 million from ECP.","category":"Financing"},{"date":"Nov 2019","event":"Project Traveler reached final investment decision.","category":"Financing"},{"date":"Mar 2024","event":"Project Traveler entered commercial operations.","category":"Expansion"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Prove whether census Next Wave Energy and repository Next Wave Energy Partners, LP are the same canonical operating platform; identify the correct legal/display identity, aliases and boundary versus Project Traveler, Pasadena terminal/processing assets, affiliates and project SPVs. Reconstruct ECP's 2015 commitment/investment: exact buyer/fund/vehicle, stake/control, announcement and legal closing dates, co-investors and current ownership. Search through the as-of date for subsequent equity financings, project-level debt, recapitalization, asset sales, company sale, owner transfer, ECP portfolio removal, exit or signed pending transaction. Determine whether the original commitment actually funded/closed and whether ECP remains an equity owner. Do not infer an ECP fund merely from timing, and do not count Project Traveler separately from the manager-level platform.

RESEARCH RULES
- Resolve canonical identity, aliases, current/former owners and platform/subsidiary/project boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer percentages or closing from a commitment announcement.
- Search through 2026-08-19 for sale, transfer, recapitalization, refinancing, merger, rebrand, asset disposition, portfolio removal and signed pending transactions.
- Verify official website/status, headquarters, founding year, products/services, customers/end markets, operating footprint, capacity and disclosed scale.
- Reopen direct pages. Prefer Next Wave, ECP, regulatory/filing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.nextwaveenergy.com/
- https://www.nextwaveenergy.com/about-us
- https://www.nextwaveenergy.com/about-us/our-partners
- https://www.nextwaveenergy.com/news/next-wave-energy-partners-announces-investment-500-million-energy-capital-partners
- https://www.ecpgp.com/equity/portfolio/next-wave-energy-partners-lp

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
