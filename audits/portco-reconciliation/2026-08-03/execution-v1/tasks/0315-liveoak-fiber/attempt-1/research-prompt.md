Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: LiveOak Fiber
MANAGERS TO RESOLVE: InfraRed Capital Partners and MEAG; identify all current/former owners, co-investors and vehicles
TASK: ledger:0315:liveoak-fiber:e69e52a2
CANONICAL KEY: liveoak-fiber|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"Production contains LiveOak Fiber with one active InfraRed period. Census evidence separately identifies MEAG's 2024 co-investment. Verify that MEAG holds qualifying equity rather than debt/LP exposure, determine vehicles and transaction dates, and add the co-owner without duplicating the company.","productionCompanyId":"cmrxpjizj012kivhedxjyog86","seedKey":"liveoak fiber|United States","sourceHoldingIds":["059-infrared-capital-partners:holding:012:liveoak-fiber","066-meag:holding:008:liveoak-fiber"],"startingEvidence":["https://www.ircp.com/news/infrared-capital-partners-expands-us-150m-critical-greenfield-digital-infrastructure/","https://www.ircp.com/news/infrared-partners-with-meag-on-liveoak-fiber-via-co-investment/","https://www.meag.com/en/news/meag-invests-in-liveoak-fiber.html"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"LiveOak Fiber","website":null,"country":"United States","status":"Active","sector":"Digital","subsector":"Fiber-to-the-premises broadband","yearFounded":2022,"headquarters":"Florida; Georgia","investmentYear":2022,"owners":[{"firm":"InfraRed Capital Partners","vehicle":"NOT_PUBLICLY_DISCLOSED","stake":null,"investmentYear":2022,"isActive":true}],"descriptionClaim":"InfraRed committed $150m to establish LiveOak in 2022; MEAG joined in a 2024 co-investment; LiveOak builds and operates last-mile fiber networks in Florida and Georgia."}

IDENTITY, OWNERSHIP AND CO-INVESTMENT QUESTIONS
Resolve LiveOak's exact legal/canonical identity and any holding-company structure. Reconstruct InfraRed's 2022 establishment/investment: announcement and legal close/formation date, exact fund/vehicle, capital type, stake/control and founder/management ownership. Reconstruct MEAG's 2024 transaction: agreement and legal closing date, exact MEAG fund/mandate/vehicle, direct or indirect equity stake, governance and whether InfraRed sold down or both provided new capital. Distinguish the co-investment from LiveOak's $250m J.P. Morgan debt financing and other debt facilities. Search through the cutoff for follow-on capital, geographic expansion, owner changes, exits and signed pending transactions. Verify network footprint, miles/premises/customers, markets served, headquarters and current portfolio status. Count LiveOak once; do not treat local network entities, construction markets or financing SPVs as separate PortCos.

RESEARCH RULES
- Include MEAG only if direct/co-investment equity is established; exclude debt, LP and fund-of-funds exposure.
- Require direct evidence for each owner, vehicle, stake, announcement/closing date and current status. Use NOT_PUBLICLY_DISCLOSED rather than inference.
- Do not infer ownership percentages from capital commitment or debt amounts.
- Search through 2026-08-19 for later owner changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer LiveOak, InfraRed, MEAG, lenders/regulators and transaction releases. Use UNRESOLVED for material identity or current ownership; either blocks application.
- Return PROPOSED_CORRECTION, VERIFIED_NO_CHANGE, EXCLUDED or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.ircp.com/news/infrared-capital-partners-expands-us-150m-critical-greenfield-digital-infrastructure/
- https://www.ircp.com/news/infrared-partners-with-meag-on-liveoak-fiber-via-co-investment/
- https://www.meag.com/en/news/meag-invests-in-liveoak-fiber.html
- https://liveoakfiber.com/liveoak-fiber-secures-250-million-to-expand-southeast-fiber-network/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
