Research one North American infrastructure portfolio-company reconciliation as of 2026-08-18. Use current web research, open direct pages, and search both acquisitions and later exits/secondaries. Treat every repo field as a claim to verify.

REQUESTED COMPANY: Arbour Heights
MANAGER TASK: Axium Infrastructure
QUEUE TARGET: existing company cmrxpj7n300l3ivheede9bqxw, Arbour Heights, Canada

KNOWN PLATFORM / ASSET BOUNDARY CONFLICT
- The manager census concluded that Arbour Heights is an underlying long-term-care property acquired by the broader Revera-Axium joint venture and should not remain a separate manager-level PortCo.
- A second published record, cmrxpj86h00lzivhe009kcwjc “Revera Joint Venture,” represents the broader long-term-care ownership platform. The census treated that platform as an existing verified manager-level holding.
- Independently verify the boundary and current ownership. Recommend consolidation only if direct evidence shows Arbour Heights is a facility beneath that platform.
- If consolidation is supported, preserve “Revera Joint Venture” (or a better directly supported current platform name) as the canonical manager-level identity and treat Arbour Heights as an underlying asset/alias or component, not a second PortCo.
- Also verify whether the broader platform remains current, was renamed/restructured, or was sold. A stale acquisition release is not proof of current ownership.

CURRENT ARBOUR HEIGHTS CLAIMS
- Active SOCIAL_INFRA long-term-care home in Kingston, Ontario; 174 beds; website absent; headquarters “Ontario”; founded year absent.
- Active Axium owner, “Axium Managed Funds,” entry 2019, stake absent. A later heuristic linked “AxInfra Fund I-IV” at low confidence; do not accept that fund attribution without direct evidence.
- Milestones: 2018 formation of broader platform; 2019 first external platform acquisition; July 3, 2019 Arbour Heights closing.

CURRENT REVERA JOINT VENTURE CLAIMS
- Active SOCIAL_INFRA long-term-care ownership platform spanning Ontario, Alberta, Manitoba and British Columbia; website absent; headquarters listed as the operating provinces; founded year absent.
- Active Axium owner, “Axium Managed Funds,” entry 2018, stake absent. Description claims Axium-managed funds acquired 75% and Revera retained 25%.
- A low-confidence heuristic links “AxInfra Fund I-IV”; verify or remove that attribution.
- Milestones: April 30, 2018 formation/closing for 32 homes; 2019 expansion; July 3, 2019 Arbour Heights acquisition.

RESEARCH AND DECISION RULES
- Resolve Arbour Heights, Revera Joint Venture, Revera Inc., current operator/brand names, legal entities, aliases, and platform-versus-facility boundaries.
- Verify Canadian geography, infrastructure-strategy basis, official website if one exists, headquarters versus operating footprint, formation year, operating model and currently disclosed scale.
- Determine Axium’s current/former status, exact stake, announcement and closing dates, disclosed fund/vehicle, and any exit date. Do not infer a fund or vehicle.
- Search explicitly for sales, portfolio transfers, operator changes, restructurings, insolvency proceedings, recapitalizations and signed pending transactions through 2026-08-18, including searches for both the platform and Arbour Heights.
- Distinguish a change in facility operator/brand from a sale of the underlying ownership platform. Distinguish Revera’s corporate ownership from direct infrastructure-fund ownership.
- Signed transactions remain pending until close. Use CLOSED_ACTIVE, SIGNED_PENDING_INCOMING, SIGNED_PENDING_EXIT or REALIZED.
- Prefer official Axium, Revera/current-operator, government/regulatory, pension and filing sources. Open direct URLs; do not rely on snippets.
- Use NOT_PUBLICLY_DISCLOSED for noncritical gaps. Use UNRESOLVED only for material identity or active-ownership uncertainty; that blocks application.
- Return PROPOSED_CORRECTION if Arbour Heights must be merged/retired, the platform name/status/ownership needs correction, or any list field/source needs correction. Return VERIFIED_NO_CHANGE only if Arbour Heights is independently a manager-level holding and both records should remain. Return DEFERRED only for material unresolved identity or active ownership.

STARTING SOURCES TO REOPEN
- https://www.axiuminfra.com/2018/04/30/april-30-2018-revera-and-axium-infrastructure-form-a-joint-venture-to-share-ownership-of-32-long-term-care-homes/?lang=en
- https://www.axiuminfra.com/2019/07/03/july-3-2019-joint-venture-of-revera-inc-and-axium-infrastructure-expands-with-acquisition-of-arbour-heights-long-term-care-home-in-kingston-ontario/?lang=en
- https://www.axiuminfra.com/wp-content/uploads/2019/07/Press-Release_Revera-Axium-consortium-acquires-Arbour-Heights_July-3-2019-1.pdf
- https://www.axiuminfra.com/portfolio-assets/?lang=en
- https://reveraliving.com/en/live-with-us/ontario/kingston/arbour-heights

TRANSPORT REQUIREMENT — IMPORTANT
Do not use a code fence, backticks, a preformatted block, a canvas, or an attached file. Return JSON as ordinary plain text between literal markers, followed by a concise Markdown review between separate markers:

BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise paragraph stating the decision, platform/facility treatment, ownership/status treatment and any blocker.
END_REVIEW

Keep the complete response under 7,500 characters, use no more than 8 evidence rows and 4 milestones, and keep strings concise. Every top-level key below is mandatory:

{"asOfDate":"2026-08-18","requestedCompany":"Arbour Heights","requestedManager":"Axium Infrastructure","decision":"PROPOSED_CORRECTION|VERIFIED_NO_CHANGE|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","canonicalDisplayName":"","aliases":[],"officialWebsite":null,"headquartersOrOperatingLocation":null,"country":"Canada","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentInfrastructureManagerOwners":[],"formerInfrastructureManagerOwners":[],"pendingOwnershipTransactions":[],"duplicateOwnerAction":""},"operatingResolution":{"sector":"SOCIAL_INFRA","subsector":"Long-term care ownership platform","region":"NORTH_AMERICA","countryTags":["Canada"],"description":"","companyStatus":"ACTIVE|REALIZED","yearFounded":null,"productsAndServices":"","customersAndEndMarkets":"","footprint":"","disclosedScale":[]},"acquisitionExitCheck":{"entry":"","currentStatus":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}

Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Milestone keys only: date,event,category,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
