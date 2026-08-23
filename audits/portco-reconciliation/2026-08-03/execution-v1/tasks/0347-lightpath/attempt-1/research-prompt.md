Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Lightpath
REQUESTED MANAGER: Morgan Stanley Infrastructure Partners (MSIP); identify Altice USA/Optimum and every current/former direct owner
TASK: ledger:0347:lightpath:c411cbd2
CANONICAL KEY: lightpath|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":[],"rationale":"The census created a Lightpath key while the repository contains heuristic candidate Lightpath Holdings LLC. Prove whether these are the same business before mapping or correcting ownership.","productionCompanyIds":[],"seedKeys":[],"candidateCanonicalKeys":["lightpath-holdings-llc|united-states"],"sourceHoldingId":"069-morgan-stanley-infrastructure-partners:holding:003:lightpath","startingEvidence":["https://www.lightpathfiber.com/about","https://www.morganstanley.com/im/en-us/institutional-investor/insights/private-markets/private-infrastructure.html"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
The published candidate is “Lightpath Holdings LLC,” U.S. digital infrastructure, active. It describes an enterprise/carrier fiber network serving enterprise, hyperscale, data-center, wireless and carrier customers, with approximately 10,800 unique route miles, more than 15,000 service locations, more than 170 data centers and eight cable landing stations. It records one active MSIP owner, investment year 2020, no vehicle and no stake. Its narrative says Altice USA agreed in July 2020 to sell 49.99% to MSIP and closed in December 2020 while retaining 50.01%; public sources through late 2024 allegedly preserved that split. Existing milestones include the July/December 2020 transaction, later metro expansions and a March 2026 GSA contract. The census incorrectly says the repository was empty and recommends a new company. Reconcile the exact identity and owner periods instead of duplicating the platform.

IDENTITY AND OWNERSHIP QUESTIONS
Prove whether Lightpath, Lightpath Holdings LLC and the former Altice USA enterprise fiber business are the same continuing manager-level platform. Resolve canonical legal name, brand aliases, predecessor entities, holding-company chain and current direct owners. Verify the July 2020 signing, exact December 2020 close date, acquisition vehicle/fund, MSIP stake, Altice retained stake and whether any options, governance rights, capital contributions or later recapitalizations changed those percentages. Determine whether Altice USA’s later rebrand to Optimum, debt restructurings, creditor transactions, asset sales or parent-level control changes affected the Lightpath equity. Search through 2026-08-19 for a sale, partial transfer, new investor, signed pending transaction or current disclosure that supersedes the 50.01%/49.99% structure.

Do not infer a North Haven fund without direct evidence. Distinguish manager-level equity ownership from Lightpath debt facilities, vendor/customer arrangements, route purchases, acquisitions of local fiber assets, government contracts and construction partnerships. Identify any former owners separately and use NOT_PUBLICLY_DISCLOSED rather than guessing dates, vehicles or stakes.

BOUNDARY AND OPERATING PROFILE
Count the one Lightpath fiber platform, not its holding companies, acquired metro networks, cable routes, data centers served, construction projects or individual operating subsidiaries. Confirm headquarters, current route miles, service locations, data-center/cable-landing footprint, markets, products/services, customer/end-market mix and official website as of the cutoff. Resolve apparent inconsistent route-mile metrics by preserving the metric definition and disclosure date rather than selecting the largest number.

RESEARCH RULES
- Resolve canonical identity, aliases, predecessor/successor names, holding-company/platform boundary, current/former direct owners and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Lightpath, Altice USA/Optimum, MSIP/Morgan Stanley, SEC/regulatory filings and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_MERGE if Lightpath maps to the existing Lightpath Holdings LLC record, PROPOSED_CORRECTION if that record remains the right identity but facts need correction, VERIFIED_NO_CHANGE only if identity and all material facts are already complete, PROPOSED_NEW only if a genuinely separate manager-level company is proven, EXCLUDED if the census holding is ineligible, or DEFERRED if identity/current ownership remains unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.lightpathfiber.com/about
- https://www.morganstanley.com/im/en-us/institutional-investor/insights/private-markets/private-infrastructure.html
- https://www.sec.gov/Archives/edgar/data/1702780/000110465920111136/tm2032040d1_8k.htm
- https://www.sec.gov/Archives/edgar/data/1702780/000162828021001795/atusq42020exhibit991.htm

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
