Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Caturus
MANAGERS TO RESOLVE: CPP Investments; Kimmeridge Energy; Mubadala
TASK: ledger:0191:caturus:fb78fef3
CANONICAL KEY: caturus|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":[],"rationale":"Three manager census holdings map to Caturus. The accepted Mubadala census judgment says Caturus Energy is a duplicate identity and Commonwealth LNG is a subordinate project under the platform. Resolve exact identity, current ownership and consolidation before the later Caturus Energy queue task is considered.","censusRows":[{"manager":"CPP Investments","holdingId":"032-cpp-investments:holding:005:caturus"},{"manager":"Kimmeridge Energy","holdingId":"063-kimmeridge-energy:holding:001:caturus"},{"manager":"Mubadala","holdingId":"070-mubadala:holding:002:caturus","disposition":"POSSIBLE_DUPLICATE","rationale":"Matches Caturus record; Caturus Energy is duplicate identity and Commonwealth LNG is subordinate project under platform."}],"repoOnlyRows":[],"repoRows":[{"productionCompanyId":"cmrxpjjko013jivhegryhtkk9","seedKey":"caturus|United States","sourcePresence":"BOTH"}],"linkedQueueTask":{"taskId":"ledger:0192:caturus-energy:13954843","subject":"Caturus Energy","proposedTreatment":"Supersede only if this research proves the same canonical platform and fully resolves CPP/Mubadala ownership."}}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjjko013jivhegryhtkk9","name":"Caturus","country":"United States","status":"Active","sector":"Midstream","subsector":"Integrated natural gas and LNG platform","investmentYear":2023,"headquarters":"Texas; Louisiana","description":"The repository describes Caturus as an integrated gas and LNG platform formed from Kimmeridge's upstream/midstream assets and Commonwealth LNG. It says SoTex HoldCo was rebranded Caturus in August 2025 when Mubadala closed a 24.1% investment. A second published record named Caturus Energy attributes a 12% 2025 stake to CPP Investments.","owners":[{"firm":"Kimmeridge","vehicle":"Kimmeridge Flagship Funds","investmentYear":2023,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"milestones":[{"date":"Aug 14, 2023","event":"Kimmeridge closed development funding for Commonwealth LNG.","category":"Financing"},{"date":"Jun 25, 2024","event":"Kimmeridge closed a follow-on control investment in Commonwealth LNG.","category":"Acquisition"},{"date":"Aug 7, 2025","event":"SoTex HoldCo rebranded as Caturus and Mubadala's investment closed.","category":"Financing"},{"date":"Sep 5, 2025","event":"DOE materials disclosed 24.1% Mubadala / 75.9% Kimmeridge ownership.","category":"Financing"}],"sources":[{"url":"https://caturus.com/news/kimmeridge-closes-strategic-equity-investment-from-mubadala-energy-and-rebrands-integrated-natural-gas-platform-as-caturus"},{"url":"https://mubadalaenergy.com/news/mubadala-energy-kimmeridge-and-cpp-investments-announce-final-investment-decision-for-caturus-commonwealth-lng-investment-in-the-u-s/"},{"url":"https://www.kimmeridge.com/news/kimmeridge-forms-caturus"},{"url":"https://www.kimmeridge.com/select-investments"}]}

TRANSACTION AND OWNERSHIP QUESTIONS
Prove whether Caturus, Caturus Energy, SoTex HoldCo, Kimmeridge Texas Gas and Kimmeridge Energy Management Company refer to one integrated parent platform, predecessors or separate investees. Determine the canonical legal/display name and whether Commonwealth LNG is only a controlled project/subsidiary. Reconcile the cap table chronologically: Kimmeridge control, Mubadala's 24.1% closing, CPP Investments' reported 12% interest, any dilution/secondary transfer and current percentages as of the date. Verify exact announcement and legal closing dates, organizations, funds/vehicles, and whether CPP's 2025/2026 commitment closed. Search for a later sale, FID financing, equity raise, restructuring or pending ownership transaction through the as-of date. Do not convert project financing, LNG offtake, DOE approval or FID into platform ownership.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, predecessors, duplicate records and platform/subsidiary/project boundaries.
- Determine whether task 192 Caturus Energy should be superseded by one canonical Caturus record, and whether Commonwealth LNG must remain subordinate.
- Verify every current/former direct owner, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer post-transaction percentages mathematically unless a direct source confirms them; label any calculation clearly as inference and leave structured stake undisclosed.
- Search through 2026-08-19 for acquisition close, sale, transfer, capital raise, FID financing, restructuring, cancellation and signed pending transactions.
- Verify geography, upstream/midstream/LNG operating boundary, products/end markets, production/acreage/LNG scale and current status.
- Reopen direct pages. Prefer Caturus, Kimmeridge, CPP Investments, Mubadala Energy, DOE/FERC/regulatory filings and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://caturus.com/news/kimmeridge-closes-strategic-equity-investment-from-mubadala-energy-and-rebrands-integrated-natural-gas-platform-as-caturus
- https://mubadalaenergy.com/news/mubadala-energy-kimmeridge-and-cpp-investments-announce-final-investment-decision-for-caturus-commonwealth-lng-investment-in-the-u-s/
- https://www.kimmeridge.com/news/kimmeridge-forms-caturus
- https://www.kimmeridge.com/select-investments
- https://www.energy.gov/sites/default/files/2025-09/Commonwealth%20LNG%20DOE%20Notice%20of%20Change%20in%20Control%20%28Mubadala-Caturus%29%20-%209.5.2025.pdf

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
