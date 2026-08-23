Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-22. Use current web research, open direct pages, and search acquisitions plus later restructurings/exits. Treat repository and census claims as unverified.

REQUESTED COMPANY: Altán Redes
MANAGERS/PARTIES: Morgan Stanley Infrastructure Partners (MSIP); Mexican government/state entities; every current/former direct equity owner or restructuring vehicle
TASK: ledger:0343:altan-redes:8c5ff493
CANONICAL KEY: altan-redes|mexico

RECOVERY CONTEXT
The prior Pro run researched ownership layers but was rate-limited before emitting a packet; its one repair returned an internal-server error. Start fresh. A diagnostic hint—not an accepted fact—suggested CFE's 2025 purchase covered China–Mexico Fund and other minority blocks rather than MSIP's Marapendi stake.

LEDGER ISSUE
No exact company existed when queued, but the branch now contains a list-ready `Altán Redes, S.A.P.I. de C.V.` record: Mexico wholesale Red Compartida operator; founded 2016; MSIP entry March 2017; MSIP sole active owner; later government-led restructuring/state participation. Revalidate the whole after-image, especially whether MSIP remained a qualifying direct owner after insolvency, creditor capitalization and public rescue.

QUESTIONS
- Resolve legal name, aliases, parent/holding entities, concessionaire/project boundary and Altán versus Red Compartida.
- Reconstruct the original consortium, MSIP fund/vehicle/stake/entry, concurso or insolvency proceedings, creditor capitalization, government rescue, development-bank/state participation, dilution/control changes and all later changes.
- Separate direct equity from concession rights, debt, guarantees and public support. Identify which original owners remain and whether the Mexican state or a state-controlled entity became an owner.
- Search through the cutoff for recapitalizations, sales, transfers, concession amendments, MSIP exit, state-control changes and signed pending transactions.
- Verify website, formation, headquarters, wholesale customers, network technology, current footprint/coverage, infrastructure basis and Mexico qualification.
- Count one manager-level wholesale network; exclude towers, spectrum/concession instruments, lenders and individual projects.

STARTING SOURCES TO REOPEN
- https://www.altanredes.com/
- https://www.gob.mx/cms/uploads/attachment/file/720828/Comunicado_Altan.pdf
- https://www.morganstanley.com/im/en-us/capital-seeker/companies/alt-n-redes.html

Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material current-ownership uncertainty. Return PROPOSED_CORRECTION if the branch record should remain but change; VERIFIED_NO_CHANGE only if active MSIP ownership is fully supported; PROPOSED_MERGE for a proven duplicate; EXCLUDED if the exposure is not qualifying direct ownership; or DEFERRED if current ownership remains unresolved. Research only; no database syntax or Deal Database changes.

Return plain text only:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the entire response under 5,500 characters, with at most 6 evidence rows and 3 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
