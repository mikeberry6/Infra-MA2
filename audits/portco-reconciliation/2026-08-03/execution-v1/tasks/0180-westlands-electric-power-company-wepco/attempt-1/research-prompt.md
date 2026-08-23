Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Westlands Electric Power Company (WEPCO)
MANAGERS TO RESOLVE: CIM Group
TASK: ledger:0180:westlands-electric-power-company-wepco:952fb626
CANONICAL KEY: westlands-electric-power-company-wepco|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CORRECT_COMPANY"],"rationale":"The census holding is Permanent Power Company, while the exact production identity is WEPCO. Determine whether Permanent Power is a rename, successor, parent, expanded platform or separate company before correcting the canonical record.","censusRows":[{"manager":"CIM Group","holdingId":"030-cim-group:holding:002:permanent-power-company","evidenceUrls":["https://www.cimgroup.com/press-releases/cim-group-launches-permanent-power-company-a-national-power-infrastructure-company"]}],"repoOnlyRows":[],"repoRows":[{"productionCompanyId":"cmrxpjbw800rsivhe6s7g89eh","seedKey":"westlands electric power company (wepco)|United States","sourcePresence":"BOTH"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjbw800rsivhe6s7g89eh","name":"Westlands Electric Power Company (WEPCO)","country":"United States","status":"Active","sector":"Power & ET","subsector":"Utility-scale solar and battery storage","yearFounded":2025,"investmentYear":2025,"headquarters":"California","description":"The repository treats WEPCO as a CIM-sponsored platform formed in 2025 to hold seven solar-generation facilities and one battery-storage facility at Westlands Solar Park and to grow through development and acquisitions. A later CIM source launches Permanent Power Company as a national power-infrastructure company, creating an unresolved identity/successor question.","owners":[{"firm":"CIM Group","vehicle":"CIM Infrastructure Platform","investmentYear":2025,"stake":"Not publicly disclosed","isActive":true}],"milestones":[{"date":"Mar 2, 2020","event":"CIM started construction at Westlands Solar Park, the asset base later used for WEPCO.","category":"Expansion"},{"date":"2025","event":"CIM said WEPCO's initial portfolio included seven solar facilities and one battery facility.","category":"Expansion"},{"date":"Oct 13, 2025","event":"CIM announced formation of Westlands Electric Power Company.","category":"Financing"}],"sources":[{"url":"https://www.cimgroup.com/press-releases/cim-group-forms-westlands-electric-power-company"},{"url":"https://www.cimgroup.com/our-platforms/infrastructure"},{"url":"https://renewablesnow.com/news/us-real-estate-firm-cim-groups-gw-level-renewables-ops-into-new-entity-1283241/"}]}

RELATED RECORDS AND IDENTITY QUESTIONS
Westlands Solar Park (including Aquamarine Solar) also exists as a separate production row under CIM. Determine the exact legal and operating relationships among WEPCO, Permanent Power Company, Westlands Solar Park, Aquamarine Solar and the individual generation/storage facilities. Verify whether Permanent Power is a rename or successor to WEPCO, a new parent/national platform, or a separate entity; whether WEPCO remains active; which identity is current; and whether the Westlands Solar Park row should remain separate or be represented as underlying assets/history beneath one manager-level platform.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, predecessor/successor names, and platform-versus-subsidiary/project boundaries.
- Determine whether one current manager-level operating platform should represent the portfolio. Exclude individual solar/storage facilities, project SPVs and site names beneath it.
- Verify every current and former direct owner, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer a fund, stake or closing.
- Search through 2026-08-19 for formation, contribution, merger, rename, successor launch, sale, transfer, recapitalization, project disposition and signed pending transactions.
- Verify geography, official website if distinct, headquarters, founding year, products/services, customers/offtakers, footprint, disclosed capacity and current operating status.
- Reopen direct pages. Prefer CIM, company, regulator/filing, project and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.cimgroup.com/press-releases/cim-group-launches-permanent-power-company-a-national-power-infrastructure-company
- https://www.cimgroup.com/press-releases/cim-group-forms-westlands-electric-power-company
- https://www.cimgroup.com/our-platforms/infrastructure
- https://renewablesnow.com/news/us-real-estate-firm-cim-groups-gw-level-renewables-ops-into-new-entity-1283241/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
