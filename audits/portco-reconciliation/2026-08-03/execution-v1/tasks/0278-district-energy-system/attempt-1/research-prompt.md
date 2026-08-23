Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: District Energy System (identity unresolved)
MANAGERS TO RESOLVE: Harrison Street; BlackRock; identify the actual asset and all direct current and former owners
TASK: ledger:0278:district-energy-system:55ee7b00
CANONICAL KEY: district-energy-system|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The Harrison Street census recorded a generic U.S. district energy system reportedly acquired from BlackRock in 2020, but the operating asset identity and platform boundary were not established. The final list cannot retain a generic placeholder: identify the asset and map it to an existing canonical company, propose the correctly named company, or exclude/defer it with a precise reason.","productionCompanyId":null,"seedKey":null,"sourceHoldingId":"051-harrison-street:holding:013:district-energy-system","startingEvidence":["https://realassets.ipe.com/news/harrison-street-buys-us-district-energy-system-from-blackrock/10045818.article","https://www.harrisonst.com/wp-content/uploads/2020/05/HSRE_ESG-Impact_2019.pdf"]}

CURRENT CENSUS SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"District Energy System","country":"United States","status":"Active","sector":"Utilities","subsector":"District energy system","website":"https://www.harrisonst.com/","investmentYear":2020,"headquarters":null,"owners":[{"firm":"Harrison Street","vehicle":"Harrison Street","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2020,"isActive":true}],"description":"The census says Harrison Street acquired a U.S. long-term district-energy infrastructure investment from BlackRock in 2020, but did not identify the operating business, system, location, legal entity, fund or exact transaction boundary.","milestones":[{"date":"May 14, 2020","event":"Industry reporting said Harrison Street acquired a U.S. district energy system from BlackRock.","category":"Acquisition"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Identify the actual district energy system behind the May 2020 report. Search the IPE article, contemporaneous Harrison Street/BlackRock disclosures, seller fund reports, Harrison Street ESG/impact reports, financing and municipal/utility records, transaction databases and later references. Resolve location, operating/canonical name, legal entities, aliases, seller vehicle, Harrison Street acquiring fund/vehicle, stake, announcement date, legal closing/entry date and current owner. Test likely candidates rather than assuming: CoolCo/Cincinnati District Energy, Grady Health System's district energy infrastructure, Central Connecticut State University, or another campus/urban system. Explicitly distinguish task 278 from CoolCo task 277 and Appalachian State University's Innovation District Energy System. Search through the cutoff for later sale, recapitalization, concession transfer, operator change, signed pending exit or realization. If public evidence cannot establish the identity, return DEFERRED with the exact unresolved issue and do not recommend creating a company named merely District Energy System. If it maps to an existing canonical company, name it and identify the exact task/record to supersede or correct.

RESEARCH RULES
- Resolve canonical identity, aliases, operating-company/asset/concession/SPV boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing/entry date, exit date and transaction state; use NOT_PUBLICLY_DISCLOSED rather than inference.
- Search through 2026-08-19 for ownership transfers, recapitalizations, exits and signed pending transactions.
- Do not create a generic placeholder and do not conflate unrelated district-energy assets simply because their descriptions overlap.
- Reopen direct pages and filings. Prefer Harrison Street, BlackRock, the operating institution/municipality, seller/acquirer fund reports and transaction parties. Use UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://realassets.ipe.com/news/harrison-street-buys-us-district-energy-system-from-blackrock/10045818.article
- https://www.harrisonst.com/wp-content/uploads/2020/05/HSRE_ESG-Impact_2019.pdf
- https://www.harrisonst.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
