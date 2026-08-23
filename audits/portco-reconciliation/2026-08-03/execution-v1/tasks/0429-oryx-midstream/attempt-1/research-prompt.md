Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Oryx Midstream
REQUESTED MANAGERS: Stonepeak and Qatar Investment Authority; identify Plains All American and later counterparties as needed
TASK: ledger:0429:oryx-midstream:eee190fa
CANONICAL KEY: oryx-midstream|united-states
LINKED TASK TO COVER IF DUPLICATE IDENTITY IS PROVEN: ledger:0430:oryx-midstream-services:8b062bed

LEDGER ISSUE TO TEST
The repository contains two active records, “Oryx Midstream” and “Oryx Midstream Services,” that appear to describe the same Permian Basin crude gathering platform. The Stonepeak census identifies the latter as a duplicate and proposes one canonical company. Verify the identity, ownership and asset boundary before recommending a merge, including the effect of the 2021 Plains Oryx Permian Basin joint venture and any later transactions.

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
The Oryx Midstream Services record says Stonepeak acquired Oryx in 2019 and Qatar Investment Authority made a $550 million significant minority investment, with more than 1,200 miles of pipeline and roughly 2.1 million barrels of storage. The Oryx Midstream record says Stonepeak acquired the business in 2019 and combined certain Permian assets with Plains All American in 2021 to form Plains Oryx Permian Basin LLC, while the broader platform’s current ownership is unclear. Both are active. Prove which facts and company boundary survive.

IDENTITY AND DUPLICATE QUESTIONS
Trace legal/display names, operating subsidiaries and aliases for Oryx Midstream Services LLC, Oryx Midstream Holdings LLC, Oryx Midstream and Plains Oryx Permian Basin LLC. Determine whether the two repository records are the same manager-level investment, predecessor/successor entities, or genuinely separate continuing companies. If one platform was contributed into the Plains joint venture, establish whether a residual Oryx company remained and what assets it owned.

OWNERSHIP AND TRANSACTION QUESTIONS
Reconstruct Stonepeak’s 2019 acquisition, QIA’s $550 million investment, exact announcement and closing dates, acquisition/investment entities, funds/vehicles, stakes and governance if disclosed. Reconstruct the 2021 Plains/Oryx combination: asset contributions, cash consideration, ownership percentages, legal close and operator. Search through 2026-08-19 for later stake sales, buyouts, Plains or Stonepeak dispositions, QIA exits, Phillips 66 or other counterparties, refinancings, dissolutions, renames and signed pending transactions. Do not assume manager ownership persisted merely because historical portfolio pages remain live.

PLATFORM AND OPERATING BOUNDARY
Confirm headquarters, founding year, products/services, customers/end markets, pipeline/storage footprint and current operating status. Keep individual pipeline systems, terminals and basin assets beneath the canonical manager-level company/JV. If the current manager exposure is solely an interest in Plains Oryx Permian Basin, say whether that JV—not legacy Oryx—is the correct canonical active platform.

RESEARCH RULES
- Resolve canonical identity, legal/acquisition entities, current/former owners, funds/vehicles, stakes, announcement/closing/exit dates and transaction states.
- Search both acquisition and subsequent exit evidence through 2026-08-19. Open direct pages rather than relying on snippets.
- Prefer Oryx, Stonepeak, QIA, Plains, SEC/company filings, regulatory and transaction-party sources.
- Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_MERGE if the two records are one canonical company and current ownership is sufficiently resolved; PROPOSED_CORRECTION if they are distinct but one or both records need correction; VERIFIED_NO_CHANGE only if both current records are independently justified; EXCLUDED if no qualifying direct ownership remains; or DEFERRED if identity/current ownership is materially unresolved.
- If one result fully resolves the linked task, name its task ID in recommendedListAction so it can be superseded after release. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.oryxmidstream.com/news/stonepeak-infrastructure-partners-acquire-oryx-midstream
- https://www.oryxmidstream.com/news/leading-us-midstream-crude-system-oryx-announces-550-million-investment-qia
- https://www.oryxmidstream.com/about/history
- https://stonepeak.com/news/stonepeak-and-plains-complete-joint-venture-of-permian-basin-midstream-assets
- https://stonepeak.com/investments
- https://www.plains.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
