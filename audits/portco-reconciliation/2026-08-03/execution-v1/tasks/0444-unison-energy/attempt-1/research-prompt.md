Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Unison Energy
REQUESTED MANAGER: Tiger Infrastructure Partners; identify founders/sellers and continuing co-owners as needed
TASK: ledger:0444:unison-energy:423efadc
CANONICAL KEY: unison-energy|united-states

LEDGER ISSUE TO TEST
The Tiger census identifies Unison Energy as an active U.S. distributed-energy infrastructure platform. The repository publishes an active record saying Tiger Infrastructure Partners Fund III closed a growth-capital investment and acquisition in June 2024. Verify the company’s identity, ownership/control, exact fund/vehicle, stake, transaction dates, asset-ownership model and any later transfer or exit.

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
The record says Unison designs, builds, owns, operates and maintains behind-the-meter microgrids for commercial/industrial customers under an energy-as-a-service model, serving data centers, healthcare facilities, campuses and industrial sites. It records Tiger as the sole active owner, Fund III, investment year 2024 and no stake. Verify every claim and distinguish company-owned long-lived infrastructure from EPC, equipment sales, O&M and customer-owned systems.

IDENTITY, OWNERSHIP AND TRANSACTION QUESTIONS
Resolve Unison Energy LLC and related project/asset entities, founders/sellers, any predecessor or similarly named company, and current management/operating boundary. Reconstruct Tiger’s 2024 transaction: announcement and legal close dates, acquisition/growth-capital structure, Fund III/acquisition vehicle, stake/control, primary versus secondary capital, governance and co-investors. Search Tiger, Unison, financing, UCC/corporate/regulatory and transaction-party sources through 2026-08-19 for follow-on capital, project portfolio sales, owner transfers, recapitalizations, sponsor exit and signed pending transactions.

INFRASTRUCTURE AND OPERATING PROFILE
Confirm headquarters, founding year, products/services, customer/end markets, contract structure, owned/operated MW, project count, technologies/fuels, geographic footprint and current status. Determine whether Unison retains ownership of energy assets under long-term contracts or primarily develops/sells systems. Keep individual customer microgrids and project SPVs beneath Unison unless separately manager-held.

RESEARCH RULES
- Resolve canonical identity, current/former owners, funds/vehicles, stakes, announcement/closing/exit dates and transaction states.
- Search both the 2024 investment and subsequent exit/status evidence through 2026-08-19. Open direct pages rather than relying on snippets.
- Prefer Tiger, Unison, financing/regulatory filings and transaction-party sources.
- Require direct evidence tying the investment to Tiger’s infrastructure strategy. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity/current-ownership uncertainty.
- Return VERIFIED_NO_CHANGE only if the active ownership and asset-backed model are fully supported; PROPOSED_CORRECTION if identity, ownership, dates, fund, status or operating model needs correction; EXCLUDED if the business is services/equipment-only or Tiger exited; PROPOSED_MERGE if a duplicate is proven; or DEFERRED if material current ownership/asset ownership remains unresolved.
- Keep customer projects beneath one canonical platform. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.tigerinfrastructure.com/portfolio/Unison-Energy
- https://www.prnewswire.com/news-releases/tiger-infrastructure-partners-fund-iii-closes-growth-capital-investment-with-the-acquisition-of-unison-energy-a-fully-integrated-energy-as-a-service-microgrid-platform-302173823.html
- https://unisonenergy.com/
- https://unisonenergy.com/faqs/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
