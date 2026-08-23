Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: ChillCo
MANAGER TO RESOLVE: Igneo Infrastructure Partners; identify the exact fund/vehicle and all current/former owners
TASK: ledger:0308:chillco:26fda8bd
CANONICAL KEY: chillco|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"The Igneo census identifies a current U.S. cold-storage platform launched through the acquisition of Mattingly Cold Storage, but no production or seed company exists. Verify its legal identity, platform boundary, ownership and closing before proposing creation.","productionCompanyId":null,"seedKey":null,"sourceHoldingId":"056-igneo-infrastructure-partners:holding:011:chillco","startingEvidence":["https://www.chillco-logistics.com/","https://www.igneoip.com/asia/en/institutional/our-offering/assets/chillco.html","https://www.igneoip.com/usa/en/institutional/news-and-insights/press/igneo-announces-establishment-of-cold-storage-platform-with-acquisition-of-mattingly.html"]}

CURRENT CENSUS SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"ChillCo","website":"https://www.chillco-logistics.com/","country":"United States","status":"Active","sector":"Transportation","subsector":"Temperature-controlled warehousing and cold-chain logistics","headquarters":"Zanesville, Ohio","investmentYear":null,"owners":[{"firm":"Igneo Infrastructure Partners","vehicle":"NOT_PUBLICLY_DISCLOSED","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":null,"isActive":true}],"descriptionClaim":"A multi-temperature post-production cold-storage platform centered on the former Mattingly Cold Storage facility in Zanesville, Ohio."}

IDENTITY, OWNERSHIP AND PLATFORM QUESTIONS
Resolve the exact legal/trade identity of ChillCo and its relationship to Mattingly Cold Storage, acquisition entities and any later add-ons. Reconstruct Igneo's establishment of the platform: agreement date, legal closing date, seller, exact fund/vehicle, stake/control, retained management or rollover equity and transaction state. Determine when the ChillCo brand/platform became effective and whether Mattingly continues as a subsidiary/brand or was renamed. Search through the cutoff for add-on acquisitions, new facilities, ownership changes, recapitalizations, exits and signed pending transactions. Verify headquarters, facility count/location, square footage/capacity, temperature zones, services, food-sector customers/end markets and active operating status. Define one manager-level canonical boundary: count ChillCo once and treat Mattingly, individual warehouses, property entities and projects as predecessor/subsidiary/assets unless direct evidence establishes another independently managed fund investment.

RESEARCH RULES
- Require direct evidence for the platform identity, Igneo infrastructure-strategy ownership, fund/vehicle, stake/control, announcement/closing date and current status. Use NOT_PUBLICLY_DISCLOSED rather than inference.
- Do not count Mattingly or an individual facility as a second PortCo beneath the ChillCo platform.
- Distinguish legal closing from announcement, facility/real-estate ownership from platform equity and management contracts from ownership.
- Search through 2026-08-19 for add-ons, later owner changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer ChillCo, Igneo, sellers/advisers, property/corporate records and transaction releases. Use UNRESOLVED for material identity or current ownership; either blocks application.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.chillco-logistics.com/
- https://www.igneoip.com/asia/en/institutional/our-offering/assets/chillco.html
- https://www.igneoip.com/usa/en/institutional/news-and-insights/press/igneo-announces-establishment-of-cold-storage-platform-with-acquisition-of-mattingly.html

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
