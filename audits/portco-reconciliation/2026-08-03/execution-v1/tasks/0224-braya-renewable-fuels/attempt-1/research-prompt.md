Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Braya Renewable Fuels
MANAGER TO RESOLVE: Energy Capital Partners (ECP)
TASK: ledger:0224:braya-renewable-fuels:f18c1937
CANONICAL KEY: braya-renewable-fuels|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_OWNER"],"rationale":"The exact company identity exists in production, but the census ownership holding requires individual review. The repository already records ECP, so first determine whether this is an alias-resolved existing owner rather than a true addition.","productionCompanyId":"cmrxpjdgl00u7ivhe3uwhdzke","seedKey":"braya renewable fuels|Canada","startingEvidence":["https://www.brayarenewablefuels.com/","https://www.ecpgp.com/equity/portfolio"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjdgl00u7ivhe3uwhdzke","name":"Braya Renewable Fuels","country":"Canada","status":"Active","sector":"Power & ET","subsector":"Renewable diesel and low-carbon fuels refining","investmentYear":2023,"headquarters":"Newfoundland and Labrador","website":null,"description":"The repository says Braya owns and operates the converted Come By Chance refinery; ECP invested $300 million preferred equity in 2023, and a 2025 government source identified Cresta Fund Management, North Atlantic Refining Corp. managed by Silverpeak, and ECP in the ownership group.","owners":[{"firm":"ECP","vehicle":"NOT_PUBLICLY_DISCLOSED","investmentYear":2023,"stake":"$300 million preferred equity; percentage not publicly disclosed","isActive":true}],"milestones":[{"date":"2021","event":"Come By Chance changed ownership and began renewable-fuels repositioning.","category":"Acquisition"},{"date":"Apr 20, 2023","event":"ECP announced a $300 million preferred-equity investment.","category":"Financing"},{"date":"Feb 2024","event":"Braya commenced commercial operations.","category":"Expansion"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Verify Braya's canonical legal/display identity and its boundary versus Braya Renewable Fuels (Newfoundland) GP Inc., North Atlantic, the refinery, terminals and other affiliates/assets. Reconstruct ownership from the 2021 acquisition through ECP's 2023 preferred-equity investment: all current/former direct equity owners, exact organizations/funds/vehicles, economic or voting stakes if disclosed, announcement and legal closing dates, and whether ECP's investment is direct infrastructure equity rather than debt-only exposure. Search through the as-of date for conversions/redemptions of preferred equity, recapitalizations, government support, insolvency, asset sales, refinery sale, ownership transfers, portfolio removals, exits or signed pending transactions. Resolve whether the census ECP holding is already represented by the existing ECP period; do not create a duplicate owner merely because ECP and Energy Capital Partners are aliases. Determine whether Cresta, Silverpeak-managed entities or others are current owners that require separate periods.

RESEARCH RULES
- Resolve canonical identity, aliases, current/former owners and company/refinery/subsidiary boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer percentages or closing from an announcement.
- Search through 2026-08-19 for sale, transfer, recapitalization, refinancing, redemption, insolvency, merger, rebrand, asset disposition, portfolio removal and signed pending transactions.
- Verify official website/status, headquarters, products/services, customers/end markets, operating footprint and disclosed scale.
- Reopen direct pages. Prefer Braya, ECP, government/regulatory, filing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://brayafuels.com/
- https://www.ecpgp.com/about/news-and-insights/press-releases/2023/braya-renewable-fuels-receives-a-300-million-investment-from-energy-capital-partners
- https://brayafuels.com/wp-content/uploads/2024/02/Braya-Renewable-Fuels-Commercial-Operations-Release-FINAL-2-22-2024.pdf
- https://www.gov.nl.ca/releases/2025/exec/0911n07/
- https://www.ecpgp.com/equity/portfolio

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
