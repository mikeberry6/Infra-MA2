Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Longroad Energy
MANAGERS TO RESOLVE: Infratil and MEAG; also identify New Zealand Superannuation Fund, H.R.L. Morrison/Morrison & Co, founders and all current/former owners or managers
TASK: ledger:0317:longroad-energy:c89b5c17
CANONICAL KEY: longroad-energy|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"Production contains Longroad with two active rows that may conflate Morrison's manager role with Infratil ownership, while census evidence adds MEAG. Verify the full shareholder structure, distinguish investment manager from beneficial owner, and correct owners/vehicles without duplicating the company.","productionCompanyId":"cmrxpjlg8016fivheuurs3oft","seedKey":"longroad energy|United States","sourceHoldingIds":["061-infratil:holding:001:longroad-energy","066-meag:holding:001:longroad-energy"],"startingEvidence":["https://infratil.com/our-investments/renewables/","https://www.longroadenergy.com/longroad-announces-new-investors/","https://www.longroadenergy.com/longroad-energy-announces-500-million-equity-investment-from-meag-nz-super-fund-and-infratil/","https://www.meag.com/en/news/meag-invests-longroad-energy.html"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Longroad Energy","website":null,"country":"United States","status":"Active","sector":"Power & ET","subsector":"Utility-scale wind, solar, and storage","yearFounded":2016,"headquarters":"Multi-state United States","investmentYear":2016,"owners":[{"firm":"Morrison","vehicle":"Infratil","stake":null,"investmentYear":2016,"isActive":true},{"firm":"Infratil","vehicle":"n.a.","stake":null,"investmentYear":2016,"isActive":true}],"descriptionClaim":"Infratil and NZ Super Fund launched/invested in Longroad in 2016 with Morrison & Co managing the investments; MEAG joined the shareholder group through a $500m equity round in August 2022."}

IDENTITY, OWNERSHIP AND MANAGER QUESTIONS
Resolve Longroad's exact legal/canonical company and holding-company identity. Reconstruct the 2016 launch/acquisition by Infratil and NZ Super Fund, including founders/management rollover, exact investment vehicles, stakes and Morrison & Co's manager/adviser role. Determine whether Morrison itself owns beneficial equity or only manages Infratil/NZ Super exposure; do not count a manager twice as an owner. Reconstruct MEAG's 2022 equity entry and the concurrent follow-on investments: agreement/closing date, exact MEAG vehicle/mandate, total and individual capital contributions, structured shareholder percentages and any dilution. Search through the cutoff for later capital rounds, asset-management changes, continuation vehicles, owner changes, exits and signed pending transactions. Verify current company disclosures, development/operating scale, headquarters and platform boundary. Count Longroad once and treat project SPVs, individual wind/solar/storage projects, development pipeline and financings as underlying assets.

RESEARCH RULES
- Distinguish beneficial shareholders from Morrison's investment-management/advisory role; include Morrison as owner only with direct equity evidence.
- Require direct evidence for each owner, fund/vehicle, stake, announcement/closing date and current status. Use NOT_PUBLICLY_DISCLOSED rather than inference.
- Do not infer ownership percentages solely from round contribution amounts unless direct post-money percentages are disclosed.
- Search through 2026-08-19 for later owner changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Longroad, Infratil, NZ Super Fund, MEAG, Morrison, corporate/regulatory filings and transaction releases. Use UNRESOLVED for material identity or current ownership; either blocks application.
- Return PROPOSED_CORRECTION, VERIFIED_NO_CHANGE, EXCLUDED or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.longroadenergy.com/longroad-announces-new-investors/
- https://www.longroadenergy.com/longroad-energy-announces-500-million-equity-investment-from-meag-nz-super-fund-and-infratil/
- https://infratil.com/our-investments/renewables/
- https://www.meag.com/en/news/meag-invests-longroad-energy.html
- https://morrisonglobal.com/news-insights/portfolio-company-longroad-energy-to-receive-significant-new-capital-from-current-investors-and-a-new-co-investor/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
