Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every census claim as unverified.

REQUESTED COMPANY: Clearway Operating Solar Portfolio (12 U.S. projects, 50% interest)
MANAGERS TO RESOLVE: Fengate Asset Management; Clearway Energy Group; identify all direct current and former portfolio owners
TASK: ledger:0246:clearway-operating-solar-portfolio-12-u-s-projects-50-interest:1c6f7831
CANONICAL KEY: clearway-operating-solar-portfolio-12-u-s-projects-50-interest|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"The manager census proposed a new company after Fengate announced acquiring a 50% interest in a 12-project operating U.S. solar portfolio. Verify that this is a manager-level portfolio rather than a financing, fund interest or duplicate of an existing Clearway platform, and confirm current ownership.","productionCompanyId":null,"seedKey":null,"startingEvidence":["https://fengate.com/news/fengate-acquires-50-interest-in-clearway-operating-solar-portfolio/"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"recordExists":false,"requestedDisplayName":"Clearway Operating Solar Portfolio (12 U.S. projects, 50% interest)","country":"United States","proposedOwner":"Fengate Asset Management","proposedStake":"50%","description":"No canonical company or seed record exists. The only census claim is that Fengate acquired a 50% interest in a 12-project operating U.S. solar portfolio associated with Clearway."}

IDENTITY AND OWNERSHIP QUESTIONS
Identify the exact portfolio name, acquisition vehicle, ProjectCos, 12 projects, states, capacity and operating boundary. Determine whether the portfolio has a public/common platform name suitable for the canonical display name or should remain a descriptive portfolio record. Verify seller, retained co-owner, Fengate-managed fund/vehicle, exact 50% stake, announcement and legal closing dates, and whether the transaction was sponsor equity rather than debt, tax equity or an LP/fund interest. Search for any overlap with existing Clearway Energy Group, Clearway Energy, Inc., Lighthouse Renewable Energy, or other Fengate/Clearway portfolio records; do not duplicate a broader manager-level platform if this is already represented. Search through the as-of date for later refinancing, asset sales, project removals/additions, Fengate or Clearway exit, transfer of the remaining 50%, portfolio dissolution or signed pending ownership transaction. Decide whether one new manager-level portfolio company is warranted and identify all current owners.

RESEARCH RULES
- Resolve canonical identity, aliases, ProjectCo/project boundary, direct owners and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit date and transaction state. Do not treat lenders, tax-equity investors, offtakers, developers, operators or EPC counterparties as owners unless direct equity is proven.
- Search through 2026-08-19 for sale, transfer, refinancing, recapitalization, project-level disposal and signed pending transactions.
- Verify project names, states, total capacity, commercial-operation status, offtakers and disclosed scale.
- Reopen direct pages and filings. Prefer Fengate, Clearway, regulatory/FERC, project-company and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCE TO REOPEN
- https://fengate.com/news/fengate-acquires-50-interest-in-clearway-operating-solar-portfolio/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
