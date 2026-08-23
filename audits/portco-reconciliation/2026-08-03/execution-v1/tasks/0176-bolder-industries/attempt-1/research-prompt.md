Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Bolder Industries
MANAGERS TO RESOLVE: CIM Group; Tiger Infrastructure Partners
TASK: ledger:0176:bolder-industries:57e25d60
CANONICAL KEY: bolder-industries|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_OWNER"],"rationale":"The exact normalized company identity is established; Tiger Infrastructure Partners ADD_OWNER requires individual review.","censusRows":[{"manager":"CIM Group","holdingId":"030-cim-group:holding:005:bolder-industries"},{"manager":"Tiger Infrastructure Partners","holdingId":"093-tiger-infrastructure-partners:holding:009:bolder-industries"}],"repoOnlyRows":[],"repoRows":[{"productionCompanyId":"cmrxpjbsf00rlivhe8c3xqhxg","seedKey":"bolder industries|United States","sourcePresence":"BOTH"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjbsf00rlivhe8c3xqhxg","name":"Bolder Industries","country":"United States","status":"Active","sector":"Power & ET","subsector":"Circular materials and tire recycling","yearFounded":2011,"investmentYear":2021,"headquarters":"Colorado; Missouri","description":"The repository describes Bolder as an asset-heavy circular-materials platform that converts end-of-life tires into recovered carbon black, petrochemical products and steel. It records CIM Group as an active owner from a 2021 expanded investment and Tiger as an active owner from a February 2025 growth investment, but does not resolve whether Tiger replaced or joined CIM or disclose stakes.","owners":[{"firm":"CIM Group","vehicle":"CIM Infrastructure Platform","investmentYear":2021,"stake":"Not publicly disclosed","isActive":true},{"firm":"Tiger Infrastructure Partners","vehicle":"n.a.","investmentYear":2025,"stake":"Not publicly disclosed","isActive":true}],"milestones":[{"date":"2011","event":"Bolder Industries was founded.","category":"Founding"},{"date":"2020","event":"Bolder opened its Maryville, Missouri facility.","category":"Expansion"},{"date":"Oct 8, 2021","event":"CIM Group announced it had expanded its investment in Bolder.","category":"Financing"},{"date":"Feb 10, 2025","event":"Tiger announced completion of a transformational growth investment.","category":"Financing"}],"sources":[{"url":"https://www.bolderindustries.com/"},{"url":"https://www.tigerinfrastructure.com/portfolio/Bolder-Industries"},{"url":"https://www.prnewswire.com/news-releases/tiger-infrastructure-partners-completes-transformational-growth-investment-in-bolder-industries-a-circular-economy-infrastructure-platform-converting-end-of-life-tires-into-sustainable-materials-302372336.html"},{"url":"https://www.cimgroup.com/press-releases/cim-group-expands-investment-in-end-of-life-tire-recycling-company-bolder-industries-a-certified-b-corporation"}]}

OWNERSHIP QUESTION TO RESOLVE
Verify the original CIM investment and exact 2021 transaction, the legal close and form of Tiger's February 2025 investment, whether Tiger became controlling/majority or joined existing investors, and whether CIM remained an owner after the Tiger close. Identify disclosed funds, vehicles and stakes without inference. Search for any subsequent sale, recapitalization, restructuring, plant closure, insolvency or ownership transfer through the as-of date.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, predecessor/successor names, and platform-versus-facility/project boundaries.
- Determine whether Bolder is a manager-level infrastructure operating platform. Exclude Maryville, Terre Haute and other facilities or projects as separate PortCos.
- Verify every current and former direct owner, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer a fund, stake, control position or closing.
- Search through 2026-08-19 for sale, sold, exit, divestiture, transfer, recapitalization, merger, rebrand, bankruptcy, shutdown and signed pending transactions.
- Verify geography, official website, headquarters, founding year, products/services, customers/end markets, footprint, disclosed scale and current operating status.
- Reopen direct pages. Prefer company, manager, regulator/filing, lender and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.bolderindustries.com/
- https://www.tigerinfrastructure.com/portfolio/Bolder-Industries
- https://www.prnewswire.com/news-releases/tiger-infrastructure-partners-completes-transformational-growth-investment-in-bolder-industries-a-circular-economy-infrastructure-platform-converting-end-of-life-tires-into-sustainable-materials-302372336.html
- https://www.cimgroup.com/press-releases/cim-group-expands-investment-in-end-of-life-tire-recycling-company-bolder-industries-a-certified-b-corporation

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
