Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: PSA International Pte Ltd
REQUESTED MANAGER: Temasek
TASK: ledger:0437:psa-international-pte-ltd:b5676593
CANONICAL KEY: currently null; determine whether a North American canonical key is valid

LEDGER ISSUE TO TEST
The repository publishes PSA International as an active Temasek transportation-infrastructure PortCo with country “Canada / United States,” while the Temasek census classifies the repo-only record as OUT_OF_SCOPE because PSA is a Singapore-headquartered global ports platform not primarily based in or dedicated to North America. Resolve the company-level geography and ownership scope without elevating individual North American subsidiaries unless they are separately manager-held.

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
The record says PSA traces its origins to the Port of Singapore Authority in 1964, formed PSA International as a global holding company in 2003, owns/operates more than 70 deepsea, rail and inland terminals across more than 180 locations in 45 countries, and handled roughly 105 million TEUs in 2025. It lists North American operations such as PSA Halifax, Penn Terminals and PSA BDP and records Temasek as sole active owner from 2003 with no vehicle/stake. Verify every fact, Temasek’s exact legal ownership and the proper North American boundary.

GEOGRAPHIC SCOPE TEST
Determine whether PSA International as a manager-level company is primarily based in or dedicated to the United States, Canada or Mexico. Quantify North American versus global throughput, revenue/EBITDA, terminal count/capacity, asset value or another reliable measure from current direct disclosures. A global platform with several North American terminals remains out of scope if those operations do not make the company primarily North American. Do not create separate PortCos for PSA Halifax, Penn Terminals, PSA BDP or other subsidiaries/assets unless Temasek explicitly holds or presents them as standalone manager-level investments.

OWNERSHIP AND IDENTITY QUESTIONS
Resolve the legal relationship among PSA International Pte Ltd, PSA Corporation Ltd and Temasek Holdings; exact current stake, ownership vehicle, entry/reorganization dates, government ownership status and any minority shareholders. Search annual reports, Singapore corporate/government disclosures and Temasek portfolio materials through 2026-08-19 for transfers, partial privatizations, sales, listings, exits or signed pending transactions.

OPERATING PROFILE
Confirm headquarters/domicile, founding/reorganization history, port/terminal and logistics services, shipping-line/cargo customers, global and North American footprint, throughput and current status. Distinguish regulated/government functions from commercial terminal ownership and operation.

RESEARCH RULES
- Resolve canonical identity, geography, legal entities, current/former owners, vehicles, stakes, dates and transaction states.
- Search both ownership formation and subsequent exit/transfer evidence through 2026-08-19. Open direct pages rather than relying on snippets.
- Prefer PSA annual reports, Temasek, Singapore government/corporate sources, terminal filings and transaction-party sources.
- Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity, geography or current-ownership uncertainty.
- Return EXCLUDED if PSA International is not primarily based in or dedicated to North America; PROPOSED_CORRECTION if it qualifies but the record needs correction; VERIFIED_NO_CHANGE only if North American classification and current Temasek ownership are fully supported; PROPOSED_MERGE if a duplicate is proven; or DEFERRED if material geography/ownership evidence remains unresolved.
- Preserve factual ownership and operating history even if the company is excluded from this census. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.globalpsa.com/psa-international/
- https://www.globalpsa.com/globaloffices/
- https://www.globalpsa.com/heritage-tab/
- https://www.temasek.com.sg/en/our-investments/our-portfolio
- https://www.singaporepsa.com/2026/01/14/psa-internationals-2025-container-throughput-performance/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
