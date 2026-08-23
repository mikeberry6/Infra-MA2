Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Digital Realty Northern Virginia Hyperscale Data Center JV
REQUESTED MANAGER: TPG / TPG Real Estate; identify Digital Realty as continuing co-owner
TASK: ledger:0445:digital-realty-northern-virginia-hyperscale-data-center-jv:1419ed2f
CANONICAL KEY: digital-realty-northern-virginia-hyperscale-data-center-jv|united-states

LEDGER ISSUE TO TEST
The repository publishes this three-building hyperscale data-center JV as an active TPG/TPG Real Estate PortCo with TPG Real Estate Partners (TREP). The TPG census classifies the repo-only record as OUT_OF_SCOPE because the investment belongs to TPG’s real-estate strategy rather than an infrastructure strategy. Verify the manager/vehicle mandate, legal JV identity, ownership and current status before deciding whether to retire/exclude the TPG ownership. Avoid duplicating TPG and TPG Real Estate as separate owners when they are the same investment organization/vehicle.

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
The record says the JV owns three stabilized Northern Virginia hyperscale data-center buildings totaling roughly 104 MW, with investment-grade hyperscale tenants; TPG Real Estate acquired 80% and Digital Realty retained 20% and day-to-day management in July 2023. It records two active owners—“TPG” and “TPG Real Estate”—both through TREP, which may duplicate one ownership period. Verify every fact, announcement/closing dates and whether any later transfer occurred.

STRATEGY AND OWNERSHIP QUESTIONS
Identify the exact legal JV/holding entities, three-asset perimeter, TPG acquisition vehicle/fund, Digital Realty retained entity, stakes and management/governance. Establish from direct TPG/Digital Realty fund and transaction materials whether TREP is a real-estate fund/strategy, an infrastructure mandate or another product. Under the fixed census rule, even direct ownership of infrastructure-like data centers is excluded when the manager exposure is through a non-infrastructure real-estate strategy. Do not infer infrastructure strategy solely from asset type.

Reconstruct the July 2023 announcement and legal close, value, primary/secondary capital, leases/customers, and any later refinancing, asset expansion, stake transfer, sale, exit or signed pending transaction through 2026-08-19. Determine whether “TPG” and “TPG Real Estate” are duplicate labels for the same 80% interest and whether the company has another qualifying infrastructure-fund owner in the supplied manager universe.

PLATFORM BOUNDARY AND OPERATING PROFILE
Confirm whether the proper manager-level holding is one three-building portfolio/JV, each building, or a broader Digital Realty platform. Keep buildings, leases and operating subsidiaries beneath the JV. Verify location, stabilized status, IT capacity, tenants/end markets, operating responsibility and current status.

RESEARCH RULES
- Resolve canonical identity, current/former owners, funds/vehicles, stakes, announcement/closing/exit dates and transaction states.
- Search both the 2023 investment and subsequent exit/status evidence through 2026-08-19. Open direct pages rather than relying on snippets.
- Prefer TPG/TREP fund materials, Digital Realty SEC/IR filings, JV/financing and transaction-party sources.
- Require direct infrastructure-strategy evidence. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity/current-ownership/mandate uncertainty.
- Return EXCLUDED if TPG’s exposure is solely through a real-estate strategy and no qualifying manager owner exists; PROPOSED_CORRECTION if the company remains in scope but duplicate owners/vehicle/dates need correction; VERIFIED_NO_CHANGE only if both inclusion and owner structure are fully supported; PROPOSED_MERGE if another canonical duplicate is proven; or DEFERRED if mandate or current ownership remains materially unresolved.
- Preserve the historical transaction even if the manager exposure is excluded. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.digitalrealty.com/about/newsroom/press-releases/123162/digital-realty-and-tpg-announce-joint-venture-of-hyperscale-data-centers-in-northern-virginia
- https://www.prnewswire.com/news-releases/digital-realty-and-tpg-announce-joint-venture-of-hyperscale-data-centers-in-northern-virginia-301887667.html
- https://investor.digitalrealty.com/static-files/82ddcb19-b0af-471b-a9ec-15929b5094d8
- https://www.tpg.com/platforms/real-estate

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
