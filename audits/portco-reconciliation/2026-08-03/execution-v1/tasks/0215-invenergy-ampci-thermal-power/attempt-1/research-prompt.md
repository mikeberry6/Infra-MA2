Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Invenergy AMPCI Thermal Power (IATP)
MANAGERS TO RESOLVE: InfraBridge; Invenergy; ArcLight Capital Partners as announced buyer
TASK: ledger:0215:invenergy-ampci-thermal-power:7aff1fc4
CANONICAL KEY: invenergy-ampci-thermal-power|united-states-canada

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CORRECT_COMPANY","ADD_PENDING_TRANSACTION"],"rationale":"InfraBridge owns 50% of the thermal portfolio and announced a March 2026 sale to ArcLight. Verify whether the transaction remains pending or has legally closed and preserve Invenergy's continuing interest.","productionCompanyIds":["cmrxpj6er00j7ivhe4q6f5u9y"],"seedKeys":["invenergy ampci thermal power|United States / Canada"],"startingEvidence":["https://www.infrabridge.com/news/2026-03-12-arclight-to-acquire-infrabridge-50-stake-in-54-gw-power-portfolio","https://www.infrabridge.com/our-portfolio","https://www.businesswire.com/news/home/20260311462798/en/ArcLight-to-Acquire-InfraBridges-50-Stake-in-5.4-GW-Power-Portfolio"]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpj6er00j7ivhe4q6f5u9y","name":"Invenergy AMPCI Thermal Power","country":"United States / Canada","status":"Active","sector":"Power & ET","subsector":"Gas-Fired Power Generation","yearFounded":2018,"investmentYear":2018,"headquarters":"United States & Canada","description":"The repository says InfraBridge owns 50% through the legacy AMP Capital Global Infrastructure Fund II strategy, Invenergy retains 50% and operates the portfolio, and ArcLight signed in March 2026 to acquire InfraBridge's 50% subject to approvals with an expected second-half 2026 close.","owners":[{"firm":"InfraBridge","vehicle":"AMP Capital Global Infrastructure Fund II (GIF II)","investmentYear":2018,"stake":"50%","isActive":true}],"missingCoOwner":"Invenergy 50% continuing owner","pendingBuyer":"ArcLight Capital Partners for InfraBridge's 50%","claimedScale":"5.4 GW thermal portfolio"}

TRANSACTION AND OWNERSHIP QUESTIONS
Resolve the canonical legal/platform identity, the original 2018 AMPCI/Invenergy structure, exact current parent entities, the portfolio assets and operating arrangements. Verify InfraBridge's 50%, Invenergy's 50%, GIF II attribution and whether DigitalBridge is only the parent manager of InfraBridge rather than a separate direct owner. Reopen the March 2026 buyer/seller announcements and search FERC, Canadian regulators, financing sources and later releases through the as-of date for approvals, legal close, amendment, cancellation or a new owner. If ArcLight has not closed, keep InfraBridge active and record ArcLight only as signed pending incoming; if closed, capture the exact close date and retire InfraBridge. Identify ArcLight's acquisition vehicle only if directly disclosed. Keep individual generating plants beneath the portfolio unless separately manager-held.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, owners and portfolio/asset/SPV boundaries.
- Verify every manager, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer an ArcLight fund.
- Search through 2026-08-19 for FERC/regulatory approval, legal closing, sale, transfer, recapitalization, financing, cancellation and signed pending transactions.
- Verify geography, generation assets, capacity, markets, operator, customers/offtakers and current operating status.
- Reopen direct pages. Prefer InfraBridge, ArcLight, Invenergy, FERC/regulatory and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.infrabridge.com/news/2026-03-12-arclight-to-acquire-infrabridge-50-stake-in-54-gw-power-portfolio
- https://www.businesswire.com/news/home/20260311462798/en/ArcLight-to-Acquire-InfraBridges-50-Stake-in-5.4-GW-Power-Portfolio
- https://www.prnewswire.com/news-releases/arclight-to-acquire-infrabridges-50-stake-in-5-4-gw-power-portfolio-302397366.html
- https://www.infrabridge.com/our-portfolio
- https://www.invenergy.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
