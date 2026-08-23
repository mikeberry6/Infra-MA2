Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Anza Renewables
MANAGER TO RESOLVE: Energy Capital Partners (ECP)
TASK: ledger:0222:anza-renewables:03b962a6
CANONICAL KEY: anza-renewables|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The census holding Anza Renewables has only a heuristic repository candidate, Anza Renewables, LLC, recorded as North America. Confirm exact identity and geography before mapping or correcting it.","candidateProductionCompany":{"id":"cmrxpjdf000u4ivhe82f2fkli","name":"Anza Renewables, LLC","seedKey":"anza renewables, llc|North America"},"startingEvidence":["https://www.anzarenewables.com/","https://www.ecpgp.com/equity/portfolio"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjdf000u4ivhe82f2fkli","name":"Anza Renewables, LLC","country":"North America","countryTags":["United States","Canada"],"status":"Active","sector":"Power & ET","subsector":"Solar and storage procurement platform","investmentYear":2023,"headquarters":"United States","website":null,"description":"The repository describes a software-enabled solar and storage equipment procurement marketplace separated from Borrego in 2023 with investment from an ECP-led consortium including Angeleno Group.","owners":[{"firm":"ECP","vehicle":"ECP-led consortium investment","investmentYear":2023,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"milestones":[{"date":"Sep 2022","event":"Anza was formally launched.","category":"Expansion"},{"date":"May 17, 2023","event":"Anza completed its separation from Borrego and received ECP-led investment.","category":"Financing"},{"date":"Feb 2026","event":"Anza reported procurement activity and purchase-order scale.","category":"Other"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Prove whether census Anza Renewables and repository Anza Renewables, LLC are the same canonical operating company, and determine the correct legal/display name, aliases, domicile, headquarters and North American coverage. Distinguish Anza from Borrego, Borrego Energy, affiliates, software products, procurement programs and customer projects. Reconstruct the 2023 separation/investment: ECP organization, exact fund/vehicle if publicly disclosed, all direct co-investors, stake/control, announcement and legal closing date, and current ownership. Search through the as-of date for follow-on financing, recapitalization, merger, rebrand, sale, owner transfer, portfolio removal or signed pending exit. Do not infer ECP Fund V merely from timing; keep the vehicle not publicly disclosed unless a direct source identifies it.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, current/former owners and platform/product/project boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer percentages or closing from an announcement.
- Search through 2026-08-19 for sale, transfer, recapitalization, refinancing, merger, rebrand, asset disposition, portfolio removal and signed pending transactions.
- Verify official website/status, headquarters, founding/launch year, products/services, customers/end markets, geographic footprint and disclosed scale.
- Reopen direct pages. Prefer Anza, ECP, Borrego, Angeleno Group, regulatory/filing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.anzarenewables.com/
- https://www.anzarenewables.com/about-us/
- https://www.anzarenewables.com/press-release/anza-completes-separation-from-borrego-and-receives-new-investment-from-energy-capital-partners-led-consortium-to-transform-solar-and-storage-procurement/
- https://www.ecpgp.com/equity/portfolio

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
