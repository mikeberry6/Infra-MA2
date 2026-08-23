Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Restaurant Technologies, Inc.
MANAGER TO RESOLVE: Energy Capital Partners (ECP)
TASK: ledger:0233:restaurant-technologies-inc:d0e001f6
CANONICAL KEY: restaurant-technologies-inc|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_OWNER"],"rationale":"The exact company identity exists in production, but the census ownership holding requires individual review. The repository already records ECP, so determine whether this is an alias-resolved existing owner rather than a true addition.","productionCompanyId":"cmrxpjdp200uiivheb3y5869n","seedKey":"restaurant technologies, inc.|United States","startingEvidence":["https://www.ecpgp.com/equity/portfolio/restaurant-technologies-inc","https://www.rti-inc.com/"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Restaurant Technologies, Inc.","country":"United States","status":"Active","sector":"Social Infra","subsector":"Commercial kitchen oil management and back-of-house services","yearFounded":1999,"investmentYear":2022,"headquarters":"United States","description":"The repository says Restaurant Technologies provides automated cooking-oil management and related services through installed equipment and a U.S. depot network; ECP agreed to acquire it from GSAM in February 2022 and identifies April 2022 as the investment date.","owners":[{"firm":"ECP","vehicle":"NOT_PUBLICLY_DISCLOSED","investmentYear":2022,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"milestones":[{"date":"1999","event":"Restaurant Technologies was founded.","category":"Founding"},{"date":"Feb 28, 2022","event":"ECP announced an agreement to acquire the company from GSAM.","category":"Acquisition"},{"date":"Apr 2022","event":"ECP identifies April 2022 as its investment date.","category":"Acquisition"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Verify the company's canonical legal/display identity, aliases and boundary versus subsidiaries, depot entities, equipment-financing vehicles and customer installations. Reconstruct ECP's 2022 acquisition from Goldman Sachs Asset Management: exact seller and buyer entities, ECP fund/vehicle, stake/control, announcement and legal closing dates, management/founder rollover, co-investors and current ownership. Search through the as-of date for follow-on equity, recapitalization, refinancing, company sale, owner transfer, ECP portfolio removal, exit or signed pending transaction. Distinguish route/equipment financing and lenders from company-level equity ownership. Resolve whether the census ECP holding is already represented; do not add a duplicate because ECP and Energy Capital Partners are aliases. Also test whether the business meets the infrastructure strategy boundary as a route-based installed-equipment services platform rather than ordinary business services.

RESEARCH RULES
- Resolve canonical identity, aliases, current/former owners and company/subsidiary/asset boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer percentages or closing from an announcement.
- Search through 2026-08-19 for sale, transfer, recapitalization, refinancing, merger, rebrand, asset disposition, portfolio removal and signed pending transactions.
- Verify official website/status, headquarters, founding year, products/services, customers/end markets, depot footprint and disclosed scale.
- Reopen direct pages. Prefer Restaurant Technologies, ECP, GSAM, regulatory/filing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.rti-inc.com/
- https://www.rti-inc.com/news-and-media/
- https://www.ecpgp.com/about/news-and-insights/press-releases/2022/ecp-to-acquire-restaurant-technologies-from-goldman-sachs-asset-management-as-sustainability-initiatives-move-to-the-forefront-of-restaurant-management
- https://www.ecpgp.com/equity/portfolio/restaurant-technologies-inc

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
