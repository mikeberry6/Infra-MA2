Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: TramCité
MANAGERS TO RESOLVE: CDPQ
TASK: ledger:0173:tramcite:9155b156
CANONICAL KEY: tramcite|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_PENDING_TRANSACTION"],"rationale":"The exact normalized company identity is established; ADD_PENDING_TRANSACTION requires individual review.","censusRows":[{"manager":"CDPQ","disposition":"PENDING_TRANSACTION","rationale":"The exact normalized company identity is established; ADD_PENDING_TRANSACTION requires individual review.","evidenceUrls":["https://cdpqinfra.com/en/tramcite"]}],"repoOnlyRows":[],"repoRows":[{"productionCompanyId":"cmrxpjbq800rhivhed5w05kc5","seedKey":"tramcité|Canada","sourcePresence":"BOTH","disposition":"MATCHED_CENSUS"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjbq800rhivhed5w05kc5","name":"TramCité","country":"Canada","status":"Active","sector":"Transportation","subsector":"Urban tramway","investmentYear":2024,"headquarters":"Québec","description":"The repository treats TramCité as a proposed approximately 19-kilometer Québec City tramway and treats CDPQ as an active owner because CDPQ Infra oversees development and procurement. Public materials reviewed did not disclose a separate external equity ownership structure.","owners":[{"firm":"CDPQ","vehicle":"n.a.","investmentYear":2024,"stake":"Not publicly disclosed","isActive":true}],"milestones":[{"date":"Dec 19, 2024","event":"CDPQ Infra launched the procurement notice following an implementation agreement with Québec.","category":"Financing"},{"date":"Jun 5, 2025","event":"Qualified consortia were announced for civil-works and systems contracts.","category":"Expansion"},{"date":"Mar 26, 2026","event":"Preferred bidders were announced for civil and systems contracts.","category":"Expansion"}],"sources":[{"url":"https://cdpqinfra.com/en/news/pressreleases/cdpq-infra-launches-a-procurement-notice-for-the-tramcite-project"},{"url":"https://cdpqinfra.com/sites/cdpqinfrad8/files/2025-03/Seance_information_avis_marche_TramCite-EN_web_0.pdf"},{"url":"https://www.newswire.ca/news-releases/tramcite-takes-an-important-step-forward-with-the-announcement-of-the-qualified-consortia-for-two-major-contracts-834300933.html"},{"url":"https://cdpqinfra.com/en/news/pressreleases/tramcite-announces-selected-consortia-for-the-civil-and-systems-contracts"}]}

OWNERSHIP QUESTION TO RESOLVE
Determine whether CDPQ/CDPQ Infra has direct project equity or a signed future concession/investment commitment, or instead acts for the Government of Québec as developer, project manager, procurement authority, or mandatary. A development or implementation agreement alone is not direct ownership. Identify the project owner/procuring authority, legal project entity if any, capital structure, risk allocation, closing conditions and whether any private ownership transaction has legally closed. If no direct fund ownership exists, recommend correcting or excluding the CDPQ ownership attribution rather than inventing a pending transaction.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, predecessor/successor names, and project-versus-operating-company boundaries.
- Determine whether TramCité is a manager-level CDPQ infrastructure PortCo, a public project developed under mandate, or a procurement-stage asset without direct CDPQ equity.
- Verify every current and former direct owner, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer a fund, stake, concession or closing.
- Search through 2026-08-19 for financial close, concession award, investment agreement, sale, transfer, recapitalization, cancellation, procurement change, delay and signed pending transactions.
- Verify geography, route, project stage, products/services, users/end markets, operating footprint, disclosed scale and current status.
- Reopen direct pages. Prefer Québec government, CDPQ Infra, regulator, procurement and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://cdpqinfra.com/en/tramcite
- https://cdpqinfra.com/en/news/pressreleases/cdpq-infra-launches-a-procurement-notice-for-the-tramcite-project
- https://cdpqinfra.com/sites/cdpqinfrad8/files/2025-03/Seance_information_avis_marche_TramCite-EN_web_0.pdf
- https://www.newswire.ca/news-releases/tramcite-takes-an-important-step-forward-with-the-announcement-of-the-qualified-consortia-for-two-major-contracts-834300933.html
- https://cdpqinfra.com/en/news/pressreleases/tramcite-announces-selected-consortia-for-the-civil-and-systems-contracts

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
