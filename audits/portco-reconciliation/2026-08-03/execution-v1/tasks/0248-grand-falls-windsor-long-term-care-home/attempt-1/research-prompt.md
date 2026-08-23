Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Grand Falls-Windsor Long-Term Care Home
MANAGERS TO RESOLVE: Fengate Asset Management; identify all direct owners of NL Healthcare Partners and the bundled care-homes ProjectCo
TASK: ledger:0248:grand-falls-windsor-long-term-care-home:ebbcb53e
CANONICAL KEY TO RESOLVE: grand-falls-windsor-long-term-care-home|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The repository contains the individual Grand Falls-Windsor facility, while the manager census counts the broader Gander and Grand Falls-Windsor Care Homes Project. Confirm that the facility is an underlying asset of the bundled ProjectCo and should not remain a separate manager-level PortCo.","productionCompanyId":null,"seedKey":"grand falls-windsor long-term care home|Canada","startingEvidence":["https://fengate.com/news/fengate-led-consortium-achieves-financial-close-for-gander-and-grand-falls-windsor-care-homes-infrastructure-project"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Grand Falls-Windsor Long-Term Care Home","country":"Canada","status":"Active","sector":"Social Infra","subsector":"Long-term care PPP","investmentYear":2019,"headquarters":"Newfoundland and Labrador","owners":[{"firm":"Fengate Asset Management","vehicle":"NOT_PUBLICLY_DISCLOSED","investmentYear":2019,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"description":"The repository records a 60-bed long-term-care facility that reached substantial completion in 2022. It says the facility is one component of the broader Gander and Grand Falls-Windsor care-homes program in which Fengate-led NL Healthcare Partners reached financial close in 2019.","milestones":[{"date":"Jun 14, 2019","event":"Fengate-led NL Healthcare Partners achieved financial close for the bundled care-homes project.","category":"Financing"},{"date":"Mar 2022","event":"The Grand Falls-Windsor home reached substantial completion.","category":"Expansion"}]}

RELATED CANONICAL RECORD TO TEST
The repository separately contains `Gander and Grand Falls-Windsor Care Homes Project` as the manager-level Fengate holding. Determine whether NL Healthcare Partners owns one bundled concession covering both homes and whether this individual facility has any separate equity, concession or sponsor ownership that warrants a distinct PortCo row.

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the legal ProjectCo/concession identity, aliases, project bundle and boundaries among NL Healthcare Partners, the Gander home and the Grand Falls-Windsor home. Verify procurement award, financial close, DBFM term, facility capacities, substantial-completion dates, public counterparty and direct consortium shareholders/stakes. Reconstruct current and former ownership and Fengate-managed fund/vehicle attribution. Search through the as-of date for project-company sale, shareholder transfer, refinancing, concession termination/expiry, handback or signed pending ownership transaction. Decide whether the individual facility should merge into the broader bundled project, remain only as an underlying asset/milestone, or be retained separately.

RESEARCH RULES
- Resolve canonical identity, aliases, bundled-project/facility boundary, direct owners and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit date and transaction state. Do not treat contractors, operators, lenders, government agencies or health authorities as equity owners.
- Search through 2026-08-19 for sale, transfer, refinancing, concession change, expiry/termination, handback and signed pending transactions.
- Verify facility locations, bed counts, contract term, financial close, construction/completion and current operating status.
- Reopen direct pages and filings. Prefer Fengate, NL Healthcare Partners, Newfoundland and Labrador government, PPP Council, procurement/concession and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://fengate.com/news/fengate-led-consortium-achieves-financial-close-for-gander-and-grand-falls-windsor-care-homes-infrastructure-project
- https://www.pppcouncil.ca/projects/central-long-term-care-%28grand-falls-windsor%29
- https://www.gov.nl.ca/ti/works/major-building-construction-project-updates/central-long-term-care-project/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
