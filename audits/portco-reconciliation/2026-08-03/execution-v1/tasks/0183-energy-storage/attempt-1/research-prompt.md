Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Energy Storage
MANAGERS TO RESOLVE: Copenhagen Infrastructure Partners
TASK: ledger:0183:energy-storage:95c2200d
CANONICAL KEY: energy-storage|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Accepted repo-only judgment says the generic Energy Storage umbrella label is reconciled across separately counted Beehive, Scatter Wash, Goldendale and Swan Lake North projects. Verify whether no standalone company exists and retire or consolidate the generic row without merging distinct assets together.","censusRows":[],"repoOnlyRows":[{"manager":"Copenhagen Infrastructure Partners","disposition":"MATCHED_ELSEWHERE","rationale":"Generic umbrella label; underlying standalone assets are counted separately.","evidenceUrls":["https://goldendaleenergystorage.com/project.html","https://www.edf-re.com/press-release/copenhagen-infrastructure-partners-acquires-beehive-battery-energy-storage-system-in-arizona-from-edf-power-solutions-north-america/","https://www.globenewswire.com/news-release/2024/09/24/2952556/0/en/CIP-Acquires-1-GWh-Scatter-Wash-Battery-Energy-Storage-Project-in-Arizona-from-Strata-Clean-Energy-and-Signs-Construction-and-Asset-Management-Agreements-with-Strata.html","https://www.slenergystorage.com/project.html"]}],"repoRows":[{"productionCompanyId":"cmrxpjc2f00rzivhet6bxi4hg","seedKey":"energy storage|United States","sourcePresence":"BOTH"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjc2f00rzivhet6bxi4hg","name":"Energy Storage","country":"United States","status":"Active","sector":"Power & ET","subsector":"Battery and long-duration energy storage portfolio","investmentYear":2020,"headquarters":"Arizona; Washington; Oregon","description":"The repository aggregates CIP's U.S. battery and pumped-storage investments—Beehive, Scatter Wash, Goldendale and Swan Lake North—under a generic Energy Storage row even though public sources describe separate projects and vehicles.","owners":[{"firm":"Copenhagen Infrastructure Partners","vehicle":"Copenhagen Infrastructure IV (CI IV)","investmentYear":2020,"stake":"Not publicly disclosed","isActive":true}],"milestones":[{"date":"Nov 13, 2020","event":"CIP acquired Swan Lake and Goldendale on behalf of CI IV.","category":"Acquisition"},{"date":"2025","event":"A CI V disclosure reported Scatter Wash entered operations.","category":"Expansion"},{"date":"Aug 15, 2025","event":"CIP announced acquisition of Beehive in Arizona.","category":"Acquisition"}],"sources":[{"url":"https://www.cip.com/about-cip/"},{"url":"https://www.cip.com/funds/flagship-funds/"},{"url":"https://www.renewableenergyworld.com/energy-storage/pumped-storage/cip-acquires-393-mw-swan-lake-1200-mw-goldendale-pumped-storage-hydro-projects-in-u-s/"},{"url":"https://www.cip.com/media/oljjxc22/cip-annual-report-2024.pdf"}]}

BOUNDARY QUESTION TO RESOLVE
Determine whether "Energy Storage" is any legal company, named fund platform, holding company or operating business, or merely a sector/portfolio heading assembled by the repository. Verify ownership, funds/vehicles, closing dates and current status separately for Beehive, Scatter Wash, Goldendale and Swan Lake North. Do not combine distinct project companies or CI IV and CI V positions into a fabricated cap table. Recommend the correct treatment for the generic row and identify the separately retained canonical assets.

RESEARCH RULES
- Resolve identity and project/SPV/platform boundaries. A sector label is not a canonical company.
- Determine whether any manager-level platform legitimately unifies the assets. If not, exclude/retire the generic row while preserving each supported standalone asset.
- Verify every current and former direct owner, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state for each asset. Do not infer a fund, stake or closing.
- Search through 2026-08-19 for sale, transfer, financial close, operations, cancellation and signed pending transactions for all named assets.
- Verify geography, technology, capacity, project stage and current status.
- Reopen direct pages. Prefer CIP, seller/company, regulator/filing and project sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://goldendaleenergystorage.com/project.html
- https://www.edf-re.com/press-release/copenhagen-infrastructure-partners-acquires-beehive-battery-energy-storage-system-in-arizona-from-edf-power-solutions-north-america/
- https://www.globenewswire.com/news-release/2024/09/24/2952556/0/en/CIP-Acquires-1-GWh-Scatter-Wash-Battery-Energy-Storage-Project-in-Arizona-from-Strata-Clean-Energy-and-Signs-Construction-and-Asset-Management-Agreements-with-Strata.html
- https://www.slenergystorage.com/project.html

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
