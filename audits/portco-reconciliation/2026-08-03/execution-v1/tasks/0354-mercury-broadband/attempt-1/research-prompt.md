Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Mercury Broadband
REQUESTED MANAGER: Northleaf Capital; identify every current/former direct owner
TASK: ledger:0354:mercury-broadband:1dda7bce
CANONICAL KEY: mercury-broadband|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"No exact normalized production or seed match exists. The census classified Mercury Broadband as a Northleaf Capital infrastructure holding. Verify whether a list-ready canonical company is missing, whether it has been renamed or sold, and whether it remains directly owned.","productionCompanyIds":[],"seedKeys":[],"sourceHoldingId":"071-northleaf-capital:holding:016:mercury-broadband","startingEvidence":["https://www.northleafcapital.com/news/northleaf-acquires-mercury-broadband"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
No exact Mercury Broadband company or seed record is mapped to this holding. The only starting evidence is Northleaf's acquisition announcement. Determine from scratch whether the appropriate canonical record is Mercury Broadband, a current successor or rebrand, or an excluded/realized holding. Do not create separate records for operating subsidiaries, acquired local networks, individual markets, towers, fiber routes or financing vehicles.

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the canonical legal and commercial identity, aliases, predecessor names, successor/rebrand names, and the platform boundary. Establish Northleaf's announcement date, legal closing date, infrastructure fund/vehicle, exact stake or control terms, sellers, co-investors and any retained management/founder interest. Search explicitly for recapitalizations, subsequent owners, sales, mergers, bankruptcies, restructurings, name changes and signed pending transactions through 2026-08-19. Confirm current ownership from the latest direct evidence; a stale announcement alone is insufficient.

Determine whether any apparent Mercury Broadband and Mercury Fiber identities are the same platform, a successor brand, separate companies or an unsupported name collision. Resolve whether fixed-wireless and fiber operations belong inside one manager-level company boundary. Do not infer a fund from vintage proximity and do not treat debt providers, grant programs, vendors, customers or network-development partners as equity owners.

BOUNDARY AND OPERATING PROFILE
Confirm official website, headquarters, founding year, products/services, residential and business customer/end-market scope, operating states/markets, fiber and fixed-wireless footprint, homes/businesses passed, route miles and other publicly disclosed scale with dates. Establish why the investment qualifies as North American digital infrastructure. Count the manager-level platform once and exclude acquired local systems, individual markets, towers, routes and financing SPVs unless direct evidence establishes a separate manager-level portfolio investment.

RESEARCH RULES
- Resolve canonical identity, aliases, predecessor/successor names, platform/subsidiary boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Mercury, Northleaf, transaction-party, regulatory, government and financing sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW only if a missing list-ready canonical company and current qualifying ownership are proven, PROPOSED_CORRECTION if an existing successor record or ownership history should be used, PROPOSED_MERGE if duplicate identities are proven, VERIFIED_NO_CHANGE only if no list mutation is warranted, EXCLUDED if the exposure is realized/non-equity/non-infrastructure, or DEFERRED if current identity or ownership remains unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCE TO REOPEN
- https://www.northleafcapital.com/news/northleaf-acquires-mercury-broadband

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
