Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Intersect Power
REQUESTED MANAGER: Pantheon Ventures; identify every current/former direct owner
TASK: ledger:0377:intersect-power:2076089f
CANONICAL KEY: intersect-power|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"The manager census identified a Pantheon Infrastructure investment in Intersect Power, but no exact repository company existed when the ledger was built. Subsequent Google and IPX Power transactions may make the proposed creation stale. Resolve current identity and ownership before any addition.","productionCompanyIds":[],"seedKeys":[],"sourceHoldingId":"077-pantheon-ventures:holding:002:intersect-power","startingEvidence":["https://www.pantheoninfrastructure.com/portfolio"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
The ledger proposes creating Intersect Power for Pantheon. A separate published record now exists for IPX Power, described as the independent grid-tied solar/storage business launched in March 2026 after Google's acquisition of Intersect, with TPG Rise Climate, Climate Adaptive Infrastructure and Greenbelt Capital Partners backing IPX. Determine whether Pantheon's Intersect interest remains current, transferred to Google, rolled into IPX, or exited. Do not create a stale or duplicate company.

IDENTITY AND SUCCESSOR BOUNDARY
Resolve the canonical legal/commercial identity of Intersect Power and the relationship among Intersect Power, Intersect Power LLC, Google/Alphabet, IPX Power, Intersect's grid-tied renewable assets, data-center/energy businesses, holding companies, funds and project SPVs. Establish what Google acquired, what moved to IPX, and whether Intersect and IPX are current distinct manager-level businesses, predecessor/successor records, or one identity requiring a redirect. Do not count individual solar/storage projects or financing SPVs as PortCos.

OWNERSHIP HISTORY
Rebuild Intersect's direct equity history, including management/founders, Climate Adaptive Infrastructure, TPG Rise Climate, Greenbelt Capital Partners, Pantheon Infrastructure, Google/Alphabet and any other publicly disclosed owners. For Pantheon, determine whether exposure was a direct/co-investment equity interest in the company or merely an LP/fund exposure. Identify the Pantheon vehicle/account, stake, announcement/closing date and exit or rollover treatment where disclosed.

Verify Google's acquisition announcement, legal close, consideration and transferred scope. Determine whether all pre-closing Intersect shareholders sold, retained or rolled interests. Separately identify IPX's launch capitalization and current ownership, but do not automatically merge or create IPX here because it has its own canonical repository record and later queue task.

Search through 2026-08-19 for later ownership transfers, capital raises, recapitalizations, sale closings, signed pending transactions or dissolution/rename. Distinguish equity ownership from project-level tax equity, debt, PPAs, construction financing and fund LP interests.

OPERATING PROFILE
Confirm Intersect's official/current website or successor page, headquarters, founding year, products/services, customers/end markets, geographic footprint, disclosed operating/development scale and two to four material milestones. Explain the North American power-infrastructure qualification and the proper current/realized status.

RESEARCH RULES
- Resolve canonical identity, aliases, Intersect/IPX/project boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, exits, restructurings and signed pending transactions.
- Reopen direct pages. Prefer Pantheon Infrastructure, Intersect, Google/Alphabet, TPG, IPX, other owners, regulatory filings and transaction-party sources.
- Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW only if a separate canonical Intersect record remains required; PROPOSED_CORRECTION if an existing/successor mapping should replace the queued creation; PROPOSED_MERGE only if legal identity continuity is proven; EXCLUDED if Pantheon's exposure was LP-only or no qualifying company record remains; VERIFIED_NO_CHANGE only if no list change is needed; or DEFERRED if identity/current ownership remains unresolved.
- If Pantheon exited at Google's closing, explicitly reject active ADD_OWNER and record the former period rather than creating a current Pantheon holding.
- This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.pantheoninfrastructure.com/portfolio
- https://www.tpg.com/news-and-insights/tpg-announces-completion-of-4-75-billion-sale-of-intersect-to-google-launches-ipx-power-as-independent-power-producer
- https://ipxpower.com/about/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones.

Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction.

Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState.

Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls.

Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary.

Recommend exactly one primary source.
