Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Recurrent Energy
MANAGERS TO RESOLVE: BlackRock; Canadian Solar; identify all direct current and former owners
TASK: ledger:0270:recurrent-energy:9b92b574
CANONICAL KEY: recurrent-energy|united-states-canada

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The existing company and BlackRock owner match the census, but repository fund attribution is inferred with low confidence. Verify the 2024 convertible investment, exact current stake, Canadian Solar's retained interest, the actual BlackRock vehicle and all later ownership changes.","productionCompanyId":"cmrxpj91e00ncivhexql11j44","seedKey":"recurrent energy|United States / Canada","startingEvidence":["https://recurrentenergy.com/recurrent-energy-announces-closing-of-500-million-investment-from-blackrock/"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Recurrent Energy","country":"United States / Canada","status":"Active","sector":"Power & ET","subsector":"Utility-scale solar and storage","yearFounded":2006,"investmentYear":2024,"headquarters":"United States and Canada, with international operations","owners":[{"firm":"BlackRock","vehicle":"n.a.","inferredFund":"BlackRock GIF IV","fundAttributionConfidence":"LOW","investmentYear":2024,"stake":"20% of fully diluted shares at closing","isActive":true},{"firm":"Canadian Solar","vehicle":null,"investmentYear":2006,"stake":"majority retained after BlackRock closing","isActive":true}],"description":"The repository describes a global solar-and-storage developer, owner and operator. It says BlackRock committed US$500 million through a convertible investment that represented 20% of fully diluted shares at the October 2024 closing, while Canadian Solar retained majority ownership.","milestones":[{"date":"2006","event":"Recurrent Energy was founded.","category":"Founding"},{"date":"Jan 8, 2024","event":"BlackRock announced a US$500 million capital commitment.","category":"Financing"},{"date":"Oct 3, 2024","event":"Recurrent Energy announced final closing of BlackRock's investment.","category":"Financing"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve Recurrent Energy, its legal parent and Canadian Solar subsidiary relationship, aliases, geographic divisions, project SPVs and asset boundary. Reconstruct the January 2024 commitment and October 2024 final closing, including security type, exact 20% calculation, Canadian Solar's retained percentage/control, investment tranches, any board or governance rights, and the actual BlackRock fund, strategy, managed account or investment vehicle. Do not accept the repo's inferred BlackRock GIF IV attribution without direct evidence. Determine whether BlackRock's climate-infrastructure business reorganization or GIP integration changed the manager label or underlying ownership. Search through the cutoff for additional closings, conversion, dilution, recapitalization, IPO, strategic investment, sale, Canadian Solar transfer, BlackRock exit or signed pending transaction. Verify current operating/development scale, owned versus developed/sold assets, customers/end markets, headquarters and global footprint.

RESEARCH RULES
- Resolve canonical identity, aliases, parent/subsidiary/project-SPV boundary, current/former direct owners and manager/fund/vehicle attribution.
- Verify every stake, security, announcement date, legal closing date, entry date, exit date and transaction state. Do not infer a BlackRock fund from vintage or manager matching.
- Search through 2026-08-19 for conversion, dilution, recapitalization, IPO, owner transfer, sale, exit and signed pending transactions.
- Keep Recurrent Energy as the manager-level company; do not count its individual solar or storage projects as separate PortCos unless independently held by another in-scope manager.
- Reopen direct pages and filings. Prefer Recurrent Energy, Canadian Solar filings/releases, BlackRock and regulatory sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://recurrentenergy.com/
- https://recurrentenergy.com/about/
- https://recurrentenergy.com/recurrent-energy-announces-closing-of-500-million-investment-from-blackrock/
- https://investors.canadiansolar.com/
- https://www.blackrock.com/corporate/about-us/blackrock-climate-infrastructure

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
