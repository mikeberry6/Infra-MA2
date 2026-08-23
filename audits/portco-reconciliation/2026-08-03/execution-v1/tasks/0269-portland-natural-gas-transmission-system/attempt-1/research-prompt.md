Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Portland Natural Gas Transmission System (PNGTS)
MANAGERS TO RESOLVE: Global Infrastructure Partners; BlackRock; Morgan Stanley Infrastructure Partners (MSIP); identify all direct current and former owners
TASK: ledger:0269:portland-natural-gas-transmission-system:32d29304
LINKED RECIPROCAL TASK TO COVER: ledger:0149:portland-natural-gas-transmission-system:15040b8a
CANONICAL KEY: portland-natural-gas-transmission-system|united-states-canada

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"A repo-only GIP judgment says the company is attributable to legacy BlackRock infrastructure vehicles rather than GIP, while the reciprocal census task identifies current BlackRock and MSIP ownership. Determine whether these are one canonical company, whether GIP ever held direct asset equity, and whether the existing 2024 BlackRock/MSIP owner records are complete and current.","productionCompanyId":"cmrxpj90w00nbivhe1yvbf58m","seedKey":"portland natural gas transmission system|United States / Canada","startingEvidence":["https://www.tcenergy.com/announcements/2024/2024-03-04-tc-energy-announces-sale-of-portland-natural-gas-transmission-system/","https://www.tcenergy.com/announcements/2024/2024-08-15-tc-energy-completes-the-sale-of-portland-natural-gas-transmission-system/","https://www.morganstanley.com/im/en-ie/intermediary-investor/companies/portland-natural-gas-transmission-system.html","https://www.pngts.com/"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Portland Natural Gas Transmission System","country":"United States / Canada","status":"Active","sector":"Midstream","subsector":"Natural gas transmission pipeline","yearFounded":1999,"investmentYear":2024,"headquarters":"Maine; New Hampshire; Canada","owners":[{"firm":"BlackRock","vehicle":"Diversified Infrastructure","investmentYear":2024,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true},{"firm":"MSIP","vehicle":"n.a.","inferredFund":"North Haven Infrastructure Partners III","fundAttributionConfidence":"LOW","investmentYear":2024,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"description":"The repository describes a FERC-regulated 295-mile natural-gas transmission system serving New England and Atlantic Canada with approximately 460,000 Dth/day of capacity. It says TC Energy sold PNGTS to BlackRock's Diversified Infrastructure business and MSIP for approximately US$1.14 billion including assumed notes, closing August 15, 2024.","milestones":[{"date":"1999","event":"Portland Natural Gas Transmission System was founded.","category":"Founding"},{"date":"Mar 4, 2024","event":"TC Energy announced an agreement to sell PNGTS to BlackRock and MSIP.","category":"Acquisition"},{"date":"Aug 15, 2024","event":"TC Energy completed the sale of PNGTS to BlackRock and MSIP.","category":"Acquisition"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the canonical operating company, legal owner entities, PNGTS abbreviation, pipeline/project boundary, Canadian and U.S. regulated entities, and any predecessor or successor names. Reconstruct ownership from formation through the 2024 sale: TC Energy, Northern New England Investment Company or other historical partners, BlackRock's Diversified Infrastructure business/vehicles, and MSIP. Verify the March 4 announcement and August 15 closing, transaction value, exact stakes, investment vehicles/funds, governance, and whether any current ownership percentages are publicly disclosed. Do not accept inferred North Haven Infrastructure Partners III attribution without direct evidence. Determine whether “Diversified Infrastructure” is a manager strategy, fund, managed account or legal investment vehicle. Test whether GIP or a GIP-managed vehicle ever held direct equity, or whether the repo-only GIP association is solely manager-platform/label conflation after BlackRock's acquisition of GIP. Search through the cutoff for later transfers, recapitalizations, financings, stake sales, BlackRock/GIP reorganization effects, MSIP exit, signed pending transactions, expansions or operating-status changes. Verify current route, capacity, customers/end markets and cross-border footprint.

RESEARCH RULES
- Resolve canonical identity, aliases, legal-company/pipeline-project boundary, current/former direct owners and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit date and transaction state; never infer a fund from vintage or manager matching.
- Search through 2026-08-19 for ownership transfers, stake sales, recapitalizations, exits and signed pending transactions.
- Treat BlackRock's acquisition of GIP as a manager-level transaction unless direct evidence shows an asset-level ownership transfer.
- Keep PNGTS as one manager-level operating pipeline; do not count compressor stations, laterals, expansion projects or parent holding companies as separate PortCos.
- Reopen direct pages and filings. Prefer PNGTS, TC Energy, BlackRock, Morgan Stanley/MSIP, FERC and regulatory sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Explicitly state whether this task fully covers linked task 149 and should supersede it.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.pngts.com/
- https://www.pngts.com/who-we-are
- https://www.tcenergy.com/announcements/2024/2024-03-04-tc-energy-announces-sale-of-portland-natural-gas-transmission-system/
- https://www.tcenergy.com/announcements/2024/2024-08-15-tc-energy-completes-the-sale-of-portland-natural-gas-transmission-system/
- https://www.morganstanley.com/im/en-ie/intermediary-investor/companies/portland-natural-gas-transmission-system.html
- https://www.kindermorgan.com/Operations/Natural-Gas/Pipelines/Portland-Natural-Gas-Transmission-System

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
