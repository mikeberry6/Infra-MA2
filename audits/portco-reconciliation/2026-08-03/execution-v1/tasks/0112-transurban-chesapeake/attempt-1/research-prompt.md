Research one North American infrastructure portfolio-company record as of 2026-08-18. Use current web research, open direct pages, and search both acquisitions and later exits/secondaries. Treat every repo field as a claim to verify.

REQUESTED COMPANY: Transurban Chesapeake
MANAGER TASKS: AustralianSuper; CPP Investments
CANONICAL TARGET: existing company cmrxpjcnm00syivhep9wizt9q, Transurban Chesapeake, United States

KNOWN REPO IDENTITY CONFLICT
- The canonical target currently records only CPP Investments as an active owner.
- A second published production/seed record, cmrxpj7kc00kyivhewp6psi4d “Chesapeake toll road network,” records only AustralianSuper.
- Both descriptions identify the same Greater Washington 495, 95 and 395 Express Lanes partnership. Independently verify whether these are one manager-level platform and recommend a canonical merge only if direct evidence supports it.
- Do not count 495, 95, 395, the Fredericksburg Extension or other component roads/projects as separate PortCos beneath the platform.

CURRENT CANONICAL CLAIMS
- Active TRANSPORTATION platform; managed lanes and toll roads; country United States; website null; headquarters “Virginia; Maryland; District of Columbia”; founded 2020.
- CPP Investments owner: vehicle “Real Assets (Infrastructure),” entry 2021, stake missing, active.
- Description claims current total ownership: Transurban 50%, AustralianSuper 25%, CPP Investments 15%, UniSuper 10%.
- Milestones claim 2020 founding; CPP agreement on Dec. 16, 2020; partnership financial close on Apr. 1, 2021; Fredericksburg Extension opened in 2023.
- The duplicate record claims AustralianSuper acquired 25%, announced Dec. 17, 2020 and closed Mar. 31, 2021.
- The queue action ADD_OWNER may be incomplete because the two owner records appear split across duplicate companies.

RESEARCH AND DECISION RULES
- Resolve Transurban Chesapeake / Chesapeake / Chesapeake Partnership / Chesapeake toll road network identity, legal or operating name, aliases and manager-level boundary.
- Verify geography, infrastructure-strategy basis, official website if one exists, headquarters versus operating footprint, formation/founding year, operating model and currently disclosed scale.
- Determine current/former status, exact stake, announcement date, legal closing date, fund/vehicle and exit status for AustralianSuper and CPP Investments. Resolve Australian Super→AustralianSuper.
- State the broader disclosed cap table in the rationale, but currentInfrastructureManagerOwners must contain only the requested tracked infrastructure managers AustralianSuper and CPP Investments. Do not add Transurban or UniSuper as tracked manager owners.
- Never infer that 2020 is a founding year merely because the partnership was announced. Use NOT_PUBLICLY_DISCLOSED when legal formation is not directly supported.
- Distinguish a company headquarters from the Virginia/Maryland/D.C. road footprint. Do not store operating jurisdictions as headquarters.
- Search explicitly for later sales, secondary transfers, recapitalizations, concession changes and signed pending platform sales through 2026-08-18. A manager-level or road-development announcement is not a platform exit.
- Signed transactions remain pending until close. Use CLOSED_ACTIVE, SIGNED_PENDING_INCOMING, SIGNED_PENDING_EXIT or REALIZED.
- Prefer official Transurban, AustralianSuper, CPP Investments, regulatory and filing sources. Open direct URLs; do not rely on snippets.
- Use NOT_PUBLICLY_DISCLOSED for noncritical gaps. Use UNRESOLVED only for material identity or active-ownership uncertainty; that blocks application.
- Return PROPOSED_CORRECTION if the duplicate must be merged, an owner added, or any date/field/source needs correction. Return VERIFIED_NO_CHANGE only if both records truly should remain distinct and the target is fully supported. Return DEFERRED only for material unresolved identity/active ownership.

STARTING SOURCES TO REOPEN
- https://www.cppinvestments.com/newsroom/cpp-investments-to-acquire-stake-in-toll-road-business-transurban-chesapeake/
- https://www.australiansuper.com/-/media/australian-super/files/about-us/media-releases/australiansuper-acquisition-of-stake-in-chesapeake-toll-roads.pdf
- https://www.australiansuper.com/global-investors/who-we-are/north-america
- https://www.transurban.com/content/dam/transurban-pdfs/02/news/20201216-North-America-Press-Release.pdf
- https://yourir.info/resources/a50955429d255a58/announcements/tcl.asx/3A564654/TCL_Transurban_reaches_financial_close_on_Chesapeake_partnership.pdf
- https://www.transurban.com/roads-and-projects/north-america
- https://www.transurban.com/content/dam/investor-centre/01/1H26-ResultsPresentation.pdf

TRANSPORT REQUIREMENT — IMPORTANT
Do not use a code fence, backticks, a preformatted block, a canvas, or an attached file. Return JSON as ordinary plain text between literal markers, followed by a concise Markdown review between separate markers:

BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise paragraph stating the decision, identity/merge treatment, owner treatment and any blocker.
END_REVIEW

Keep the complete response under 7,500 characters, use no more than 8 evidence rows and 4 milestones, and keep strings concise. Every top-level key below is mandatory:

{"asOfDate":"2026-08-18","requestedCompany":"Transurban Chesapeake","requestedManager":"AustralianSuper / CPP Investments","decision":"PROPOSED_CORRECTION|VERIFIED_NO_CHANGE|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","canonicalDisplayName":"","aliases":[],"officialWebsite":null,"headquartersOrOperatingLocation":null,"country":"United States","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentInfrastructureManagerOwners":[],"formerInfrastructureManagerOwners":[],"pendingOwnershipTransactions":[],"duplicateOwnerAction":""},"operatingResolution":{"sector":"TRANSPORTATION","subsector":"Managed lanes and toll roads","region":"NORTH_AMERICA","countryTags":["United States"],"description":"","companyStatus":"ACTIVE|REALIZED","yearFounded":null,"productsAndServices":"","customersAndEndMarkets":"","footprint":"","disclosedScale":[]},"acquisitionExitCheck":{"entry":"","currentStatus":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}

Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Milestone keys only: date,event,category,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
