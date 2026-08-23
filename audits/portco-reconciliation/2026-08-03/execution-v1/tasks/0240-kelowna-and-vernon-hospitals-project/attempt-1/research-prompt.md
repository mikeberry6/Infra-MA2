Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and manager claim as unverified.

REQUESTED COMPANY: Kelowna and Vernon Hospitals Project
MANAGERS TO RESOLVE: Equitix; Dalmore Capital; BBGI
TASK: ledger:0240:kelowna-and-vernon-hospitals-project:10251313
CANONICAL KEY: kelowna-and-vernon-hospitals-project|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["RETIRE_OWNERSHIP"],"rationale":"A manager review says Equitix's ownership was divested and should be retired. BBGI's current project factsheet is the starting evidence; establish the exact seller, buyer, stake and closing date before changing ownership.","productionCompanyId":"cmrxpjezu00wjivhep4zsd3j9","seedKey":"kelowna and vernon hospitals project|Canada","startingEvidence":["https://www.bb-gi.com/media/2548/bbgi-esg-factsheet-kelowna-and-vernon-hospitals-healthcare.pdf"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Kelowna and Vernon Hospitals Project","country":"Canada","status":"Active","sector":"Social Infra","subsector":"Availability-based hospital PPP","investmentYear":2018,"headquarters":"British Columbia","owners":[{"firm":"Equitix","vehicle":"Jura Acquisition","investmentYear":2018,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"description":"The repository records the multi-campus British Columbia hospital PPP as acquired through Equitix- and Dalmore-backed Jura Acquisition in the 2018 JLIF take-private.","milestones":[{"date":"2009","event":"The project reached financial close.","category":"Financing"},{"date":"2012","event":"Early phases entered service.","category":"Expansion"},{"date":"2018","event":"Project completion was achieved.","category":"Expansion"},{"date":"Sep 28, 2018","event":"Jura Acquisition's JLIF take-private became effective.","category":"Acquisition"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the canonical concession/ProjectCo identity and boundary versus Interior Health, public hospitals, service contractors and individual Kelowna/Vernon facilities. Reconstruct equity ownership from financial close through JLIF/Jura and every later transfer. Specifically identify when and how BBGI acquired the project or project stake, the exact seller, buyer vehicle/fund, stake percentage, announcement and legal closing date, and whether Equitix/Dalmore retained any interest. Search through the as-of date for further stake sales, refinancing, concession changes, owner transfers, BBGI exit or signed pending transaction. Retire only the applicable Equitix/Dalmore ownership period; keep the asset active if BBGI or another current owner remains. Do not infer full ownership from a factsheet without checking its stated stake/date.

RESEARCH RULES
- Resolve canonical project-company/display identity, aliases, current/former owners and hospital/operator/ProjectCo boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state.
- Search through 2026-08-19 for sale, transfer, recapitalization, refinancing, concession expiry/change, portfolio disposal, ownership change and signed pending transactions.
- Verify geography, operating status, public authority, concession term if disclosed, facility scope and scale.
- Reopen direct pages and PDFs. Prefer BBGI, Infrastructure BC, Interior Health, JLIF/Jura, Equitix, Dalmore, regulatory/filing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material current-ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.bb-gi.com/media/2548/bbgi-esg-factsheet-kelowna-and-vernon-hospitals-healthcare.pdf
- https://www.infrastructurebc.com/project/kelowna-and-vernon-hospitals-project/
- https://www.marketscreener.com/quote/stock/JOHN-LAING-INFRASTRUCTURE-6919133/news/John-Laing-Infrastructure-Fund-Ld-Scheme-of-Arrangement-becomes-Effective-27339064/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
