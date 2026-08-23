Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Avolta Renewable Holdings
MANAGER TO RESOLVE: Energy Capital Partners (ECP)
TASK: ledger:0223:avolta-renewable-holdings:7181d627
CANONICAL KEY: avolta-renewable-holdings|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The census holding Avolta Renewable Holdings has only a heuristic repository candidate, Avolta Renewable Holdings, LLC. Confirm exact identity and ownership before mapping or correcting it.","candidateProductionCompany":{"id":"cmrxpjdg100u6ivhep4xv8y79","name":"Avolta Renewable Holdings, LLC","seedKey":"avolta renewable holdings, llc|United States"},"startingEvidence":["https://www.avoltaenergy.com/","https://www.ecpgp.com/equity/portfolio"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjdg100u6ivhep4xv8y79","name":"Avolta Renewable Holdings, LLC","country":"United States","status":"Active","sector":"Power & ET","subsector":"Renewable natural gas from dairy waste","investmentYear":2022,"headquarters":"California, Idaho, and other U.S. dairy markets","website":null,"description":"The repository describes a newly formed ECP/Avolta joint venture developing U.S. dairy renewable-natural-gas projects.","owners":[{"firm":"ECP","vehicle":"Joint venture by ECP and Avolta, LLC","investmentYear":2022,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"milestones":[{"date":"2022","event":"Avolta Renewable Holdings was formed.","category":"Founding"},{"date":"Feb 2022","event":"ECP committed capital to the joint venture.","category":"Financing"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Prove whether census Avolta Renewable Holdings and repository Avolta Renewable Holdings, LLC are the same canonical platform; identify the precise legal/display name, aliases and relationship to Avolta, LLC, Avolta Development, ECP and each dairy RNG project or project entity. Reconstruct the 2022 formation/investment: ECP organization, exact fund/vehicle, joint-venture counterparties, stake/control, announcement and legal closing dates, and whether ownership remains current. Search through the as-of date for project sales, follow-on financing, recapitalization, rebrand, dissolution, owner transfer, ECP portfolio removal, company sale, exit or signed pending transaction. Determine whether the manager-level platform remains active, is realized, has changed identity, maps cleanly to the existing record, or should be excluded/deferred. Do not count individual digesters, farms or project SPVs separately.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, current/former owners and platform/subsidiary/project boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer percentages or closing from an announcement.
- Search through 2026-08-19 for sale, transfer, recapitalization, refinancing, merger, rebrand, asset disposition, portfolio removal and signed pending transactions.
- Verify official website/status, headquarters, founding year, products/services, customers/end markets, project footprint and disclosed scale.
- Reopen direct pages. Prefer Avolta, ECP, regulatory/government, filing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.avoltaenergy.com/
- https://www.ecpgp.com/equity/portfolio
- https://www.ecpgp.com/equity/portfolio/avolta-renewable-holdings
- https://avoltadevelopment.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
