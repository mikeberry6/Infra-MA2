Research one North American infrastructure portfolio-company reconciliation as of 2026-08-18. Use current web research, open direct pages, and search both acquisitions and later exits/secondaries. Treat every repository and census field as a claim to verify.

REQUESTED COMPANY: Edwards Sanborn 1A
MANAGER TASK: Axium Infrastructure
QUEUE DECISION TO TEST: merge the standalone Phase 1A record into the existing Edwards Sanborn 1A & 1B record and normalize one manager-level Edwards Sanborn Solar + Storage identity.

KNOWN DUPLICATE / PLATFORM-BOUNDARY CONFLICT
- Production contains published company cmrxpj7v900liivhelzpabyae, “Edwards Sanborn 1A.” It describes Phase 1A in Kern County, California at 397 MWac solar and 1,505 MWh battery storage, says Axium acquired 80% from Terra-Gen in October 2022, and has one active Axium owner via “Axium Managed Funds,” entry 2022. The owner is heuristically linked to generic “AxInfra Fund I-IV.”
- Production separately contains published company cmrxpj7vt00ljivheoq991z94, “Edwards Sanborn 1A & 1B.” It combines Phase 1A with Phase 1B, describes Phase 1B at 410 MWac solar and 1,497 MWh storage, records Axium’s 2022 Phase 1A investment and 2024 Phase 1B investment, and has one active Axium owner with no vehicle disclosed. It is also heuristically linked to generic “AxInfra Fund I-IV.”
- The manager census counts one current standalone asset, “Edwards Sanborn Solar + Storage,” and maps it to the 1A & 1B record. It treats the standalone 1A record as a phase-level duplicate.
- Queue Task 116 covers the existing 1A & 1B record. If Task 115 proves and fully implements the canonical identity and ownership treatment, Task 116 should later be superseded rather than repeat the same work.

CURRENT CLAIMS TO VERIFY
- Axium completed an 80% acquisition of Phase 1A from Terra-Gen in October 2022; Terra-Gen retained 20%.
- An Axium-managed fund and a limited-partner/co-investor acquired 50% of Phase 1B from Terra-Gen in or around January 2024; identify announcement versus legal close, and do not assign Axium the co-investor’s share.
- Phase 1A and Phase 1B are components of one Edwards Sanborn solar-and-storage complex in Kern County, California, but may use separate legal SPVs and phase-specific ownership percentages.
- Public sources reviewed previously describe 1A at 397 MWac / 1,505 MWh and 1B at 410 MWac / 1,497 MWh.
- No later sale or signed pending exit is recorded.

RESEARCH AND DECISION RULES
- Resolve Edwards Sanborn, Edwards & Sanborn, Edwards Sanborn Solar + Storage, Phase 1A, Phase 1B, Terra-Gen, Axium-managed funds, the limited-partner/co-investor and any relevant legal/project entities.
- Decide the proper manager-level PortCo boundary. Determine whether 1A and 1B should be one canonical manager-level investment with phase-specific ownership facts, or two separately counted investments. Do not count underlying subprojects twice beneath a counted complex.
- If one canonical record is appropriate, recommend which existing production company to keep, which to redirect/retire, the normalized display name and aliases, and whether Task 116 is fully covered.
- Verify geography, infrastructure-strategy basis, exact phase-level stakes, announcement and closing dates, seller/co-owner, fund/vehicle, operating/development status, capacity and current ownership. Do not convert phase-level stakes into one combined-company percentage.
- Treat “AxInfra Fund I-IV” as an unsupported heuristic unless a direct source names that exact fund. Preserve disclosed wording such as “Axium-managed fund(s)” or a named transaction vehicle without inventing a curated-fund match.
- Search explicitly through 2026-08-18 for later sales, recapitalizations, financings, restructurings, asset transfers and signed pending exits for both phases and the combined complex. A stale acquisition release is not enough by itself.
- Signed transactions remain pending until close. Use CLOSED_ACTIVE, SIGNED_PENDING_INCOMING, SIGNED_PENDING_EXIT or REALIZED.
- Prefer official Axium, Terra-Gen, regulatory, institutional-investor and filing sources. Open direct URLs; do not rely on snippets.
- Use NOT_PUBLICLY_DISCLOSED for noncritical gaps. Use UNRESOLVED only for material identity or active-ownership uncertainty; that blocks application.
- Return PROPOSED_CORRECTION if the records should merge, identity/ownership should be corrected, or the generic fund link should be removed. Return VERIFIED_NO_CHANGE only if both production records should remain exactly as they are. Return DEFERRED only for material unresolved identity or active ownership.

STARTING SOURCES TO REOPEN
- https://www.axiuminfra.com/2022/10/26/october-26-2022-axium-infrastructure-invests-in-phase-1-of-edwards-sanborn-solar-storage-facility/?lang=en
- https://www.axiuminfra.com/wp-content/uploads/2022/10/Axium_News-Release_Edwards-Sanborn-1A.pdf
- https://terra-gen.com/axium-infrastructure-invests-in-phase-1-of-edwards-sanborn-solar-storage-facility/
- https://www.axiuminfra.com/2024/01/12/january-11-2024-axium-infrastructure-invests-in-phase-1b-of-the-edwards-sanborn-solar-storage-facility/?lang=en
- https://www.axiuminfra.com/wp-content/uploads/2024/01/Axium_News-Release_EdSan-1B.pdf
- https://terra-gen.com/axium-infrastructure-invests-in-phase-1b-of-the-edwards-sanborn-solar-storage-facility/
- https://www.terra-gen.com/projects/

TRANSPORT REQUIREMENT — IMPORTANT
Do not use a code fence, backticks, a preformatted block, a canvas, or an attached file. Return JSON as ordinary plain text between literal markers, followed by a concise Markdown review between separate markers:

BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise paragraph stating the decision, canonical boundary, phase-specific ownership/status treatment, merge/supersession treatment and any blocker.
END_REVIEW

Keep the complete response under 7,500 characters, use no more than 8 evidence rows and 4 milestones, and keep strings concise. Every top-level key below is mandatory:

{"asOfDate":"2026-08-18","requestedCompany":"Edwards Sanborn 1A","requestedManager":"Axium Infrastructure","decision":"PROPOSED_CORRECTION|VERIFIED_NO_CHANGE|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","canonicalDisplayName":"","aliases":[],"officialWebsite":null,"headquartersOrOperatingLocation":null,"country":"United States","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentInfrastructureManagerOwners":[],"formerInfrastructureManagerOwners":[],"pendingOwnershipTransactions":[],"duplicateOwnerAction":""},"operatingResolution":{"sector":"POWER_ET","subsector":"Solar + Battery Storage","region":"NORTH_AMERICA","countryTags":["United States"],"description":"","companyStatus":"ACTIVE|REALIZED","yearFounded":null,"productsAndServices":"","customersAndEndMarkets":"","footprint":"","disclosedScale":[]},"acquisitionExitCheck":{"entry":"","currentStatus":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}

Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Milestone keys only: date,event,category,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
