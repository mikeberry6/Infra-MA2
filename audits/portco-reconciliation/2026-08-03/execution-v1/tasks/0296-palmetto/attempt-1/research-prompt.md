Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Palmetto
MANAGER TO RESOLVE: I Squared Capital; identify all current/former investors and any asset-owning affiliates needed to determine scope
TASK: ledger:0296:palmetto:ba036cf0
CANONICAL KEY: palmetto|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The repository publishes Palmetto as an I Squared Capital PortCo. The manager census excluded it because I Squared invested through its InfraTech venture/growth strategy and Palmetto appeared to be a technology-enabled residential solar sales, financing and services platform rather than a direct infrastructure owner. Reassess that boundary in light of later financing and any LightReach or asset-owning structures.","productionCompanyId":"cmrxpji8s011fivhedek2glrv","seedKey":"palmetto|United States","sourceRepoOnlyId":"053-i-squared-capital:repo-only:006:palmetto","startingEvidence":["https://isquaredcapital.com/txnm_fund/infratech/","https://palmetto.com/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Palmetto","country":"United States","status":"Active","sector":"Power & ET","subsector":"Residential solar and home electrification platform","website":"https://palmetto.com/","yearFounded":null,"investmentYear":2022,"headquarters":"United States","owners":[{"firm":"I Squared Capital","vehicle":"ISQ Global InfraTech Fund","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2022,"isActive":true}],"description":"The repository describes a software-, customer-acquisition-, financing- and service-led residential solar and home-electrification platform rather than one contracted generation portfolio. It identifies I Squared as a 2022 Series C participant through InfraTech and notes later large-scale capital formation.","milestones":[{"date":"Feb 24, 2022","event":"Palmetto announced a $375mm Series C that included I Squared Capital.","category":"Financing"},{"date":"2024","event":"Palmetto announced additional capital for residential energy deployment.","category":"Financing"}]}

IDENTITY, OWNERSHIP AND SCOPE QUESTIONS
Verify Palmetto's canonical/legal identity, products, brands, subsidiaries, financing programs, customer contracts, installed/managed systems, asset ownership and operating footprint. Reconstruct I Squared's investment: exact InfraTech fund/strategy, security, Series C announcement/closing date, stake, current status, dilution and any later sale or exit. Reconstruct all later capital, including any TPG, Macquarie or other supplied-manager involvement, and distinguish corporate equity from warehouse debt, tax equity, asset-backed facilities and project finance. Resolve Palmetto versus Palmetto Finance, LightReach and any special-purpose residential-solar asset owners: determine which entity owns customer systems, long-term PPAs/leases or distributed-generation portfolios, and whether a qualifying infrastructure manager directly owns that asset platform or only Palmetto corporate growth equity. Apply the scope rule at the manager-level company: software, lead generation, installation coordination, consumer finance and third-party asset management do not qualify; ownership/operation of a material contracted distributed-energy portfolio through a qualifying direct-infrastructure mandate may qualify. If no qualifying owner or asset-owning canonical platform exists, recommend removing Palmetto entirely; if a distinct qualifying asset platform exists, identify it without conflating it with the corporate technology company.

RESEARCH RULES
- Require evidence tying any included owner to a direct infrastructure strategy, vehicle or mandate; InfraTech, climate-growth, venture and passive financing exposure is excluded.
- Separate corporate equity, project/warehouse debt, tax equity and ownership of customer-sited solar assets.
- Verify every security, stake, announcement/closing date, current status and exit; do not assume a Series C participant or financing provider controls the company.
- Search through 2026-08-19 for later rounds, restructurings, asset-platform launches, ownership changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Palmetto/LightReach, I Squared, other investors, fund documents, ABS/warehouse filings and regulatory sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://palmetto.com/
- https://www.palmetto.com/about-us
- https://www.prnewswire.com/news-releases/palmetto-raises-375-million-to-accelerate-residential-clean-energy-independence-301490295.html
- https://isquaredcapital.com/txnm_fund/infratech/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
