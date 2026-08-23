Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every census claim as unverified.

REQUESTED COMPANY: Channelview Cogeneration
MANAGERS TO RESOLVE: Global Infrastructure Partners / BlackRock; identify every direct current and former owner
TASK: ledger:0266:channelview-cogeneration:a4e4cfd5
CANONICAL KEY: channelview-cogeneration|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"The GIP census proposed a new company from GIP's portfolio page. Verify the exact legal asset/company identity, manager-level boundary, acquisition history, current ownership after the BlackRock/GIP combination and any later exit before creating a record.","productionCompanyId":null,"seedKey":null,"startingEvidence":["https://www.global-infra.com/portfolio/channelview-cogeneration/"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"recordExists":false,"requestedDisplayName":"Channelview Cogeneration","country":"United States","proposedOwner":"Global Infrastructure Partners","description":"No canonical company or seed record exists. The only census claim is that Channelview Cogeneration appears in GIP's portfolio."}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the exact legal owner/ProjectCo, plant name, location, capacity, technology, host/customer/offtaker, operating date and boundary versus Channelview Energy Center or related industrial facilities. Reconstruct equity ownership from development/construction through every acquisition, sale, recapitalization and current period. Verify GIP fund/vehicle, stake, announcement and legal closing dates, co-owners, predecessor owner/seller and whether the investment remains current, was realized, or changed only at the manager level through BlackRock's acquisition of GIP. Do not treat the BlackRock/GIP manager transaction as a plant sale unless underlying ownership changed. Search through the cutoff for sale, transfer, refinancing, repowering, shutdown, bankruptcy, tolling/PPA termination or signed pending ownership transaction. Determine whether this is one manager-level operating company/standalone asset suitable for a new row or should merge into a broader power platform.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, plant/ProjectCo/platform boundary, current/former direct owners and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit date and transaction state. Do not treat lenders, fuel suppliers, host customers, operators or manager-level mergers as asset ownership changes.
- Search through 2026-08-19 for sale, transfer, refinancing, repowering, shutdown, bankruptcy, contract change and signed pending transactions.
- Verify location, capacity, technology, fuel, host/offtaker, commercial-operation date and current operating status.
- Reopen direct pages and filings. Prefer GIP/BlackRock, plant/ProjectCo, regulatory/EIA/FERC, transaction-party and official operating sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCE TO REOPEN
- https://www.global-infra.com/portfolio/channelview-cogeneration/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
