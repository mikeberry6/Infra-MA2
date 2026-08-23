Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Aerostar Airport Holdings (Luis Muñoz Marín Airport)
REQUESTED MANAGER: PSP Investments; identify every current/former direct owner
TASK: ledger:0387:aerostar-airport-holdings-luis-munoz-marin-airport:289dd4e3
CANONICAL KEY: aerostar-airport-holdings-luis-munoz-marin-airport|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"The census treated Aerostar Airport Holdings, operator of Luis Muñoz Marín International Airport, as a current PSP-linked standalone asset through AviAlliance, but no canonical record exists and no investment year or stake was established. Verify the direct cap table, AviAlliance/PSP look-through, any Aena transaction, legal closing dates and current owner set before creation.","productionCompanyIds":[],"seedKeys":[],"sourceHoldingId":"081-psp-investments:holding:004:aerostar-airport-holdings-luis-munoz-marin-airport","startingEvidence":["https://aeropuertosju.com/"]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the canonical relationship among Aerostar Airport Holdings, LLC, Luis Muñoz Marín International Airport/SJU, Aerostar Airport Holdings Puerto Rico, AviAlliance, ASUR/Grupo Aeroportuario del Sureste and any concession or acquisition holding vehicles. Count the manager-level concessionaire once; do not split terminals, airport facilities, concession contracts, operating subsidiaries or financing issuers.

Rebuild Aerostar's direct ownership history. Verify each shareholder and comparable stake, concession award/financial close, later transfers and the date AviAlliance became an owner. Establish PSP Investments' ownership of AviAlliance, the relevant entry date and whether PSP had only look-through platform ownership rather than direct Aerostar shares. Investigate every announced or closed sale of AviAlliance, including any Aena transaction, and determine whether it changed the current beneficial owner of Aerostar before the 2026-08-19 cutoff. Do not leave PSP active after a legal closing; do not replace it on mere announcement.

Search through 2026-08-19 for later stake sales, recapitalizations, concession changes, new investors and signed pending ownership transactions. Distinguish Aerostar equity from the airport concession, project debt, public-private-partnership obligations, airline/customer relationships and Puerto Rico Ports Authority ownership of the underlying airport.

BOUNDARY AND OPERATING PROFILE
Confirm official website, headquarters, concession start and expiry, passenger/airline scale, terminal/runway footprint, products/services, customers/end markets and two to four material milestones. Treat Puerto Rico as United States/North America for census geography while stating it precisely.

RESEARCH RULES
- Resolve canonical identity, aliases, concession/operator/parent-platform boundary, current/former direct and look-through owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Aerostar/SJU, AviAlliance, PSP, ASUR, Aena, Puerto Rico/Federal sources, regulatory filings and transaction releases. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW only if a qualifying distinct canonical concession company should be created; EXCLUDED if PSP lacked qualifying direct/look-through equity as of the applicable period; PROPOSED_MERGE if an existing identity is found; DEFERRED if the current beneficial owner or legal-close status remains unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCE TO REOPEN
- https://aeropuertosju.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
