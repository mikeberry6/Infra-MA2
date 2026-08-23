Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every census claim as unverified.

REQUESTED COMPANY: Mantle Reach
MANAGER TO RESOLVE: EnCap Investments
TASK: ledger:0221:mantle-reach:c0dcf711
CANONICAL KEY: mantle-reach|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"The manager census found Mantle Reach in EnCap's current Energy Transition portfolio, but no exact production or seed company exists.","productionCompanyIds":[],"seedKeys":[],"startingEvidence":["https://mantlereach.com/","https://www.encapinvestments.com/about/energy-transition/portfolio/current/mantle-reach"]}

IDENTITY AND OWNERSHIP QUESTIONS
Verify that Mantle Reach is a manager-level operating company or infrastructure platform—not merely a fund, developer project, advisory firm, financing vehicle or subsidiary—and identify its canonical legal/display identity and aliases. Reconstruct EnCap's ownership: exact fund/vehicle, announcement and legal closing dates, stake/control if disclosed, co-investors, and whether ownership remains current. Search through the as-of date for follow-on financings, asset acquisitions, project transfers, restructurings, portfolio removals, sale, exit or signed pending transaction. Distinguish Mantle Reach from each underlying asset, development project, affiliate and any similarly named company. Determine whether one new canonical company should be created, whether it maps to an existing repo identity under a different name, or whether it should be excluded/deferred.

REQUIRED LIST-READY FACTS IF PROPOSING CREATION
Provide canonical identity and aliases; official website; North American qualification; sector/subsector; headquarters and founding year if disclosed; a concise factual description of products/services, customers/end markets and operating/development footprint; current/former owners; EnCap strategy/fund/vehicle, stake and entry/exit dates; two to four material milestones; exactly one recommended primary ownership source; and any explicit pending ownership transaction. Do not count underlying projects separately from the manager-level platform.

RESEARCH RULES
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer percentages or closing from an announcement.
- Search through 2026-08-19 for sale, transfer, recapitalization, refinancing, merger, rebrand, asset disposition, portfolio removal and signed pending transactions.
- Verify official website/status, headquarters, founding year, products/services, customers/end markets, geographic footprint and disclosed scale.
- Reopen direct pages. Prefer Mantle Reach, EnCap, regulatory/government, filing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://mantlereach.com/
- https://www.encapinvestments.com/about/energy-transition/portfolio/current/mantle-reach

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
