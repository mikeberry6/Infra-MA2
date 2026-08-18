Research one North American infrastructure portfolio-company reconciliation as of 2026-08-18. Use current web research, open direct pages, and search both acquisitions and later exits/secondaries. Treat every census and repository field as a claim to verify.

REQUESTED COMPANY: Fatbeam
MANAGER TASK: Basalt Infrastructure Partners
QUEUE DECISION TO TEST: the manager census maps Fatbeam to the existing canonical company and proposes CORRECT_COMPANY. Determine whether any identity, ownership, vehicle, dates, geography, status, description, milestone, or evidence correction is actually required and recommend one exact list action.

CURRENT REPOSITORY AND CENSUS POSITION
- One published U.S. company exists: Fatbeam, production ID cmrxpj8de00m8ivhe8aczjldv.
- Current repository identity: a fiber-network operator serving commercial, education, government, carrier, and residential customers across eight western U.S. states and more than 150 cities; founded in 2010.
- Current repository ownership: Basalt Infrastructure Partners, active from 2023, vehicle “Basalt III,” stake not publicly disclosed, CLOSED_ACTIVE. No pending ownership transaction exists.
- Current description says Basalt acquired Fatbeam from SDC Capital Partners and the founders in 2023. The repository milestone records only Basalt's March 27, 2023 agreement announcement, not a verified closing.
- Current repository website is null even though https://www.fatbeamfiber.com/ is cited. Headquarters is incorrectly represented as a list of eight operating states rather than a headquarters location.
- Census evidence: Basalt's March 27, 2023 agreement release and its live Fatbeam portfolio page. The census does not establish a later close date, exact fund legal name, stake, or exit search.

RESEARCH AND DECISION RULES
- Resolve Fatbeam, Fatbeam LLC and any holding-company/legal aliases, predecessor or successor names, SDC Capital Partners, the founders, Basalt, and any later buyer. Count the manager-level fiber platform once; do not count acquired local networks, individual fiber routes, customers, or subsidiaries as separate PortCos unless they are independently owned manager-level platforms.
- Determine whether Basalt's March 27, 2023 transaction merely signed, closed contemporaneously, or closed later. Search official Basalt, Fatbeam, SDC, FCC/regulatory, financing and reliable transaction sources for a definitive close or current shareholder statement.
- Verify every current and former equity owner, stake, announcement date, legal closing date if public, investment vehicle/fund, and current status. Do not assume “Basalt III” is the correct vehicle; use the exact disclosed fund/vehicle or NOT_PUBLICLY_DISCLOSED.
- Search explicitly through 2026-08-18 for sale, sold, divestiture, secondary, transfer, recapitalization, merger, rebrand, bankruptcy, signed pending exit, or later ownership change involving Fatbeam or the Basalt interest.
- Distinguish direct equity ownership from lenders, network partners, customers, service resellers, acquired operating assets, and prior owner SDC after its exit.
- Verify canonical identity, legal form, aliases, official website, headquarters, founding year, geography, infrastructure-strategy basis, products/services, customers/end markets, network footprint, disclosed scale and operating status. Do not turn the operating footprint into the headquarters field.
- Reconcile whether eight states / 150+ cities / 1,250 route miles remain current and attributable; date any scale metric and avoid combining unlike source dates.
- Signed transactions remain pending until close. Use CLOSED_ACTIVE, SIGNED_PENDING_INCOMING, SIGNED_PENDING_EXIT or REALIZED.
- Prefer official company, Basalt, SDC, FCC/regulatory, government, financing and filing sources. Open direct URLs; do not rely on search-result snippets.
- Return PROPOSED_CORRECTION if any material repository field should change, including headquarters, website, vehicle, entry treatment, description, milestone or evidence. Return VERIFIED_NO_CHANGE only if the repository is accurate and the queue correction can be rejected without any company change. Return DEFERRED only for material unresolved identity or active ownership.
- Use NOT_PUBLICLY_DISCLOSED for noncritical gaps. Use UNRESOLVED only for material identity or active-ownership uncertainty.

STARTING SOURCES TO REOPEN
- https://www.basaltinfra.com/2023/03/27/basalt-infrastructure-partners-enters-into-agreement-to-acquire-fatbeam/
- https://www.basaltinfra.com/portfolio/fatbeam/
- https://www.fatbeamfiber.com/
- https://www.fatbeamfiber.com/our-network
- https://www.fatbeamfiber.com/media-news/fatbeam-is-growing

TRANSPORT REQUIREMENT — IMPORTANT
Do not use a code fence, backticks, a preformatted block, a canvas, or an attached file. Return JSON as ordinary plain text between literal markers, followed by a concise Markdown review between separate markers:

BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise paragraph stating the decision, canonical boundary, current/former owner and fund/vehicle/stake/date treatment, closing and exit-search conclusion and any blocker.
END_REVIEW

Keep the complete response under 7,500 characters, use no more than 8 evidence rows and 4 milestones, and keep strings concise. Every top-level key below is mandatory:

{"asOfDate":"2026-08-18","requestedCompany":"Fatbeam","requestedManager":"Basalt Infrastructure Partners","decision":"PROPOSED_CORRECTION|VERIFIED_NO_CHANGE|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","canonicalDisplayName":"","aliases":[],"officialWebsite":null,"headquartersOrOperatingLocation":null,"country":"United States","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentInfrastructureManagerOwners":[],"formerInfrastructureManagerOwners":[],"pendingOwnershipTransactions":[],"duplicateOwnerAction":""},"operatingResolution":{"sector":"DIGITAL","subsector":"Fiber broadband","region":"NORTH_AMERICA","countryTags":["United States"],"description":"","companyStatus":"ACTIVE|REALIZED","yearFounded":null,"productsAndServices":"","customersAndEndMarkets":"","footprint":"","disclosedScale":[]},"acquisitionExitCheck":{"entry":"","currentStatus":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}

Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Milestone keys only: date,event,category,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
