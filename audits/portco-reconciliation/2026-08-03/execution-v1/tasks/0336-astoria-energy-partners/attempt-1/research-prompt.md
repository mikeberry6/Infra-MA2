Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Astoria Energy Partners
MANAGERS TO RESOLVE: MEAG; APG Infrastructure; identify every consortium member and current/former direct owner
TASK: ledger:0336:astoria-energy-partners:b7f656e5
CANONICAL KEY: astoria-energy-partners|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"The MEAG census proposed Astoria Energy Partners as a new 2019 U.S. power-generation platform. The repository already publishes Astoria Project Partners Holdings LLC for the same Astoria Energy I and II facilities under APG. This is likely an identity overlap or ownership-period gap, not a new company. Independently resolve the legal hierarchy and consortium cap table before creation or merge.","productionCompanyIds":[],"seedKeys":[],"sourceHoldingId":"066-meag:holding:004:astoria-energy-partners","possibleExistingCompany":{"name":"Astoria Project Partners Holdings LLC","country":"United States","manager":"APG Infrastructure"},"startingEvidence":["https://www.meag.com/en/news/meag-invests-in-power-plant-portfolio-in-new-york.html","https://apg.nl/en/publication/equity-consortium-agrees-to-acquire-stakes-in-new-york-s-astoria-energy-facilities/","https://www.globenewswire.com/news-release/2020/07/01/2056467/0/en/Equity-consortium-closes-acquisition-of-stakes-in-New-York-s-Astoria-Energy-facilities.html"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"possibleCanonical":{"name":"Astoria Project Partners Holdings LLC","country":"United States","status":"Active","sector":"Power & ET","subsector":"Gas-fired independent power generation","yearFounded":2006,"investmentYear":2020,"headquarters":"New York","owners":[{"firm":"APG Infrastructure","vehicle":"n.a.","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2020,"isActive":true}],"description":"The seed describes Astoria Energy I and II, two adjacent Queens combined-cycle plants totaling roughly 1.2 GW. It says an APG-led consortium acquired 100% of Astoria Energy I and 55% of Astoria Energy II, closing in July 2020."},"censusClaim":{"name":"Astoria Energy Partners","manager":"MEAG","investmentYear":2019,"stake":"NOT_PUBLICLY_DISCLOSED","state":"CLOSED_ACTIVE"}}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the exact identities and hierarchy among Astoria Energy Partners LLC, Astoria Energy I, Astoria Energy II, Astoria Project Partners Holdings LLC, project-level companies, acquisition holding companies and the operating/management entities. Determine whether MEAG's “power plant portfolio in New York” is the same two-plant platform already represented by Astoria Project Partners Holdings; whether MEAG invested in 2019 before the APG-led 2020 acquisition, joined that consortium, rolled an existing stake, or held a distinct portfolio. Reconstruct announcement and legal closing dates, sellers, the 100% and 55% asset-level interests, each consortium member, exact disclosed stakes, funds/vehicles, co-investments and any retained seller interest. Search through the cutoff for refinancing, recapitalization, plant retirement, sale, partial exit, ownership transfer, signed pending transaction or consortium change. Verify current ownership using current company/manager/regulatory evidence rather than historical announcements alone.

DUPLICATE AND BOUNDARY DECISION REQUIRED
State whether task 336 should merge/map to the existing Astoria Project Partners Holdings record, add MEAG as a co-owner to it, represent a former MEAG ownership period, remain separate because it is a different legal platform, or be excluded. Count the manager-level two-plant platform once. Do not separately count Astoria Energy I, Astoria Energy II, individual turbines, NYPA contract rights or holding SPVs. If the best canonical legal parent changed over time, preserve aliases and ownership history rather than creating duplicate companies.

Verify plant capacity, commercial-operation dates, merchant versus contracted revenue boundary, official website if any, location, customer/offtaker profile, active status, infrastructure-strategy basis and North American qualification. Do not infer consortium percentages or continuous ownership.

RESEARCH RULES
- Resolve canonical identity, aliases, platform/project/holding-company boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit date, and transaction state.
- Search through 2026-08-19 for subsequent ownership transfers, recapitalizations, exits, plant retirements, and signed pending transactions.
- Reopen direct pages and filings. Prefer MEAG, APG, company/project, FERC/NYPSC/NYPA, financing, seller and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE, or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.meag.com/en/news/meag-invests-in-power-plant-portfolio-in-new-york.html
- https://apg.nl/en/publication/equity-consortium-agrees-to-acquire-stakes-in-new-york-s-astoria-energy-facilities/
- https://www.globenewswire.com/news-release/2020/07/01/2056467/0/en/Equity-consortium-closes-acquisition-of-stakes-in-New-York-s-Astoria-Energy-facilities.html
- https://www.nypa.gov/power/generation/astoria-energy-ii
- https://www.mitsui.com/jp/en/release/2020/1230486_11223.html

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
