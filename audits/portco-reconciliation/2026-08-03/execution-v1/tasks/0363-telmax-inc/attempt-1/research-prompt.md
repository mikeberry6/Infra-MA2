Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: telMAX Inc.
REQUESTED MANAGER: NOVA Infrastructure; identify every current/former direct owner
TASK: ledger:0363:telmax-inc:f608a383
CANONICAL KEY: telmax-inc|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"No exact normalized production or seed match exists. The census classified telMAX Inc. as a current NOVA Infrastructure Canadian digital-infrastructure holding.","productionCompanyIds":[],"seedKeys":[],"sourceHoldingId":"072-nova-infrastructure:holding:001:telmax-inc","startingEvidence":["https://novainfrastructure.com/investments/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
No exact telMAX company or seed record is mapped to this holding. The only starting evidence is NOVA Infrastructure's portfolio page. Determine from scratch whether a list-ready canonical company is missing, whether NOVA remains a qualifying direct owner, and whether any predecessor, successor, rebrand or later investor changes the list decision.

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the canonical legal and commercial identity, capitalization/styling, aliases, founding history, predecessor/successor names and any parent/holding companies. Establish NOVA's investment announcement and legal closing dates, direct acquisition vehicle/fund, exact stake/control terms, seller or primary-capital structure, co-investors and retained founder/management ownership. Identify municipal agreements, permits and network-construction arrangements without confusing them with equity ownership.

Search through 2026-08-19 for recapitalizations, new equity investors, sales, mergers, restructurings and signed pending transactions. Confirm NOVA's current ownership from the latest direct company/manager, corporate or regulatory evidence; a stale portfolio page alone is insufficient. Distinguish ordinary growth capital from direct infrastructure equity only where the investment mandate and ownership evidence support inclusion. Do not treat lenders, municipalities, grant programs, wholesale carriers, landlords, customers or construction vendors as owners.

BOUNDARY AND OPERATING PROFILE
Confirm official website, headquarters, founding year, Canadian operating municipalities/markets, fiber route or premises-passed metrics, network technology, products/services, customers/end markets and disclosed expansion pipeline with dates. Establish why telMAX qualifies as North American digital infrastructure. Count telMAX once at the manager-level platform and treat local networks, construction projects, municipal franchises, subsidiaries and financing SPVs as underlying operations unless evidence proves a separate manager-level portfolio investment.

RESEARCH RULES
- Resolve canonical identity, aliases, predecessor/successor names, platform/subsidiary boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer telMAX, NOVA, Canadian corporate/telecom regulators, municipalities, government, financing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW only if a missing list-ready canonical company and current qualifying ownership are proven, PROPOSED_CORRECTION if an existing successor record should be used, PROPOSED_MERGE if duplicate identities are proven, EXCLUDED if direct equity or infrastructure qualification is disproven, or DEFERRED if current identity or ownership remains unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCE TO REOPEN
- https://novainfrastructure.com/investments/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
