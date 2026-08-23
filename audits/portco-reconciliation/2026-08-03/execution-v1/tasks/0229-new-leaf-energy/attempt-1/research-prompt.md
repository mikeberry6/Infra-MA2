Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: New Leaf Energy
MANAGER TO RESOLVE: Energy Capital Partners (ECP)
TASK: ledger:0229:new-leaf-energy:321d604d
CANONICAL KEY: new-leaf-energy|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_OWNER"],"rationale":"The exact company identity exists in production, but the census ownership holding requires individual review. The repository already records ECP, so determine whether this is an alias-resolved existing owner rather than a true addition.","productionCompanyId":"cmrxpjdmu00ueivhetif6v25s","seedKey":"new leaf energy|United States","startingEvidence":["https://www.ecpgp.com/equity/portfolio","https://www.newleafenergy.com/"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"New Leaf Energy","country":"United States","status":"Active","sector":"Power & ET","subsector":"Solar and energy storage development","investmentYear":2022,"headquarters":"Multi-state United States","description":"The repository says New Leaf launched in July 2022 through ECP's acquisition and spin-off of Borrego's development business, with a large U.S. solar and storage pipeline.","owners":[{"firm":"ECP","vehicle":"NOT_PUBLICLY_DISCLOSED","investmentYear":2022,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"milestones":[{"date":"1980","event":"Borrego Solar traces its roots to 1980.","category":"Other"},{"date":"2022","event":"New Leaf launched as a standalone developer.","category":"Expansion"},{"date":"Jul 28, 2022","event":"Borrego completed the spin-off and sale of its development business to ECP.","category":"Acquisition"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Verify New Leaf Energy's canonical legal/display identity and its boundary versus Borrego, Borrego Energy, O&M affiliates, development subsidiaries and individual solar/storage projects. Reconstruct the 2022 carve-out, spin-off and sale: exact seller/buyer entities, ECP fund/vehicle, stake/control, announcement and legal closing dates, co-investors, retained interests and current ownership. Search through the as-of date for corporate financing, equity syndication, recapitalization, sale, owner transfer, ECP portfolio removal, exit or signed pending transaction. Distinguish the sale of individual development projects from a sale of the New Leaf platform. Resolve whether the census ECP holding is already represented; do not add a duplicate because ECP and Energy Capital Partners are aliases. Verify whether the 1980 Borrego predecessor date belongs on New Leaf's own company history or only as predecessor context.

RESEARCH RULES
- Resolve canonical identity, aliases, predecessors/successors, current/former owners and platform/project boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer percentages or closing from an announcement.
- Search through 2026-08-19 for sale, transfer, recapitalization, refinancing, merger, rebrand, asset disposition, portfolio removal and signed pending transactions.
- Verify official website/status, headquarters, founding/launch year, products/services, customers/end markets, development footprint and disclosed scale.
- Reopen direct pages. Prefer New Leaf, ECP, Borrego, regulatory/filing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://newleafenergy.com/
- https://newleafenergy.com/about/
- https://www.ecpgp.com/equity/portfolio/new-leaf-energy
- https://www.ecpgp.com/about/news-and-insights/press-releases/2022/borrego-completes-spin-off-and-sale-of-solar-and-energy-storage-development-business-to-ecp
- https://www.ecpgp.com/equity/portfolio

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
