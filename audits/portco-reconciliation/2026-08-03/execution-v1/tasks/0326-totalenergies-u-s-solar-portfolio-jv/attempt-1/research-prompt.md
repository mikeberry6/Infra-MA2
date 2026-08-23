Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census, and Deal Database claim as unverified.

REQUESTED COMPANY: TotalEnergies U.S. Solar Portfolio JV
MANAGERS TO RESOLVE: KKR; TotalEnergies; identify the exact KKR-managed insurance vehicles, funds, acquisition entity, and co-owner structure if publicly disclosed
TASK: ledger:0326:totalenergies-u-s-solar-portfolio-jv:ebabd0e8
CANONICAL KEY: totalenergies-u-s-solar-portfolio-jv|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CORRECT_COMPANY"],"rationale":"The KKR census mapped the September 2025 announced acquisition of 50% of a 1.4 GW North American solar portfolio to the existing generic TotalEnergies U.S. Solar Portfolio JV record. Independently verify closing, legal identity, portfolio composition, owner vehicles and whether a durable manager-level JV/platform exists rather than an unnamed bundle of project interests.","productionCompanyId":"cmrxpjjyj0145ivhej5vka83l","seedKey":"totalenergies u.s. solar portfolio jv|United States","sourceHoldingId":"064-kkr:holding:018:totalenergies-u-s-solar-portfolio-jv","startingEvidence":["https://totalenergies.com/news/press-releases/renewables-totalenergies-divests-50-14-gw-solar-portfolio-north-america","https://totalenergies.com/system/files/documents/2026-02/totalenergies-results-q4-2025.pdf"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"TotalEnergies U.S. Solar Portfolio JV","country":"United States","status":"Active","sector":"Power & ET","subsector":"Contracted utility-scale solar generation","website":null,"yearFounded":null,"investmentYear":2025,"headquarters":"United States","owners":[{"firm":"KKR","vehicle":"n.a.","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2025,"isActive":true}],"description":"The seed describes a portfolio-level joint venture holding 1.4 GW of contracted operating U.S. solar assets, with TotalEnergies announcing a 50% sale to KKR-managed insurance vehicles and funds in September 2025.","milestones":[{"date":"2025","event":"The transaction established a 50/50 ownership structure between TotalEnergies and KKR across the portfolio.","category":"Founding"},{"date":"Sep 29, 2025","event":"TotalEnergies announced the sale of 50% of a 1.4 GW North American solar portfolio to KKR-managed vehicles.","category":"Acquisition"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve whether the requested label corresponds to a named legal JV/platform, one acquisition vehicle, several project-level co-ownership SPVs, or only a descriptive portfolio grouping. Identify any disclosed legal names and aliases, the exact assets/projects and countries included, and whether “North American” included any Canadian assets despite the U.S. seed identity. Establish announcement and legal closing dates, transaction consideration, stake level and the entity/entities to which 50% applies; every current/former direct owner; TotalEnergies's retained interest; the exact KKR manager, fund, insurance separate-account or vehicle wording; and whether a 2025 year-end or 2026 filing confirms consolidation/deconsolidation and current ownership. Do not infer a single 50/50 company if the deal transferred parallel project-level interests. Search through the cutoff for later sale, recapitalization, dilution, project disposal, ownership transfer, termination, or signed pending exit. Verify operating status, contracted/de-risked characterization, capacity, asset geography, customer/end-market claims, official site availability, and North American infrastructure strategy basis.

COUNTING DECISION REQUIRED
State whether this should remain one manager-level portfolio/JV PortCo, be renamed to a disclosed legal platform, be treated as multiple underlying project interests excluded beneath another manager-level holding, or be excluded because no durable operating platform exists. If one record is appropriate, state the precise counting boundary and which projects/subsidiaries must not be separately counted. Do not invent a founding year, headquarters, website, manager-level stake, vehicle, or legal suffix.

RESEARCH RULES
- Resolve canonical identity, aliases, portfolio/JV/project-SPV boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit date, and transaction state. Keep a portfolio-level percentage distinct from project-company percentages.
- Search through 2026-08-19 for subsequent ownership transfers, recapitalizations, exits, project sales, and signed pending transactions.
- Reopen direct pages and filings. Prefer TotalEnergies, KKR, regulatory/filing, project-owner, and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE, or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://totalenergies.com/news/press-releases/renewables-totalenergies-divests-50-14-gw-solar-portfolio-north-america
- https://totalenergies.com/system/files/documents/totalenergies_pr_totalenergies-divests-50-percent-portfolio-in-north-america.pdf
- https://totalenergies.com/system/files/documents/2026-02/totalenergies-results-q4-2025.pdf
- https://www.totalenergies.com/energy-transition/renewable-energies/solar-energy

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
