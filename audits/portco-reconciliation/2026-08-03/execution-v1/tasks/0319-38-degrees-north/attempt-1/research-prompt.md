Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: 38 Degrees North
MANAGER TO RESOLVE: Kimmeridge Energy / Kimmeridge; also identify Climate Adaptive Infrastructure, founders and all current/former owners or vehicles
TASK: ledger:0319:38-degrees-north:98964650
CANONICAL KEY: 38-degrees-north|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"Production already contains 38 Degrees North with an active Kimmeridge/Kimmeridge Carbon Solutions ownership row, but the census label Kimmeridge Energy generated an ADD_OWNER recommendation. Resolve the manager alias, avoid a duplicate Kimmeridge period, and add/correct other co-owners or dates only when directly supported.","productionCompanyId":"cmrxpjjk4013iivhews9hbpmo","seedKey":"38 degrees north|United States","sourceHoldingId":"063-kimmeridge-energy:holding:002:38-degrees-north","startingEvidence":["https://www.kimmeridge.com/select-investments","https://www.prnewswire.com/news-releases/kimmeridge-invests-in-38-degrees-north-302115939.html"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"38 Degrees North","website":"https://www.38degreesn.com/","country":"United States","status":"Active","sector":"Power & ET","subsector":"Distributed generation, community solar, and battery storage","headquarters":"United States","investmentYear":2025,"owners":[{"firm":"Kimmeridge","vehicle":"Kimmeridge Carbon Solutions","stake":null,"investmentYear":2025,"isActive":true}],"descriptionClaim":"Kimmeridge and Climate Adaptive Infrastructure supplied growth equity; 38 Degrees North also acquired U.S. Light Energy's 250 MW-plus pipeline in July 2025."}

IDENTITY, OWNERSHIP AND MANAGER-ALIAS QUESTIONS
Resolve the exact legal/canonical identity of 38 Degrees North and its predecessor/holdco structure. Determine whether Kimmeridge Energy, Kimmeridge and Kimmeridge Carbon Solutions refer to the same manager/strategy for this investment. Reconstruct Kimmeridge's announced investment (including any April 2024 transaction), the July 2025 $230m corporate-growth-capital round and the concurrent U.S. Light Energy acquisition: announcement/closing dates, equity versus debt, exact fund/vehicle, stake/control, founders/management rollover and Climate Adaptive Infrastructure's role. Do not add a second Kimmeridge ownership period solely because of a manager-label variant. Search through the cutoff for follow-on capital, acquisitions, owner changes, exits and signed pending transactions. Verify company website, headquarters, founding date, products, operating/development scale and current portfolio status. Count the 38 Degrees North platform once; treat U.S. Light Energy, development pipeline and individual project SPVs as acquired subsidiary/assets unless direct evidence shows a separate manager-level investment.

RESEARCH RULES
- Normalize Kimmeridge Energy/Kimmeridge only when direct official evidence establishes the same manager; avoid duplicate ownership periods.
- Require direct evidence for each current owner, fund/vehicle, stake, announcement/closing date and current status. Use NOT_PUBLICLY_DISCLOSED rather than inference.
- Distinguish corporate growth equity from debt facilities and project-level capital.
- Search through 2026-08-19 for later owner changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer 38 Degrees North, Kimmeridge, Climate Adaptive Infrastructure, advisers and transaction releases. Use UNRESOLVED for material identity or current ownership; either blocks application.
- Return PROPOSED_CORRECTION, VERIFIED_NO_CHANGE, EXCLUDED or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.kimmeridge.com/select-investments
- https://www.prnewswire.com/news-releases/kimmeridge-invests-in-38-degrees-north-302115939.html
- https://www.prnewswire.com/news-releases/38-degrees-north-announces-over-230-million-of-corporate-growth-capital-raised-and-welcomes-new-equity-investors-climate-adaptive-infrastructure-and-kimmeridge-302507588.html
- https://www.38degreesn.com/
- https://www.foley.com/news/2025/07/kimmeridge-sale-us-light-energy-growth-equity-38-degrees-north/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
