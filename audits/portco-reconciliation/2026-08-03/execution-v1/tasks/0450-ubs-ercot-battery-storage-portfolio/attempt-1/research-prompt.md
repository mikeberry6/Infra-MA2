Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every census claim as unverified.

REQUESTED COMPANY: UBS ERCOT Battery Storage Portfolio
REQUESTED MANAGER: UBS Asset Management
TASK: ledger:0450:ubs-ercot-battery-storage-portfolio:d9b23a03
CANONICAL KEY: ubs-ercot-battery-storage-portfolio|united-states

LEDGER ISSUE TO TEST
The census proposes a new manager-level portfolio for five standalone battery-storage projects in the ERCOT market acquired by UBS Asset Management in 2021. No exact repository company exists. Verify whether this is one continuing UBS-owned operating portfolio, the portfolio's correct canonical identity, exact fund/vehicle, ownership structure, legal close and current status before recommending creation.

IDENTITY, OWNERSHIP AND BOUNDARY
Reconstruct the November 2021 acquisition: seller, buyer legal entity, UBS business/team, fund or separate account, stake/control, announcement date, legal close and asset list. Identify the five project names/SPVs, locations, MW/MWh, operating/development status and commercial model. Count the five projects once under one manager-level portfolio only if UBS manages them as a common ownership platform; otherwise explain the correct canonical boundary. Do not separately count project SPVs beneath an included portfolio.

CURRENT STATUS AND EXIT SEARCH
Search through 2026-08-19 for COD, financing, transfers, refinancing, sale processes, completed exits, signed pending transactions, changes of operator/owner and any consolidation into another named platform. Determine whether UBS still directly owns the assets through an infrastructure or real-assets mandate. Do not infer current ownership from the stale 2021 acquisition announcement alone.

RESEARCH RULES
- Resolve canonical identity, aliases, current/former owners, fund/vehicle, stake, announcement/closing/exit dates and transaction states.
- Require direct evidence for active UBS ownership and its infrastructure-strategy basis. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity/current-ownership uncertainty.
- Prefer UBS, seller/operator, ERCOT, FERC/state filings, project-finance and transaction-party sources. Open direct pages rather than relying on snippets.
- Return PROPOSED_NEW only if a manager-level in-scope portfolio and current UBS ownership are established; PROPOSED_CORRECTION if it maps to an existing record or boundary differs; EXCLUDED if it is debt/LP/public-market exposure or fully realized; PROPOSED_MERGE if a duplicate is proven; VERIFIED_NO_CHANGE only if an exact existing record is found; or DEFERRED if legal identity/current ownership remains materially unresolved.
- This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.ubs.com/global/en/media/display-page-ndp/en-20211109-ubs-am-energy-storage.html
- https://www.power-technology.com/news/ubs-asset-management-energy-storage-texas/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
