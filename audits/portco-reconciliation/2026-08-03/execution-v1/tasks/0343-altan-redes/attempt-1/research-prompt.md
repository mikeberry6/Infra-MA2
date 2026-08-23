Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Altán Redes
MANAGERS TO RESOLVE: Morgan Stanley Infrastructure Partners (MSIP); Mexican government/state entities; every current/former direct equity owner or restructuring vehicle
TASK: ledger:0343:altan-redes:7bef6b1d
CANONICAL KEY: altan-redes|mexico

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","originalRecommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"The original queue found no exact production/seed match. The working branch now contains a list-ready Altán Redes, S.A.P.I. de C.V. record attributed to MSIP from 2017, so revalidate that after-image rather than assuming it is correct.","startingEvidence":["https://www.altanredes.com/","https://www.gob.mx/cms/uploads/attachment/file/720828/Comunicado_Altan.pdf","https://www.morganstanley.com/im/en-us/capital-seeker/companies/alt-n-redes.html"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
The current seed record calls the company "Altán Redes, S.A.P.I. de C.V.," describes it as operator of Mexico's wholesale Red Compartida mobile network, records 2016 founding, March 2017 MSIP entry, January 2017 PPP/concession, March 2018 commercial launch, active status, Mexico headquarters, and MSIP as the sole active owner with no named vehicle. It notes a later government-led restructuring and state participation but still treats MSIP as current. Determine whether that active-owner conclusion remains legally and economically correct after insolvency/restructuring and government capital support.

IDENTITY, RESTRUCTURING AND OWNERSHIP QUESTIONS
Resolve exact legal name, aliases, parent/holding companies, concessionaire/project-company boundary and distinction between Altán Redes and Red Compartida. Reconstruct original shareholder consortium, MSIP's fund/vehicle/stake and legal entry, bankruptcy/insolvency or concurso proceedings, creditor capitalization, government rescue, development-bank/state participation, any dilution or loss of control and all later changes through the cutoff. Separate direct equity, concession rights, debt, guarantees and public support. Determine which original owners, if any, remain current and whether the Mexican state or a state-controlled trust/entity became an owner.

Search through the cutoff for recapitalizations, sales, transfers, concession amendments, MSIP exit, nationalization/state-control changes, signed pending transactions and operating distress. Verify official website, founding/formation, headquarters, wholesale customers, network technology, current footprint/population coverage, infrastructure-strategy basis and North American qualification. Count the manager-level wholesale-network platform once; exclude towers, spectrum/concession instruments, lenders and individual network projects.

RESEARCH RULES
- Resolve canonical identity, aliases, concession/platform/subsidiary boundary, current/former owners and exact manager/fund/vehicle attribution.
- Verify every stake, announcement/closing/entry/exit date, restructuring step and transaction state.
- Search through 2026-08-19 for later ownership transfers, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Altán, Mexican government/regulators/courts/development banks, MSIP and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material current-ownership uncertainty.
- Return PROPOSED_CORRECTION if the existing branch record should be retained but corrected, VERIFIED_NO_CHANGE only if its active MSIP ownership is still supported, PROPOSED_MERGE if a duplicate identity is proven, EXCLUDED if MSIP's exposure is no longer/currently not qualifying direct ownership, or DEFERRED if current ownership remains unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.altanredes.com/
- https://www.gob.mx/cms/uploads/attachment/file/720828/Comunicado_Altan.pdf
- https://www.morganstanley.com/im/en-us/capital-seeker/companies/alt-n-redes.html

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
