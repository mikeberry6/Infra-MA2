Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Westlands Solar Park (incl. Aquamarine Solar)
MANAGERS TO RESOLVE: CIM Group
TASK: ledger:0181:westlands-solar-park-incl-aquamarine-solar:31dd05e4
CANONICAL KEY: westlands-solar-park-incl-aquamarine-solar|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Accepted CIM Group repo-only judgment proposes consolidation because Westlands Solar Park and Aquamarine appear to be underlying assets beneath the manager-level Permanent Power Company platform. Verify the canonical keep record and boundary before any merge.","censusRows":[],"repoOnlyRows":[{"manager":"CIM Group","disposition":"MATCHED_ELSEWHERE","rationale":"Underlying assets are consolidated beneath the manager-level Permanent Power Company platform.","evidenceUrls":["https://www.cimgroup.com/press-releases/cim-group-launches-permanent-power-company-a-national-power-infrastructure-company","https://www.cimgroup.com/press-releases/westlands-solar-park-one-of-the-largest-permitted-solar-parks-in-the-world-and-the-largest-in-north-america-starts-construction"]}],"repoRows":[{"productionCompanyId":"cmrxpjbws00rtivhebkd663iz","seedKey":"westlands solar park (incl. aquamarine solar)|United States","sourcePresence":"BOTH"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjbws00rtivhebkd663iz","name":"Westlands Solar Park (incl. Aquamarine Solar)","country":"United States","status":"Active","sector":"Power & ET","subsector":"Utility-scale solar and battery storage","investmentYear":2014,"headquarters":"California","description":"The repository treats Westlands Solar Park as a CIM-sponsored California renewable development that can exceed 2,700 MW at full build-out and includes Aquamarine Solar. It records CIM entry in 2014 and construction start in 2020, but later CIM sources place seven solar facilities and one battery facility into WEPCO and then launch Permanent Power as the manager-level platform.","owners":[{"firm":"CIM Group","vehicle":"CIM Infrastructure Platform","investmentYear":2014,"stake":"Not publicly disclosed","isActive":true}],"milestones":[{"date":"2014","event":"CIM and a joint-venture partner obtained rights to acquire more than 20,000 acres for the development.","category":"Acquisition"},{"date":"Mar 2, 2020","event":"CIM announced construction start at Westlands Solar Park.","category":"Financing"},{"date":"2025","event":"CIM said WEPCO's initial portfolio included seven solar facilities and one battery facility at Westlands.","category":"Expansion"}],"sources":[{"url":"https://www.cimgroup.com/case-studies/aquamarine-solar-project"},{"url":"https://www.cimgroup.com/press-releases/westlands-solar-park-one-of-the-largest-permitted-solar-parks-in-the-world-and-the-largest-in-north-america-starts-construction"},{"url":"https://www.cimgroup.com/press-releases/cim-group-forms-westlands-electric-power-company"},{"url":"https://labusinessjournal.com/infrastructure/first-phase-cim-groups-massive-solar-park-central/"}]}

RELATED CANONICAL RECORDS TO TEST
WEPCO exists separately in production, and the census identifies Permanent Power Company. Determine the exact legal and operational relationships among Permanent Power, WEPCO, Westlands Solar Park, Aquamarine Solar and the other seven solar/one battery facilities. Verify whether Westlands is now wholly represented as underlying assets of Permanent Power/WEPCO, whether any separate JV owner remains, and whether one platform record plus aliases/history/asset references is the correct manager-level boundary.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, owners and platform-versus-site/project/SPV boundaries.
- Determine whether Westlands remains a standalone manager-level PortCo or should be merged into the current operating platform. Preserve 2014 entry and project-development history if consolidation is recommended.
- Verify every current and former direct owner, organization, fund/vehicle, stake, announcement date, legal closing date, contribution/transfer date, exit date and transaction state. Do not infer a fund, stake or closing.
- Search through 2026-08-19 for contribution, formation, rename, sale, transfer, recapitalization, project disposition, cancellation and signed pending transactions.
- Verify geography, capacity, land footprint, project/operating status, customers/offtakers and current asset composition.
- Reopen direct pages. Prefer CIM, company, regulator/filing, project and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.cimgroup.com/press-releases/cim-group-launches-permanent-power-company-a-national-power-infrastructure-company
- https://www.cimgroup.com/press-releases/cim-group-forms-westlands-electric-power-company
- https://www.cimgroup.com/press-releases/westlands-solar-park-one-of-the-largest-permitted-solar-parks-in-the-world-and-the-largest-in-north-america-starts-construction
- https://www.cimgroup.com/case-studies/aquamarine-solar-project
- https://labusinessjournal.com/infrastructure/first-phase-cim-groups-massive-solar-park-central/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
