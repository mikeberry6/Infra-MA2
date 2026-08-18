Research one North American infrastructure portfolio-company reconciliation as of 2026-08-18. Use current web research, open direct pages, and search both acquisitions and later exits/secondaries. Treat every census field as a claim to verify.

REQUESTED COMPANY: Montreal Gateway Terminals
MANAGER TASK: Axium Infrastructure
QUEUE DECISION TO TEST: create one canonical Montreal Gateway Terminals PortCo and add Axium Infrastructure as a current owner only if direct current evidence and the acquisition/exit history support it.

CURRENT REPOSITORY AND CENSUS POSITION
- Production and evaluated seed contain no exact Montreal Gateway Terminals company record.
- The July 2026 manager census treats Montreal Gateway Terminals as a manager-level Canadian transportation-infrastructure company, not a subsidiary or individual terminal project.
- The census records Axium Infrastructure as current, but has no verified fund, holding vehicle, stake or investment date. Its only source is Axium's live portfolio page.
- Axium's portfolio page describes Montreal Gateway Terminals as a current port-terminal investment in Montreal, Quebec. Reopen and verify it; do not rely on the census summary.

RESEARCH AND DECISION RULES
- Resolve Montreal Gateway Terminals, Montreal Gateway Terminals Partnership, MGT, any predecessor or successor legal entities, the Port of Montreal / Montreal Port Authority, Cast and Racine terminals, and similarly named operators.
- Decide the manager-level PortCo boundary. Count the terminal operating/concession company once. Do not separately count the Port of Montreal authority, individual terminals, cranes, berths or project assets beneath the operator. Determine whether Termont Montreal is separate and exclude it unless evidence proves it is part of the same canonical platform.
- Verify canonical legal/display name, aliases, official website, headquarters/operating location, geography, infrastructure-strategy basis, products/services, customers/end markets, footprint, publicly disclosed scale and current operating status.
- Establish the complete equity-owner history relevant to current ownership: seller(s), buyer consortium members, Axium organization identity, fund or vehicle, disclosed stake, announcement and legal closing dates, later transfers, co-owner changes and any current co-owners. Do not infer equal stakes or a fund from manager branding.
- Search explicitly through 2026-08-18 for sale, sold, divestiture, secondary, transfer, recapitalization, concession termination, bankruptcy and signed pending exit involving Montreal Gateway Terminals, each identified owner and the terminal operating rights. A stale acquisition release or portfolio page alone is insufficient.
- Distinguish equity ownership from lenders, customers, shipping lines, contractors, the port authority and terminal users. Exclude debt-only and commercial relationships.
- Signed transactions remain pending until close. Use CLOSED_ACTIVE, SIGNED_PENDING_INCOMING, SIGNED_PENDING_EXIT or REALIZED.
- Prefer official company, Axium, co-owner, Port of Montreal, government, competition/regulatory, pension and filing sources. Open direct URLs; do not rely on search-result snippets.
- A new company requires verified identity, Canadian geography, transportation classification, active ownership, a concise description, at least one investment milestone and one primary ownership source.
- Use NOT_PUBLICLY_DISCLOSED for noncritical gaps. Use UNRESOLVED only for material identity or active-ownership uncertainty; that blocks creation.
- Return PROPOSED_NEW if one list-ready canonical company should be created. Return PROPOSED_CORRECTION if the census identity or ownership is materially wrong but a list-ready correction is supported. Return EXCLUDED if this is not a direct manager-level infrastructure holding. Return DEFERRED only for material unresolved identity or active ownership.

STARTING SOURCE TO REOPEN
- https://www.axiuminfra.com/portfolio-assets/?lang=en

TRANSPORT REQUIREMENT — IMPORTANT
Do not use a code fence, backticks, a preformatted block, a canvas, or an attached file. Return JSON as ordinary plain text between literal markers, followed by a concise Markdown review between separate markers:

BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise paragraph stating the decision, canonical boundary, current owner/fund/vehicle/stake/date treatment, exit-search conclusion and any blocker.
END_REVIEW

Keep the complete response under 7,500 characters, use no more than 8 evidence rows and 4 milestones, and keep strings concise. Every top-level key below is mandatory:

{"asOfDate":"2026-08-18","requestedCompany":"Montreal Gateway Terminals","requestedManager":"Axium Infrastructure","decision":"PROPOSED_NEW|PROPOSED_CORRECTION|EXCLUDED|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","canonicalDisplayName":"","aliases":[],"officialWebsite":null,"headquartersOrOperatingLocation":null,"country":"Canada","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentInfrastructureManagerOwners":[],"formerInfrastructureManagerOwners":[],"pendingOwnershipTransactions":[],"duplicateOwnerAction":""},"operatingResolution":{"sector":"TRANSPORTATION","subsector":"Marine container terminals","region":"NORTH_AMERICA","countryTags":["Canada"],"description":"","companyStatus":"ACTIVE|REALIZED","yearFounded":null,"productsAndServices":"","customersAndEndMarkets":"","footprint":"","disclosedScale":[]},"acquisitionExitCheck":{"entry":"","currentStatus":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}

Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Milestone keys only: date,event,category,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
