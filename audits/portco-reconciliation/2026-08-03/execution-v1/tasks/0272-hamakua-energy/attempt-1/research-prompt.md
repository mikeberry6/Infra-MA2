Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Hamakua Energy
MANAGERS TO RESOLVE: Harbert Management Corporation; Pacific Current / Hawaiian Electric Industries; identify all direct current and former owners
TASK: ledger:0272:hamakua-energy:72375ecc
CANONICAL KEY: hamakua-energy|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"The 2026 census proposed Hamakua Energy as new, but the current seed now contains Hamakua Energy Plant under Harbert. Resolve whether these are the same canonical asset, verify the March 2025 acquisition and prevent a duplicate company.","productionCompanyId":null,"seedKey":"hamakua energy plant|United States","startingEvidence":["https://www.hamakuaenergyllc.com/","https://www.harbert.net/news/harbert-acquires-hamakua-energy/"]}

CURRENT SEED SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Hamakua Energy Plant","country":"United States","status":"Active","sector":"Power & ET","subsector":"Thermal power generation","investmentYear":2025,"headquarters":"Hawaii","owners":[{"firm":"Harbert Management Corp (Harbert Infra / Gulf Pacific)","vehicle":"Harbert Infrastructure","investmentYear":2025,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"description":"The seed describes a 60 MW thermal plant on Hawaiʻi Island formerly owned by Pacific Current, an affiliate of Hawaiian Electric Industries. It says a Harbert subsidiary acquired the plant in March 2025.","milestones":[{"date":"Mar 2025","event":"Harbert announced the acquisition of Hamakua Energy Plant.","category":"Acquisition"},{"date":"Mar 10, 2025","event":"HEI announced closing of the sale to a Harbert subsidiary.","category":"Acquisition"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve Hamakua Energy, Hamakua Energy Plant, Hamakua Energy, LLC, facility/operator/project entities and the canonical asset boundary. Reconstruct the 2025 sale from Pacific Current/Hawaiian Electric Industries: announcement, exact legal closing date, seller, buyer entity, Harbert organization, infrastructure fund/vehicle, stake, co-owners and any retained seller interest. Test whether “Harbert Infrastructure” is a business-unit label, fund, managed account or disclosed acquisition vehicle; do not invent a fund. Search prior ownership history and through the cutoff for recapitalization, refinancing that changed equity, later sale, transfer, shutdown, retirement plan or signed pending transaction. Verify plant capacity, location, fuel/technology, commercial-operation history, utility customer/PPA, grid role, current operating status and official website. Reconcile the census company name with the existing seed record rather than creating a duplicate.

RESEARCH RULES
- Resolve canonical identity, aliases, legal owner/operator and facility/subsidiary boundary, current/former direct owners and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit date and transaction state. Do not infer a Harbert fund or percentage.
- Search through 2026-08-19 for sale, transfer, refinancing, closure, decommissioning, owner exit and signed pending transactions.
- Keep one canonical Hamakua asset/company record; do not count the physical plant and its LLC separately.
- Reopen direct pages and filings. Prefer Hamakua, Harbert, HEI/Pacific Current, Hawaii regulators/utilities and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, PROPOSED_NEW, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.hamakuaenergyllc.com/
- https://www.harbert.net/news/harbert-acquires-hamakua-energy/
- https://www.harbert.net/news/march-2025-harbert-management-is-pleased-to-announce-the-successful-acquisition-of-the-hamakua-energy-plant
- https://www.hei.com/investor-relations/news-and-events/news/news-details/2025/HEI-Subsidiary-Sells-Hawaii-Island-Power-Plant-to-Experienced-Plant-Operator/default.aspx

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
