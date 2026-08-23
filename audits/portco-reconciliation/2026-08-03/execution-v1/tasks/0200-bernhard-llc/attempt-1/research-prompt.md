Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Bernhard, LLC / ENFRA
MANAGERS TO RESOLVE: CVC DIF
TASK: ledger:0200:bernhard-llc:5339777c
LINKED DUPLICATE TASK TO RESOLVE IN THE SAME CHAT: ledger:0202:enfra:7265d723
CANONICAL KEYS UNDER REVIEW: bernhard-llc|united-states; enfra|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES_IF_REBRAND_CONFIRMED"],"rationale":"The census says Bernhard and ENFRA are the same DIF Infrastructure VI platform after a 2025 rebrand, but production and seed each contain two active companies. Prove the identity and choose one canonical survivor before any merge.","censusRows":[{"manager":"CVC","holdingId":"034-cvc:holding:004:enfra-bernhard-platform"},{"manager":"DIF","holdingId":"035-dif:holding:004:enfra-bernhard-platform"}],"productionCompanyIds":["cmrxpjctn00t5ivhet8mwenz9","cmrxpjcwx00tbivhed8tnctp1"],"seedKeys":["bernhard, llc|United States","enfra|United States"],"startingEvidence":["https://enfrasolutions.com/dif-capital-partners-invests-in-sustainability-and-energy-solutions-with-acquisition-of-bernhard-llc","https://www.prnewswire.com/news-releases/bernhard-rebrands-as-enfra-to-reflect-energy-infrastructure-leadership-and-future-growth-302443445.html"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"bernhard":{"id":"cmrxpjctn00t5ivhet8mwenz9","name":"Bernhard, LLC","status":"Active","sector":"Power & ET","subsector":"Energy-as-a-service and building infrastructure","ownershipVehicle":"DIF Infrastructure VI","investmentYear":2021,"yearFounded":1919,"owner":"CVC DIF","milestones":4,"citations":4},"enfra":{"id":"cmrxpjcwx00tbivhed8tnctp1","name":"ENFRA","status":"Active","sector":"Power & ET","subsector":"Energy solutions and building infrastructure services","ownershipVehicle":"DIF Infrastructure VI","investmentYear":2021,"yearFounded":1919,"owner":"CVC DIF","milestones":5,"citations":4},"claimedHistory":["DIF announced the acquisition of Bernhard on 2021-10-04 through DIF Infrastructure VI.","Bernhard Capital Partners announced completion on 2021-12-02.","Bernhard announced the ENFRA rebrand on 2025-05-07."]}

IDENTITY AND OWNERSHIP QUESTIONS
Prove whether ENFRA is solely Bernhard's new corporate/brand identity or a distinct parent, subsidiary or carve-out. Resolve legal names, rebrand effective date, website continuity, management continuity, predecessor/successor treatment and which production ID should survive. Verify the 2021 buyer, seller, fund, stake, announcement and legal closing dates and whether CVC DIF remains current after its acquisition of DIF Capital Partners. Search for any later sale, recapitalization, ownership transfer or signed pending exit. Keep customer projects, operating subsidiaries and energy-as-a-service projects beneath the manager-level platform unless independently owned by the manager.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, predecessor/successor names, owners and platform/subsidiary boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer a percentage.
- Search through 2026-08-19 for rebrand completion, sale, transfer, recapitalization, merger, financing, cancellation and signed pending transactions.
- Verify official website, headquarters, founding-year meaning, products/services, customers/end markets, operating footprint, disclosed scale and current status.
- Reopen direct pages. Prefer ENFRA/Bernhard, CVC DIF, Bernhard Capital Partners, regulatory and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. One complete result must explicitly cover both task IDs so the linked ENFRA task can be superseded if appropriate. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://enfrasolutions.com/about
- https://enfrasolutions.com/dif-capital-partners-invests-in-sustainability-and-energy-solutions-with-acquisition-of-bernhard-llc
- https://www.bernhardcapital.com/bernhard-capital-partners-completes-sale-of-bernhard-llc-to-dif-capital-partners/
- https://www.prnewswire.com/news-releases/bernhard-rebrands-as-enfra-to-reflect-energy-infrastructure-leadership-and-future-growth-302443445.html
- https://www.cvcdif.com/news-insights/dif-capital-partners-invests-in-sustainability-and-energy-solutions-with-acquisition-of-bernhard-llc

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
