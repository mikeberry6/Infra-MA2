Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: ACES Delta
MANAGERS TO RESOLVE: GIC; Ontario Teachers' Pension Plan; AIMCo; Manulife; Haddington Ventures; Chevron New Energies; Blackstone if relevant; identify all direct current and former project/company owners
TASK: ledger:0261:aces-delta:7027e92e
CANONICAL KEY: aces-delta|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The repository lists GIC, OTPP and AIMCo as active owners from Haddington's 2022 US$650 million equity syndication. The accepted review says GIC's evidence shows only LP participation through Haddington ESP I, which is out of scope, and later reporting says Chevron acquired a majority stake. Resolve direct versus LP exposure and current ownership.","productionCompanyId":"cmrxpjg8d00ycivhe43mta77q","seedKey":"aces delta|United States","startingEvidence":["https://aces-delta.com/about-us/","https://www.otpp.com/en-ca/about-us/news-and-insights/2022/haddington-ventures-announces--650-million-equity-syndication-pr/"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"ACES Delta","country":"United States","status":"Active","sector":"Power & ET","subsector":"Hydrogen production and storage","investmentYear":2022,"headquarters":"Utah","owners":[{"firm":"GIC","vehicle":"GIC Infrastructure (Equity Syndication Consortium)","investmentYear":2022,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true},{"firm":"OTPP","vehicle":"Haddington ESP I, LP","investmentYear":2022,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true},{"firm":"AIMCo","vehicle":"Haddington ESP I, LP","investmentYear":2022,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"description":"The repository records a Delta, Utah clean-hydrogen project combining 220 MW of electrolysis with two salt caverns. It treats investors in Haddington's 2022 syndication as direct owners and notes a reported 2023 Chevron majority acquisition, but does not reconcile LP versus direct exposure or current stakes.","milestones":[{"date":"2019","event":"Advanced Clean Energy Storage was announced.","category":"Other"},{"date":"Jun 2022","event":"DOE closed a US$504.4 million loan guarantee and Haddington announced a US$650 million equity syndication.","category":"Financing"},{"date":"2023","event":"Reporting said Chevron acquired a majority stake from Haddington.","category":"Acquisition"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the canonical/legal project-company identity and relationships among ACES Delta, Advanced Clean Energy Storage I, Haddington Ventures, Magnum Development and Chevron New Energies. Reconstruct every ownership period and transaction from development through the 2022 Haddington ESP I syndication and Chevron's later majority acquisition. Determine whether GIC, OTPP, AIMCo and Manulife were only LPs in Haddington ESP I, direct co-investors/project shareholders, managed-account participants or both; LP/fund exposure alone is excluded. Verify exact stakes, fund/vehicle, announcement and legal closing dates, Haddington's retained interest, Chevron's stake/current control and any other direct co-owner. Search through the cutoff for later capital calls, transfers, refinancing, construction/operations milestones, project sale, restructuring, cancellation or signed pending ownership transaction. Do not treat DOE lending, offtake, EPC or technology roles as ownership.

RESEARCH RULES
- Resolve canonical identity, aliases, parent/ProjectCo/fund boundary, current/former direct owners and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing/funding date, entry date, exit date and transaction state. Distinguish direct equity/co-investment from LP fund exposure, debt and service relationships.
- Search through 2026-08-19 for sale, transfer, refinancing, recapitalization, construction/operations status, cancellation and signed pending transactions.
- Verify project scope, capacity, caverns, location, DOE loan, offtake/customer plans and current development/operating status.
- Reopen direct pages and filings. Prefer ACES Delta, Chevron, Haddington, pension/investor releases, DOE/regulatory filings and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://aces-delta.com/about-us/
- https://www.otpp.com/en-ca/about-us/news-and-insights/2022/haddington-ventures-announces--650-million-equity-syndication-pr/
- https://hvllc.com/haddingtonesp/
- https://www.aimco.ca/insights/worlds-largest-green-hydrogen-platform
- https://aces-delta.com/media/us-doe-closes-504-4-million-loan-to-advanced-clean-energy-storage-project-for-hydrogen-production-and-storage/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
