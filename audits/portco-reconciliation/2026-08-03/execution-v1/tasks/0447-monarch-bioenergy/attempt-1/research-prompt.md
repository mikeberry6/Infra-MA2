Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Monarch Bioenergy
REQUESTED MANAGERS: TPG Rise Climate, Roeslein Alternative Energy and Smithfield Foods; identify infrastructure-fund owners if any
TASK: ledger:0447:monarch-bioenergy:92b9cb49
CANONICAL KEY: monarch-bioenergy|united-states

LEDGER ISSUE TO TEST
The repository publishes Monarch Bioenergy as an active TPG-backed U.S. RNG platform. The TPG census classifies the repo-only record as OUT_OF_SCOPE because TPG Rise Climate is a climate/private-equity strategy without proven infrastructure-strategy linkage. Verify the JV’s ownership, TPG vehicle/mandate, asset ownership and current status before deciding whether to retire/exclude TPG’s ownership or retain the company through another qualifying infrastructure owner.

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
The record says Monarch was launched in 2018 by Roeslein Alternative Energy and a Smithfield Foods subsidiary, owns/operates farm-based RNG assets in Missouri, had nine operating projects/88 completed lagoons, and admitted TPG Rise Climate as an equal partner in March 2022. It records only TPG as an active owner with no fund/vehicle/stake. Verify every claim, exact equal-partner structure and whether the operating assets belong to Monarch or farm/project affiliates.

OWNERSHIP AND STRATEGY QUESTIONS
Resolve Monarch Bioenergy LLC/JV and project entities, founders/owners, Smithfield subsidiary and Roeslein roles. Reconstruct TPG’s March 2022 investment: TPG fund/vehicle, exact stake/equal-partner meaning, security, primary/secondary capital, announcement and legal close dates, governance and any continuing Roeslein/Smithfield stakes. Establish whether TPG invested through an infrastructure strategy/direct infrastructure mandate or non-infrastructure Rise Climate private equity. Search through 2026-08-19 for follow-on capital, owner transfers, project sales, recapitalizations, exits and signed pending transactions.

ASSET AND OPERATING PROFILE
Confirm headquarters, founding year, operating project count, digesters/lagoons, upgrading/interconnection assets, RNG production/capacity, feedstock/farm relationships, offtakers/end markets, environmental credits and current status. Distinguish assets owned/controlled by Monarch from equipment/services supplied by Roeslein or sites owned by Smithfield/farm affiliates. Keep individual farms/projects beneath the canonical JV unless separately manager-held.

RESEARCH RULES
- Resolve canonical identity, current/former owners, funds/vehicles, securities, stakes, announcement/closing/exit dates and transaction states.
- Search both the 2022 investment and subsequent exit/status evidence through 2026-08-19. Open direct pages rather than relying on snippets.
- Prefer Monarch, TPG, Roeslein, Smithfield, project/regulatory/financing and transaction-party sources.
- Require manager-specific infrastructure-strategy evidence. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity/current-ownership uncertainty.
- Return EXCLUDED if no qualifying infrastructure-manager ownership exists; PROPOSED_CORRECTION if Monarch remains through qualifying owners but TPG/owner/asset facts need correction; VERIFIED_NO_CHANGE only if the published active ownership is fully supported; PROPOSED_MERGE if a duplicate is proven; or DEFERRED if material current ownership/asset ownership remains unresolved.
- Preserve factual investment and operating history even if TPG’s owner period is excluded. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://monarchbio.com/
- https://monarchbio.com/our-origins
- https://monarchbio.com/projects
- https://monarchbio.com/press-releases-articles-whitepapers/tpg-rise-climate-accelerates-renewable-energy-development-with-investment-in-monarch-bioenergy-joint-venture
- https://www.tpg.com/platforms/impact/rise-climate

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
