Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: FlexiVan
MANAGER TO RESOLVE: I Squared Capital; identify all current/former investors and related platforms needed to resolve identity
TASK: ledger:0292:flexivan:05de4d37
CANONICAL KEY: flexivan|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The repository publishes FlexiVan as a current I Squared Capital PortCo. The manager census treated it as an underlying platform consolidated into Transportation Equipment Network (TEN) and proposed removing the separate record. Verify whether FlexiVan actually became part of TEN, remains a distinct chassis-leasing platform, changed name, or was sold.","productionCompanyId":"cmrxpji5n011aivher22cetu6","seedKey":"flexivan|United States","sourceRepoOnlyId":"053-i-squared-capital:repo-only:001:flexivan","relatedQueueTasks":["ledger:0298:transportation-equipment-network:8eb51003","ledger:0494:transportation-equipment-network-ten:c5e0a020"],"startingEvidence":["https://tenleasing.com/en/about/","https://www.prnewswire.com/news-releases/i-squared-capital-combines-flexivan-and-american-intermodal-management-to-create-leading-intermodal-equipment-provider-300993577.html"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"FlexiVan","country":"United States","status":"Active","sector":"Transportation","subsector":"Intermodal chassis leasing","website":"https://www.flexivan.com/","yearFounded":1955,"investmentYear":2020,"headquarters":"United States","owners":[{"firm":"I Squared Capital","vehicle":"n.a.","stake":"controlling interest; exact percentage not disclosed","investmentYear":2020,"isActive":true}],"description":"The repository describes an asset-heavy North American intermodal chassis leasing and management business with a fleet above 120,000 units. It says I Squared combined FlexiVan with American Intermodal Management in January 2020 and acquired control while Castle & Cooke retained a minority interest.","milestones":[{"date":"1955","event":"Public company materials identify FlexiVan's founding year.","category":"Founding"},{"date":"Jan 27, 2020","event":"I Squared announced the combination of FlexiVan and American Intermodal Management and acquisition of control.","category":"Acquisition"}]}

IDENTITY, OWNERSHIP AND CONSOLIDATION QUESTIONS
Verify FlexiVan's current canonical/legal identity, brands, subsidiaries, fleet, services and operating footprint. Reconstruct the 2020 transaction: exact I Squared fund or vehicle, closing versus announcement date, stake/control, Castle & Cooke retention, American Intermodal Management relationship and current ownership. Search through the cutoff for sales, recapitalizations, name changes, platform combinations or signed pending exits. Separately reconstruct TEN's formation and components, including Star Leasing, Commercial Trailer Leasing, Cooling Concepts, North East Trailer Services, TIP Canada and any chassis operations. Require direct evidence before asserting that FlexiVan is owned by, merged into, branded as, or otherwise consolidated beneath TEN. Distinguish intermodal chassis leasing from commercial-trailer leasing and do not merge merely because both are I Squared transportation-equipment platforms. Determine whether FlexiVan remains a manager-level current PortCo, is a former/realized holding, or is truly a duplicate/subsidiary of TEN. If a merge is recommended, identify the surviving canonical company and exact effective date; if evidence disproves consolidation, retain FlexiVan separately and flag the census judgment for correction.

RESEARCH RULES
- Count one manager-level operating company; do not separately count American Intermodal Management, brands, subsidiaries or underlying fleets if legally/operationally beneath FlexiVan.
- Treat FlexiVan and TEN as distinct unless direct company, manager, transaction or regulatory evidence establishes the combination.
- Verify every vehicle, stake, announcement/closing date, current status and exit; use NOT_PUBLICLY_DISCLOSED rather than inference.
- Search both FlexiVan/AIM and TEN-related transactions through 2026-08-19, including later shareholder changes and signed pending sales.
- Reopen direct pages and filings. Prefer FlexiVan, I Squared, TEN, Castle & Cooke, transaction releases and regulatory filings. Use UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.flexivan.com/
- https://www.prnewswire.com/news-releases/i-squared-capital-combines-flexivan-and-american-intermodal-management-to-create-leading-intermodal-equipment-provider-300993577.html
- https://isquaredcapital.com/txnm_strategy/global-equity/page/4/
- https://tenleasing.com/en/about/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
