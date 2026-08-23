Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: IPX Power
REQUESTED MANAGERS: TPG Rise Climate, Climate Adaptive Infrastructure and Greenbelt Capital Partners; identify Google/Alphabet and Intersect only for the carve-out boundary
TASK: ledger:0446:ipx-power:dd940951
CANONICAL KEY: ipx-power|united-states

LEDGER ISSUE TO TEST
The repository publishes IPX Power as an active TPG-backed U.S. utility-scale solar/storage independent power producer launched from Intersect’s grid-tied business in 2026. The TPG census classifies the repo-only record as OUT_OF_SCOPE because TPG Rise Climate is a private-equity/climate strategy without proven infrastructure-strategy linkage. Verify the carve-out, owner vehicles, stakes and mandate before deciding whether to retire/exclude TPG’s ownership or retain the company through another qualifying infrastructure manager.

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
The record says Google/Alphabet completed a $4.75 billion acquisition of Intersect Power in March 2026 while IPX Power launched as an independent company holding the grid-tied portfolio, with 4.4 GW of solar PV and 8.8 GWh of battery storage in California and Texas. It describes majority backing from TPG Rise Climate and additional support from Climate Adaptive Infrastructure and Greenbelt, but records only “TPG” as an active owner with no fund/vehicle/stake. Verify every claim and the exact legal company/asset perimeter.

IDENTITY, CARVE-OUT AND OWNERSHIP QUESTIONS
Resolve IPX Power’s legal/display identity, formation date, relationship to Intersect Power, assets/projects transferred to IPX versus retained/acquired by Google, and any predecessor project entities. Reconstruct the March 2026 closing and simultaneous IPX capitalization: TPG fund/vehicle, CAI and Greenbelt vehicles, stakes, securities, control/governance, primary versus rollover equity, announcement/closing dates and any other owners. Search SEC/HSR/corporate, TPG, IPX, Intersect/Google and co-investor sources through 2026-08-19 for later transfers, financings, project sales, sponsor exits and signed pending transactions.

STRATEGY TEST
Establish whether each manager invested through an infrastructure strategy, direct infrastructure mandate or a non-infrastructure climate/private-equity strategy. TPG Rise Climate alone does not qualify without an explicit infrastructure mandate under the fixed rules. If CAI or Greenbelt is an in-scope infrastructure manager and directly owns IPX, the company may remain active while the TPG ownership period is excluded/retired. Apply the decision at owner-period level.

OPERATING AND PLATFORM BOUNDARY
Confirm headquarters, operating versus development assets, solar MW/storage MWh or GWh, project geography, PPAs/offtakers, current operating status and asset ownership. Keep individual projects beneath IPX unless separately manager-held. Do not treat Intersect assets acquired by Google as IPX assets.

RESEARCH RULES
- Resolve canonical identity, current/former owners, funds/vehicles, securities, stakes, announcement/closing/exit dates and transaction states.
- Search the carve-out and subsequent exit/status evidence through 2026-08-19. Open direct pages rather than relying on snippets.
- Prefer IPX, TPG, CAI, Greenbelt, Intersect/Google, SEC/corporate and transaction-party sources.
- Require manager-specific infrastructure-strategy evidence. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity/current-ownership uncertainty.
- Return EXCLUDED if no qualifying infrastructure-manager ownership exists; PROPOSED_CORRECTION if IPX remains through qualifying owners but TPG/owner/boundary facts need correction; VERIFIED_NO_CHANGE only if the published active ownership is fully supported; PROPOSED_MERGE if a duplicate is proven; or DEFERRED if material carve-out/current ownership remains unresolved.
- Preserve factual carve-out history even if TPG’s owner period is excluded. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.tpg.com/news-and-insights/tpg-announces-completion-of-4-75-billion-sale-of-intersect-to-google-launches-ipx-power-as-independent-power-producer
- https://ipxpower.com/
- https://ipxpower.com/about/
- https://www.prnewswire.com/news-releases/ipx-power-launches-as-independent-power-producer-following-sale-of-intersect-to-google-302711797.html

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
