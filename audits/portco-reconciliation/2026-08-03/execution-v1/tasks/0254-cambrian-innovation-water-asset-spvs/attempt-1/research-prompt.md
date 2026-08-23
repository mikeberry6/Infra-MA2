Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Cambrian Innovation Water Asset SPVs
MANAGERS TO RESOLVE: Generate Capital; Cambrian Innovation; Pennybacker Capital; identify all direct current and former corporate and project-asset owners
TASK: ledger:0254:cambrian-innovation-water-asset-spvs:a5691d5c
CANONICAL KEY: cambrian-innovation-water-asset-spvs|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"The repository treats Generate/Cambrian project-finance SPVs as an active PortCo. The accepted manager review proposed retirement because Cambrian was acquired and recapitalized by Pennybacker in 2023 with no current Generate ownership evidence. Verify what Generate actually owned and whether its position survived.","productionCompanyId":"cmrxpjfxp00xxivhe1mkhiraq","seedKey":"cambrian innovation water asset spvs|United States","startingEvidence":["https://cambrianinnovation.com/news/cambrian-a-leader-in-wastewater-treatment-water-reuse-and-energy-recovery-as-a-service-is-acquired-by-and-receives-200-million-growth-equity-commitment-from-pennybacker"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Cambrian Innovation Water Asset SPVs","country":"United States","status":"Active","sector":"Utilities","subsector":"Industrial water reuse and wastewater treatment","investmentYear":2015,"headquarters":"Multiple U.S. states","owners":[{"firm":"Generate Capital","vehicle":"Joint SPV","investmentYear":2015,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"description":"The repository describes project vehicles financing industrial wastewater treatment, water reuse and energy-recovery infrastructure under Water-Energy Purchase Agreements. It records a 2015 US$30 million financing vehicle led by Generate, later capital programs, Pennybacker's 2023 corporate acquisition of Cambrian and a 2025 ING credit facility, but does not establish surviving Generate ownership.","milestones":[{"date":"Nov 18, 2015","event":"Cambrian announced a US$30 million WEPA financing vehicle.","category":"Financing"},{"date":"Oct 30, 2019","event":"Cambrian announced a dedicated project-capital program.","category":"Financing"},{"date":"Nov 16, 2023","event":"Pennybacker acquired Cambrian and committed US$200 million.","category":"Financing"},{"date":"Jun 4, 2025","event":"Cambrian announced a US$150 million ING credit facility.","category":"Financing"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve whether there was one legally named Generate/Cambrian platform, multiple project SPVs, a financing fund, or only project-by-project capital arrangements. Identify every legal entity found, what Generate owned (corporate equity, project equity, debt, managed-account or asset title), exact stake, commitment/funding dates and underlying projects. Reconstruct the 2023 Pennybacker acquisition: seller(s), corporate versus project scope, exact closing date, whether project SPVs transferred, whether Generate sold or retained any rights, and current ownership after the 2025 ING facility. Distinguish corporate ownership of Cambrian from project-asset equity and lending. Search through the as-of date for later sale, transfer, recapitalization, refinancing, fund wind-down, Generate exit or signed pending transaction. Decide whether to retain Cambrian Innovation as the manager-level company under Pennybacker, merge/rename the SPV record, retire only Generate's period, or exclude unnamed asset SPVs.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, company/project-SPV/fund boundary, direct owners and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing/funding date, entry date, exit date and transaction state. Distinguish corporate equity, project equity, debt and service/technology-provider roles.
- Search through 2026-08-19 for acquisition close, sale, transfer, refinancing, recapitalization, fund/SPV wind-down and signed pending transactions.
- Verify project/customer scale, deployed facilities, service model, geography and current operating continuity.
- Reopen direct pages and filings. Prefer Cambrian, Generate, Pennybacker, ING, legal/transaction-party, regulatory/UCC and project/customer sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://cambrianinnovation.com/news/cambrian-a-leader-in-wastewater-treatment-water-reuse-and-energy-recovery-as-a-service-is-acquired-by-and-receives-200-million-growth-equity-commitment-from-pennybacker
- https://cambrianinnovation.com/
- https://www.mintz.com/industries-practices/case-studies/mintz-helps-cambrian-innovation-generate-capital
- https://www.cambrianinnovation.com/news/cambrian-innovation-launches-30m-fund-to-finance-distributed-clean-water-solutions
- https://generatecapital.com/investment/
- https://cambrianinnovation.com/news/cambrian-and-ing-announce-150-million-facility

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
