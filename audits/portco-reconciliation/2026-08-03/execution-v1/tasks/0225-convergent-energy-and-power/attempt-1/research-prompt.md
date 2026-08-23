Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Convergent Energy and Power
MANAGER TO RESOLVE: Energy Capital Partners (ECP)
TASK: ledger:0225:convergent-energy-and-power:464221aa
CANONICAL KEY: convergent-energy-and-power|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_OWNER"],"rationale":"The exact company identity exists in production, but the census ownership holding requires individual review. The repository already records ECP, so determine whether this is an alias-resolved existing owner rather than a true addition.","productionCompanyId":"cmrxpjdh400u8ivheq80gd7ep","seedKey":"convergent energy and power|United States","startingEvidence":["https://www.convergentep.com/","https://www.ecpgp.com/equity/portfolio"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjdh400u8ivheq80gd7ep","name":"Convergent Energy and Power","country":"United States","countryTags":["United States","Canada"],"status":"Active","sector":"Power & ET","subsector":"Battery storage and distributed energy infrastructure","investmentYear":2019,"headquarters":"United States, Canada, and the United Kingdom","website":null,"description":"The repository says Convergent develops, owns and operates battery storage and distributed-energy projects, and ECP acquired it in 2019.","owners":[{"firm":"ECP","vehicle":"NOT_PUBLICLY_DISCLOSED","investmentYear":2019,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"milestones":[{"date":"2011","event":"Convergent was founded.","category":"Founding"},{"date":"Jul 9, 2019","event":"ECP acquired Convergent.","category":"Acquisition"},{"date":"2024","event":"Convergent reported more than 800 MW and 1 GWh developed or acquired.","category":"Expansion"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Verify Convergent's canonical legal/display identity and its boundary versus Convergent Energy + Power Inc., subsidiaries, project companies and individual storage assets. Reconstruct ECP's 2019 acquisition: exact buyer/manager, fund or vehicle, seller, stake/control, announcement and legal closing dates, co-investors, and current ownership. Search through the as-of date for recapitalizations, equity syndications, refinancing, project sales, company sale, owner transfer, ECP portfolio removal, exit or signed pending transaction. Resolve whether the census ECP holding is already fully represented by the existing ECP owner; do not add a duplicate because ECP and Energy Capital Partners are aliases. Distinguish non-dilutive DOE loans/project financing from company-level equity ownership.

RESEARCH RULES
- Resolve canonical identity, aliases, current/former owners and platform/subsidiary/project boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer percentages or closing from an announcement.
- Search through 2026-08-19 for sale, transfer, recapitalization, refinancing, merger, rebrand, asset disposition, portfolio removal and signed pending transactions.
- Verify official website/status, headquarters, founding year, products/services, customers/end markets, operating footprint and disclosed scale.
- Reopen direct pages. Prefer Convergent, ECP, DOE/regulatory, filing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://convergentep.com/
- https://convergentep.com/our-story/
- https://www.ecpgp.com/about/news-and-insights/press-releases/2019/energy-capital-partners-acquires-convergent-energy-power
- https://www.ecpgp.com/equity/portfolio/convergent
- https://www.energy.gov/edf/articles/doe-announces-5845-million-loan-guarantee-subsidiaries-convergent-energy-and-power-inc

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
