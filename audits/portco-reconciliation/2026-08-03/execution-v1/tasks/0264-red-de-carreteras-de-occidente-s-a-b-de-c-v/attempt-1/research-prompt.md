Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Red de Carreteras de Occidente, S.A.B. de C.V. (RCO / Red Vía Corta)
MANAGERS TO RESOLVE: GIC; Abertis; Mundys / Atlantia; identify all direct current and former shareholders
TASK: ledger:0264:red-de-carreteras-de-occidente-s-a-b-de-c-v:3ba7cbb5
CANONICAL KEY: red-de-carreteras-de-occidente-s-a-b-de-c-v|mexico

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"The exact company identity is established, but the record needs an individually reviewed correction. Verify the 2020 Abertis/GIC acquisition, current ownership percentages, vehicles and any later shareholder or concession changes.","productionCompanyId":"cmrxpjgc300yjivhejf598csv","seedKey":"red de carreteras de occidente, s.a.b. de c.v.|Mexico","startingEvidence":["https://redviacorta.mx/acerca-de-nosotros","https://www.abertis.com/news/abertis-y-gic-cierran-la-compra-del-72-de-red-de-/?lang=en"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Red de Carreteras de Occidente, S.A.B. de C.V.","country":"Mexico","status":"Active","sector":"Transportation","subsector":"Toll road operator","yearFounded":2007,"investmentYear":2020,"headquarters":"Jalisco, Michoacán, Guanajuato, Aguascalientes, and Zacatecas","owners":[{"firm":"GIC","vehicle":"NOT_PUBLICLY_DISCLOSED","investmentYear":2020,"stake":"21.0% at 2020 close","isActive":true}],"description":"The repository records a concessioned toll-road operator managing more than 1,100 km in western and central Mexico. It says Abertis and GIC closed acquisition of 72.3% in June 2020, with Abertis at 51.3% and GIC at 21.0%, and the remainder held by local investors and pension funds.","milestones":[{"date":"2007","event":"RCO was founded/constituted.","category":"Founding"},{"date":"Jun 5, 2020","event":"Abertis and GIC closed acquisition of 72.3% of RCO.","category":"Acquisition"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Verify the exact legal name, current brand/aliases and corporate/concession-company boundary. Reconstruct ownership before and after the 2020 acquisition: sellers, acquisition vehicles, Abertis/Mundys and GIC organizations/funds/vehicles, exact stakes, announcement and legal closing dates, and identities/stakes of remaining local shareholders or pension funds where disclosed. Determine whether GIC still owns 21%, whether Abertis/Mundys' 51.3% changed through reorganizations, whether RCO repurchased/diluted shares, and whether any new investor, public listing, tender offer, recapitalization or signed pending sale occurred through the cutoff. Verify concession portfolio, road length, states, concession terms/expiries, traffic and current operating status. Distinguish shareholder ownership from bondholders/lenders and corporate-parent renames.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, parent/acquisition-vehicle/concession boundary, current/former direct owners and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit date and transaction state. Do not infer current stakes solely from the 2020 announcement when later filings exist.
- Search through 2026-08-19 for sale, tender offer, transfer, refinancing, recapitalization, share dilution/repurchase, concession amendment/expiry and signed pending transactions.
- Verify concessions, road length, geography, traffic/operating scale, headquarters and current status.
- Reopen direct pages and filings. Prefer RCO/Red Vía Corta, Abertis/Mundys, GIC, Mexican securities/regulatory/concession filings, rating reports and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://redviacorta.mx/acerca-de-nosotros
- https://www.abertis.com/news/abertis-y-gic-cierran-la-compra-del-72-de-red-de-/?lang=en
- https://www.mundys.com/sites/default/files/documents/Press%20Release-2020-06-04-1043.pdf
- https://www.fitchratings.com/research/infrastructure-project-finance/fitch-affirms-red-de-carreteras-de-occidente-sr-secured-notes-at-bbb-outlook-stable-07-03-2025

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
