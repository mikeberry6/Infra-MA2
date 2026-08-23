Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Pike Corporation
REQUESTED MANAGER: TPG; also identify La Caisse and other direct owners only as needed
TASK: ledger:0449:pike-corporation:5a43238f
CANONICAL KEY: pike-corporation|united-states

LEDGER ISSUE TO TEST
The repository publishes Pike Corporation as an active TPG-backed electric, gas and telecommunications infrastructure-services company after a November 2025 transaction. The TPG census classified this repo-only company OUT_OF_SCOPE because it is a services business tied to TPG Rise Climate rather than a qualifying infrastructure strategy. A fuzzy queue link also confused Pike Corporation with ArcLight's unrelated “Pike Holdings”; prior task 81 resolved that ArcLight label to TransMontaigne Partners LLC. Prove the identities are unrelated and decide whether Pike Corporation itself belongs in this infrastructure-manager census.

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
Pike Corporation is recorded as founded in 1945, a provider of engineering, construction, maintenance and storm-response services to electric/gas utilities and telecom customers, with about 12,000 employees and 400+ customers. It records TPG Rise Climate as a current majority owner from 2025, La Caisse as a significant minority partner, management ownership, and a Q4 2025 close. Verify the security, exact owners, vehicle, stake/control, announcement and legal closing dates, and subsequent status.

SCOPE AND IDENTITY QUESTIONS
Determine whether Pike owns qualifying utility infrastructure or principally provides asset-light contracted services to third-party asset owners. Establish the exact TPG strategy/fund/vehicle and whether the mandate is infrastructure, climate private equity, growth or another non-infrastructure strategy. Distinguish Pike Corporation from Pike Holdings/Pike Petroleum Holdings/TLP Finance Holdings/TransMontaigne, Pike County Light & Power, and any Pike operating subsidiaries. Search through 2026-08-19 for later transfers, exits, restructurings and signed pending transactions.

RESEARCH RULES
- Resolve canonical identity, current/former direct owners, funds/vehicles, stakes, announcement/closing/exit dates and transaction states.
- Require evidence tying TPG's position to a qualifying infrastructure mandate; owning an infrastructure-services contractor is not by itself sufficient.
- Prefer Pike, TPG, La Caisse, Lindsay Goldberg, regulatory/filing and transaction-party sources. Open direct pages rather than relying on snippets.
- Return EXCLUDED if Pike is an out-of-scope services company or TPG's only relevant ownership is outside infrastructure; PROPOSED_CORRECTION if a qualifying infrastructure ownership period exists but repository facts are wrong; VERIFIED_NO_CHANGE only if active in-scope ownership is directly supported; PROPOSED_MERGE only if an actual duplicate is proven; or DEFERRED if identity/current ownership remains materially unresolved.
- Treat Pike Holdings/TransMontaigne as an excluded duplicate candidate, not the same company, unless extraordinary direct evidence proves otherwise. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.pike.com/
- https://www.pike.com/About/
- https://www.tpg.com/news-and-insights/pike-corporation-to-accelerate-growth-through-partnership-with-tpg-la-caisse-and-management
- https://shareholders.tpg.com/static-files/f52ae0ce-34e2-428b-83c8-5d450796ea45
- https://arclight.com/investments/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
