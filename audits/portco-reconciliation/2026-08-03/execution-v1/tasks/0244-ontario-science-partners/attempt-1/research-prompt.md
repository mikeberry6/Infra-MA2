Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Ontario Science Partners
MANAGERS TO RESOLVE: Equitix; KKR; John Laing; Sacyr Infrastructure Canada; Amico Major Projects; identify every direct consortium shareholder
TASK: ledger:0244:ontario-science-partners:619f3a80
CANONICAL KEY: ontario-science-partners|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The repository contains Ontario Science Partners as an active Equitix company, but the manager census classified it OUT_OF_SCOPE because the 2026 project award was associated with John Laing without direct evidence that it belongs to Equitix's portfolio. Determine the exact post-take-private ownership chain and whether Equitix is a direct infrastructure manager owner.","productionCompanyId":"cmrxpjf2k00woivhe7duvxzv6","seedKey":"ontario science partners|Canada","startingEvidence":["https://www.infrastructureontario.ca/en/news-and-media/news/new-ontario-science-centre-facility/new-ontario-science-centre-contract-awarded/"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Ontario Science Partners","country":"Canada","status":"Active","sector":"Social Infra","subsector":"DBFM cultural and science centre infrastructure","investmentYear":2026,"headquarters":"Ontario","owners":[{"firm":"Equitix","vehicle":"John Laing Investments Limited (Equitix / KKR JV)","investmentYear":2026,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"description":"Ontario Science Partners is recorded as the consortium selected to deliver the new Ontario Science Centre at Ontario Place through a DBFM concession. The repository says the consortium is John Laing 64%, Sacyr Infrastructure Canada 26%, and Amico Major Projects 10%, and attributes the John Laing interest to Equitix/KKR through John Laing Investments Limited.","milestones":[{"date":"2025","event":"Ontario Science Partners was shortlisted for the new Ontario Science Centre procurement.","category":"Financing"},{"date":"2026","event":"The project advanced following contract award.","category":"Expansion"},{"date":"Feb 2026","event":"John Laing disclosed a 64% / 26% / 10% consortium split.","category":"Financing"},{"date":"Feb 11, 2026","event":"The repository records financial close and an Equitix/KKR-backed John Laing entry.","category":"Financing"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the exact legal concession-company and consortium identity, including whether Ontario Science Partners is a company, partnership, contractual consortium or project label. Verify the project scope, DBFM term, capital value, public counterparty, financial-close date and development/construction status. Reconstruct the exact ownership chain at award and financial close: John Laing's disclosed 64%, Sacyr Infrastructure Canada's 26% and Amico Major Projects' 10%; the legal entity holding John Laing's interest; and whether Equitix, KKR or another investor directly controls that interest after the 2021 John Laing Group take-private. Distinguish manager ownership from consortium membership, contractor roles, lenders and procurement counterparties. Search through the as-of date for stake transfers, refinancing, termination, closing failure, project cancellation, John Laing/Equitix/KKR exit or signed pending ownership transaction. Determine whether this should remain one manager-level PortCo and whether its current owner roster must include John Laing, Equitix, KKR, Sacyr and/or Amico.

RESEARCH RULES
- Resolve canonical identity, aliases, direct owners, manager/fund/vehicle attribution and project/company boundaries.
- Verify every stake, announcement date, legal closing date, entry date, exit date and transaction state. Do not treat lenders, contractors or the public authority as equity owners.
- Search through 2026-08-19 for sale, transfer, recapitalization, refinancing, procurement reversal, cancellation and signed pending transactions.
- Verify location, project scope, contract term, disclosed capital value, construction milestones and expected completion/opening.
- Reopen direct pages and filings. Prefer Infrastructure Ontario, Ontario government, John Laing, Equitix, KKR, Sacyr, Amico and regulatory/project sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.infrastructureontario.ca/en/news-and-media/news/new-ontario-science-centre-facility/new-ontario-science-centre-contract-awarded/
- https://news.ontario.ca/en/release/1007092/province-awards-contract-to-build-new-ontario-science-centre-at-ontario-place
- https://www.laing.com/insights/osp-consortium-is-preferred-bidder-for-new-ontario-science-centre-ppp/
- https://sacyr.com/en/-/adjudicacion-museo-ciencias-ontario
- https://www.debevoise.com/news/2021/05/debevoise-advises-pantheon-in-its-role-in

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
