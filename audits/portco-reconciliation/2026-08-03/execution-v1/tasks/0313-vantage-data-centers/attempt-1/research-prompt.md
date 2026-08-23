Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Vantage Data Centers
MANAGERS TO RESOLVE: DigitalBridge, CBRE Investment Management, Pantheon Ventures / Pantheon Infrastructure Plc, PSP Investments and InfraBridge; also identify Silver Lake, TIAA/Nuveen, GCM Grosvenor and all current/former owners or co-investors
TASK: ledger:0313:vantage-data-centers:2a0dcd1f
CANONICAL KEY: not assigned to the InfraBridge repo-only judgment; candidate existing key vantage-data-centers|united-states-canada

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"An InfraBridge repo-only judgment misattributes Vantage to InfraBridge while an existing canonical Vantage record and four census holdings identify DigitalBridge, CBRE IM, Pantheon and PSP. Existing rows also mention Silver Lake, GCM Grosvenor and multiple Vantage platform/asset vehicles. Resolve one canonical company, reject false InfraBridge ownership and avoid double-counting Vantage SDC or regional portfolios.","candidateCanonicalCompany":{"name":"Vantage Data Centers","canonicalKey":"vantage-data-centers|united-states-canada","productionCompanyId":"cmrxpjdda00u1ivhe4o7z4w3s","seedKey":"vantage data centers|United States / Canada"},"sourceRepoOnlyId":"058-infrabridge:repo-only:011:vantage-data-centers","sourceHoldingIds":["027-cbre-investment-management:holding:008:vantage-data-centers","036-digitalbridge:holding:015:vantage-data-centers","077-pantheon-ventures:holding:003:vantage-data-centers","081-psp-investments:holding:006:vantage-data-centers"],"startingEvidence":["https://www.digitalbridge.com/portfolio/vantage-data-centers-north-america","https://www.digitalbridge.com/news/2024-06-13-vantage-data-centers-completes-92-billion-equity-investment-led-by-digitalbridge-and-silver-lake","https://www.cbrecaledon.com/wp-content/uploads/2020/07/Vantage-Data-Centers-Investment-Press-Release.pdf","https://www.pantheoninfrastructure.com/portfolio"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Vantage Data Centers","website":null,"country":"United States / Canada","status":"Active","sector":"Digital","subsector":"Hyperscale data centers","yearFounded":2010,"headquarters":"Denver, Colorado","ownersClaimed":[{"firm":"DigitalBridge","vehicle":"n.a.","stake":"Core platform acquisition","investmentYear":2017,"isActive":true},{"firm":"CBRE Investment Management","vehicle":"n.a.","stake":"Significant minority in stabilized North American portfolio","investmentYear":2020,"isActive":true},{"firm":"GCM Grosvenor","vehicle":"Labor Impact Fund / Infrastructure Advantage Strategy","stake":null,"investmentYear":2020,"isActive":true},{"firm":"DigitalBridge","vehicle":"Vantage SDC exposure","stake":"12.8% balance-sheet interest after 2023 deconsolidation","investmentYear":2020,"isActive":true},{"firm":"Silver Lake","vehicle":"n.a.","stake":"Lead investor in 2024 equity round","investmentYear":2024,"isActive":true},{"firm":"DigitalBridge","vehicle":"n.a.","stake":"Lead investor in 2024 equity round","investmentYear":2024,"isActive":true}],"missingOrUnresolved":"PSP, Pantheon and TIAA/Nuveen beneficial interests; legal versus asset-level ownership; duplicate DigitalBridge periods."}

IDENTITY, OWNERSHIP AND PLATFORM QUESTIONS
Resolve one Vantage canonical company and its legal/regional holding-company structure. Reconstruct the 2017 Digital Bridge/PSP/TIAA acquisition, the 2020 Vantage SDC stabilized-asset partnership and CBRE/GCM participation, any 2023 deconsolidation, and the June 2024 $9.2bn DigitalBridge/Silver Lake-led equity investment. For every manager/investor, determine whether exposure is direct platform equity, regional growth-platform equity, stabilized asset-portfolio ownership, targeted co-investment, LP/fund interest, debt or a historical exit; include qualifying direct/co-investment positions and exclude LP/fund-of-funds exposure. Resolve Pantheon's current commitment/closing and beneficial vehicle, PSP's current versus former status, TIAA/Nuveen and GCM positions, and structured stake percentages without aggregating incomparable levels. Independently test InfraBridge/AMP Capital ownership and reject the name-confusion attribution if unsupported. Search through the cutoff for later sell-downs, recapitalizations, owner changes, exits and signed pending transactions. Treat Vantage SDC, regional holding vehicles, campuses and data centers as part of one manager-level Vantage scorecard unless direct evidence establishes an independently managed company.

RESEARCH RULES
- Never treat InfraBridge and DigitalBridge as aliases.
- Do not add percentages from different legal levels or double-count one investor through multiple vehicles/rounds; preserve separate periods/vehicles only when economically distinct.
- Require direct evidence for each owner/co-investor, vehicle, stake, closing/state and current status. Use NOT_PUBLICLY_DISCLOSED rather than inference.
- Search through 2026-08-19 for later owner changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Vantage, DigitalBridge, CBRE IM, Pantheon/PINT, PSP, Silver Lake, TIAA/Nuveen, GCM and regulatory/transaction materials. Use UNRESOLVED for material identity or current ownership; either blocks application.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, VERIFIED_NO_CHANGE, SUPERSEDED, EXCLUDED or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://vantage-dc.com/
- https://www.digitalbridge.com/portfolio/vantage-data-centers-north-america
- https://www.digitalbridge.com/news/2024-06-13-vantage-data-centers-completes-92-billion-equity-investment-led-by-digitalbridge-and-silver-lake
- https://www.cbrecaledon.com/wp-content/uploads/2020/07/Vantage-Data-Centers-Investment-Press-Release.pdf
- https://www.pantheoninfrastructure.com/portfolio

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
