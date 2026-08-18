Research one North American infrastructure portfolio-company reconciliation as of 2026-08-18. Use current web research, open direct pages, and search both acquisitions and later exits/secondaries. Treat every repo and census field as a claim to verify.

REQUESTED COMPANY: Axium Aster & Axium Bloom
MANAGER TASK: Axium Infrastructure
QUEUE TARGET: proposed new Canadian company; no exact production target is currently bound.

KNOWN IDENTITY / PLATFORM-BOUNDARY CONFLICT
- The manager census treats “Axium Aster & Axium Bloom” as a separate current Canadian social-infrastructure platform and proposed new company, based only on Axium's portfolio page.
- Production already contains company cmrxpj7m000l1ivhezpjsd4h1, “AgeCare Facilities Portfolio.” Its current description groups: (a) a 2020 Axium/AgeCare partnership for five Alberta facilities; (b) a claimed 92.5% Ontario portfolio of 16 facilities / 2,418 beds; and (c) a claimed 92.5% Aster and Bloom portfolio in Alberta and British Columbia totaling 26 facilities / 4,114 beds.
- Production currently assigns AgeCare Facilities Portfolio one active Axium Infrastructure owner via “Axium Managed Funds,” entry 2020, with manager-level stake not disclosed. Its sources are Axium's portfolio page, Axium's Jan. 8, 2020 Alberta partnership announcement/PDF, and AgeCare's website.
- Independently determine whether Aster and Bloom are: one or two distinct Axium investment portfolios; aliases/components of the existing AgeCare Facilities Portfolio; separate legal/property portfolios operated by AgeCare; or underlying assets that should not be separately counted.
- Do not create a duplicate merely because Axium uses multiple project names. Conversely, do not collapse legally or transactionally distinct manager-level investments merely because AgeCare operates them.

CURRENT AGECARE CLAIMS TO VERIFY
- Active Canadian long-term-care platform across Ontario, Alberta and British Columbia; entry 2020; no official company website; operating website https://www.agecare.ca/.
- The 2020 Axium/AgeCare announcement covers five Alberta continuing-care facilities totaling 1,402 beds.
- Current seed copy claims separate 92.5% Ontario and Aster/Bloom interests, but the production owner row has no stake and no direct closing history for those later portfolios.
- No current exit or pending transaction is recorded.

RESEARCH AND DECISION RULES
- Resolve Aster, Bloom, Project Aster, Project Bloom, AgeCare, AgeCare Facilities Portfolio, relevant legal owners/holding companies, facility portfolios, operators and aliases.
- Determine the proper manager-level PortCo boundary and whether the current AgeCare record should remain, be narrowed, renamed, split, corrected, merged or used as the canonical record for Aster/Bloom.
- Verify Canadian geography, infrastructure-strategy basis, transaction dates (announcement versus close), exact stake at the correct entity level, seller/co-owner, fund/vehicle, current owner, operator, portfolio scale and current status. Do not infer fund names, exact dates or manager-level stakes.
- Search explicitly through 2026-08-18 for later sales, recapitalizations, facility transfers, operator changes, restructurings and signed pending transactions for Aster, Bloom and the AgeCare partnership. A stale portfolio page is not enough by itself.
- Distinguish ownership of real-estate/facility portfolios from AgeCare's operating-company ownership. Do not count individual facilities separately beneath a counted portfolio.
- Signed transactions remain pending until close. Use CLOSED_ACTIVE, SIGNED_PENDING_INCOMING, SIGNED_PENDING_EXIT or REALIZED.
- Prefer official Axium, AgeCare/current-operator, seller, government/regulatory, pension and filing sources. Open direct URLs; do not rely on snippets.
- Use NOT_PUBLICLY_DISCLOSED for noncritical gaps. Use UNRESOLVED only for material identity or active-ownership uncertainty; that blocks application.
- Return PROPOSED_CORRECTION if the task maps to/corrects an existing company, requires a split/merge, or a new company is directly supported. Return VERIFIED_NO_CHANGE only if no production/seed change is needed. Return DEFERRED only for material unresolved identity or active ownership.

STARTING SOURCES TO REOPEN
- https://www.axiuminfra.com/portfolio-assets/?lang=en
- https://www.axiuminfra.com/2020/01/08/agecare-and-axium-infrastructure-form-a-partnership-to-share-ownership-of-five-continuing-care-facilities-in-alberta/?lang=en
- https://www.axiuminfra.com/wp-content/uploads/2020/01/Website-Release_Project-Aster_Axium_en_Final.pdf
- https://www.agecare.ca/

TRANSPORT REQUIREMENT — IMPORTANT
Do not use a code fence, backticks, a preformatted block, a canvas, or an attached file. Return JSON as ordinary plain text between literal markers, followed by a concise Markdown review between separate markers:

BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise paragraph stating the decision, identity/boundary treatment, ownership/status treatment and any blocker.
END_REVIEW

Keep the complete response under 7,500 characters, use no more than 8 evidence rows and 4 milestones, and keep strings concise. Every top-level key below is mandatory:

{"asOfDate":"2026-08-18","requestedCompany":"Axium Aster & Axium Bloom","requestedManager":"Axium Infrastructure","decision":"PROPOSED_CORRECTION|VERIFIED_NO_CHANGE|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","canonicalDisplayName":"","aliases":[],"officialWebsite":null,"headquartersOrOperatingLocation":null,"country":"Canada","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentInfrastructureManagerOwners":[],"formerInfrastructureManagerOwners":[],"pendingOwnershipTransactions":[],"duplicateOwnerAction":""},"operatingResolution":{"sector":"SOCIAL_INFRA","subsector":"Long-term care facility portfolio","region":"NORTH_AMERICA","countryTags":["Canada"],"description":"","companyStatus":"ACTIVE|REALIZED","yearFounded":null,"productsAndServices":"","customersAndEndMarkets":"","footprint":"","disclosedScale":[]},"acquisitionExitCheck":{"entry":"","currentStatus":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}

Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Milestone keys only: date,event,category,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
