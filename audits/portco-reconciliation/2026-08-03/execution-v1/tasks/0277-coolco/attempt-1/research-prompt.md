Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: CoolCo
MANAGER TO RESOLVE: Harrison Street; identify all direct current and former owners
TASK: ledger:0277:coolco:3d977a11
CANONICAL KEY: coolco|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The repository contains a published CoolCo record and a second seed-only record named CoolCo (Cincinnati District Energy) that appear to describe the same Cincinnati district-cooling business. Verify exact identity before merging, and independently verify Harrison Street's ownership, acquisition date, fund/vehicle, current status and any exit.","productionCompanyId":"cmrxpjhii010civhek48qprav","seedKey":"coolco|United States","candidateDuplicateSeedKey":"coolco (cincinnati district energy)|United States","linkedTaskId":"ledger:0474:coolco-cincinnati-district-energy:47c3df2b","sourceHoldingId":"051-harrison-street:holding:008:coolco","startingEvidence":["https://coolco.com/about-us/","https://harrisonst.com/harrison-street-acquires-28-mw-cincinnati-solar-project/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"CoolCo","country":"United States","status":"Active","sector":"Utilities","subsector":"District cooling","website":"https://coolco.com/","yearFounded":1997,"investmentYear":2019,"headquarters":"Ohio","owners":[{"firm":"Harrison Street","vehicle":"n.a.","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2019,"isActive":true}],"description":"The published record describes CoolCo as the downtown Cincinnati district-cooling utility, serving commercial, hotel, retail, government and institutional buildings with central chilled-water infrastructure capable of more than 10,000 tons of cooling. It says the system has operated since 1997 and Harrison Street acquired it in 2019.","milestones":[{"date":"1997","event":"CoolCo began chilled-water service and was founded.","category":"Founding"},{"date":"2019","event":"Harrison Street acquired the Cincinnati district energy system.","category":"Acquisition"},{"date":"Nov 1, 2022","event":"Harrison Street identified CoolCo as its existing Cincinnati infrastructure investment.","category":"Financing"}]}

DUPLICATE SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"CoolCo (Cincinnati District Energy)","sourcePresence":"SEED_ONLY","country":"United States","status":"Active","sector":"Utilities","subsector":"District cooling","website":"https://coolco.com/","yearFounded":1997,"investmentYear":2019,"headquarters":"Ohio","owners":[{"firm":"Harrison Street","vehicle":"Infrastructure Fund","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2019,"isActive":true}],"description":"The seed-only row contains substantially the same Cincinnati district-cooling description, milestones and sources as CoolCo."}

IDENTITY AND OWNERSHIP QUESTIONS
Prove whether CoolCo and CoolCo (Cincinnati District Energy) are one legal/operating business and determine the correct canonical name, legal entities, former names and website. Identify the actual asset/system Harrison Street acquired, seller, announcement and legal closing dates, fund or acquisition vehicle, direct owner, stake and current owner chain. Verify whether 2019 is correct and whether the generic labels Infrastructure Fund and n.a. should be replaced or set to NOT_PUBLICLY_DISCLOSED. Search through the cutoff for a sale, recapitalization, refinancing, concession transfer, operator change, signed pending exit or other disposition. Confirm current operating status, Cincinnati service territory, plant/network scale and 1997 history. Distinguish this system from any other generic Harrison Street District Energy System task or campus energy asset. If the duplicate is exact, recommend one canonical survivor and explicitly state that linked task 474 is fully covered and must be superseded only after the eventual merge/correction is released and verified.

RESEARCH RULES
- Resolve canonical identity, aliases, operating-company/asset/SPV boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing/entry date, exit date and transaction state; do not infer a fund name.
- Search through 2026-08-19 for ownership transfers, recapitalizations, exits and signed pending transactions.
- Do not confuse the LNG shipping company Cool Company Ltd. / CoolCo with this Cincinnati utility.
- Reopen direct pages and filings. Prefer CoolCo, Harrison Street, seller, municipal/utility records and transaction parties. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://coolco.com/
- https://coolco.com/about-us/
- https://coolco.com/chilled-water-services/
- https://harrisonst.com/harrison-street-acquires-28-mw-cincinnati-solar-project/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
