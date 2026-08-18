Research one North American infrastructure portfolio-company reconciliation as of 2026-08-18. Use current web research, open direct pages, and search both acquisitions and later exits/secondaries. Treat every repository and census field as a claim to verify.

REQUESTED COMPANY: Etobicoke General Hospital (Phase 1 Patient Tower)
MANAGER TASK: Axium Infrastructure, with CVC DIF / DIF co-ownership evidence to reconcile
QUEUE DECISION TO TEST: merge the phase/project-name record into the existing Etobicoke Healthcare Partnership record if both represent the same manager-level hospital PPP investment; preserve all verified Axium and DIF ownership history once.

KNOWN DUPLICATE / PROJECT-VEHICLE CONFLICT
- Production contains published company cmrxpj7yf00lkivhen7juixyw, “Etobicoke General Hospital (Phase 1 Patient Tower).” It describes the Ontario hospital PPP asset, records current Axium Infrastructure and CVC DIF owners from 2016, and names Axium Infrastructure Canada II L.P. and DIF Infrastructure IV as vehicles/funds.
- Production separately contains published company cmrxpjcxf00tcivhevo1ton8u, “Etobicoke Healthcare Partnership.” It describes the same Phase 1 Patient Tower PPP, records current CVC DIF ownership via DIF Infrastructure IV from 2016, and cites the same Axium release and project-completion evidence.
- The manager census counts “Etobicoke General Hospital PPP” for Axium and “Etobicoke Healthcare Partnership” for CVC/DIF. Repo-only judgments say the phase-level hospital record is beneath Etobicoke Healthcare Partnership.
- Queue Task 203 later covers Etobicoke Healthcare Partnership. If Task 117 proves and fully implements the canonical identity and ownership treatment, Task 203 should later be superseded rather than repeat the work.

CURRENT CLAIMS TO VERIFY
- William Osler Health System and Infrastructure Ontario reached financial close with Etobicoke Healthcare Partnership in May 2016 for the Etobicoke General Hospital Phase 1 Patient Tower project.
- Axium Infrastructure Canada II L.P. and DIF Infrastructure IV / DIF Infra 4 Canada Ltd. were the equity sponsors; exact ownership percentages may not be publicly disclosed.
- The project is an availability-based design-build-finance-maintain hospital PPP, not a separate operating hospital company.
- Construction completed and the patient tower opened in or around 2019; the long-term maintenance/PPP concession continues.
- No later sponsor sale, refinancing that changed equity control, signed pending exit, or termination is recorded.

RESEARCH AND DECISION RULES
- Resolve Etobicoke Healthcare Partnership, Etobicoke Healthcare Partnership General Partner Inc., Etobicoke General Hospital Phase 1 Patient Tower, the hospital redevelopment, William Osler Health System, Infrastructure Ontario, Walsh, Axium Infrastructure Canada II L.P., DIF Infrastructure IV, DIF Infra 4 Canada Ltd., CVC DIF and any relevant project/concession entities.
- Decide the proper manager-level PortCo boundary. Determine whether the hospital/project name and Etobicoke Healthcare Partnership are one canonical PPP investment or separately countable manager-level holdings. Do not count the physical patient tower separately beneath its concession/project company.
- If one canonical record is appropriate, recommend which existing production company to keep, which to redirect/retire, the canonical display/legal name and aliases, and whether Task 203 is fully covered.
- Verify geography, infrastructure-strategy basis, equity sponsors, fund/vehicle, stake disclosure, announcement/financial-close date, operating/concession status, project scale, completion/opening, and current ownership. Do not invent percentages or infer equal ownership from two sponsors.
- Distinguish the facility owner/operator and the PPP special-purpose concession vehicle. Do not treat Walsh, Infrastructure Ontario or William Osler as infrastructure-fund owners.
- Search explicitly through 2026-08-18 for later sales, transfers, refinancing, restructurings, concession termination and signed pending exits involving the partnership, the project or either sponsor. A stale 2016 financial-close release is not enough by itself.
- The CVC acquisition of DIF Capital Partners is a manager/platform transaction and does not by itself change the project-level owner. Verify current CVC DIF/DIF treatment without converting that manager transaction into an Etobicoke sale.
- Signed transactions remain pending until close. Use CLOSED_ACTIVE, SIGNED_PENDING_INCOMING, SIGNED_PENDING_EXIT or REALIZED.
- Prefer official Axium, CVC DIF/DIF, Infrastructure Ontario, William Osler, government, regulatory, procurement and filing sources. Open direct URLs; do not rely on snippets.
- Use NOT_PUBLICLY_DISCLOSED for noncritical gaps. Use UNRESOLVED only for material identity or active-ownership uncertainty; that blocks application.
- Return PROPOSED_CORRECTION if the records should merge, identity/ownership should be corrected, or later ownership history must change. Return VERIFIED_NO_CHANGE only if both production records should remain exactly as they are. Return DEFERRED only for material unresolved identity or active ownership.

STARTING SOURCES TO REOPEN
- https://www.axiuminfra.com/2016/05/13/may-13-2016-axium-infrastructure-achieves-financial-close-on-hospital-ppp-in-ontario/?lang=en
- https://www.axiuminfra.com/wp-content/uploads/2016/12/EN_2016-06-13-Press-Release-Etobicoke_May-2016_website-only_en.pdf
- https://www.axiuminfra.com/portfolio-assets/?lang=en
- https://www.infrastructureontario.ca/en/news-and-media/news/etobicoke-general-hospital-redevelopment---phase-1/contract-awarded-for-etobicoke-general-hospital-redevelopment/
- https://www.infrastructureontario.ca/en/what-we-do/projectssearch/etobicoke-general-hospital-phase-1-patient-tower-project/
- https://www.infrastructureontario.ca/en/what-we-do/projectssearch/etobicoke-general-hospital-redevelopment/
- https://www.walshgroup.com/news/2019/walshcanadacompletesnewpatienttoweratetobicokegeneralhospital.html
- https://www.williamoslerhs.ca/en/visiting-us/etobicoke-general-hospital.aspx

TRANSPORT REQUIREMENT — IMPORTANT
Do not use a code fence, backticks, a preformatted block, a canvas, or an attached file. Return JSON as ordinary plain text between literal markers, followed by a concise Markdown review between separate markers:

BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise paragraph stating the decision, canonical boundary, sponsor/vehicle/status treatment, merge/supersession treatment and any blocker.
END_REVIEW

Keep the complete response under 7,500 characters, use no more than 8 evidence rows and 4 milestones, and keep strings concise. Every top-level key below is mandatory:

{"asOfDate":"2026-08-18","requestedCompany":"Etobicoke General Hospital (Phase 1 Patient Tower)","requestedManager":"Axium Infrastructure","decision":"PROPOSED_CORRECTION|VERIFIED_NO_CHANGE|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","canonicalDisplayName":"","aliases":[],"officialWebsite":null,"headquartersOrOperatingLocation":null,"country":"Canada","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentInfrastructureManagerOwners":[],"formerInfrastructureManagerOwners":[],"pendingOwnershipTransactions":[],"duplicateOwnerAction":""},"operatingResolution":{"sector":"SOCIAL_INFRA","subsector":"Hospital public-private partnership","region":"NORTH_AMERICA","countryTags":["Canada"],"description":"","companyStatus":"ACTIVE|REALIZED","yearFounded":null,"productsAndServices":"","customersAndEndMarkets":"","footprint":"","disclosedScale":[]},"acquisitionExitCheck":{"entry":"","currentStatus":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}

Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Milestone keys only: date,event,category,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
