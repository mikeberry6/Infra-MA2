Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: TraPac LLC
MANAGERS TO RESOLVE: Macquarie Asset Management; Ocean Network Express / ONE; Mitsui O.S.K. Lines and any other former owners
TASK: ledger:0332:trapac-llc:57512da4
CANONICAL KEY: trapac-llc|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":[],"rationale":"The Macquarie census found that Ocean Network Express acquired control of TraPac in 2023 and Macquarie-managed funds may have retained a diluted minority interest. The seed records Macquarie as an active owner through MIP VI but gives no stake or exact entry date. Independently reconstruct the full ownership chain and current cap table.","productionCompanyId":"cmrxpjkef014uivhe5e0g04g8","seedKey":"trapac llc|United States","sourceHoldingId":"065-macquarie-asset-management:holding:025:trapac-llc","startingEvidence":["https://www.one-line.com/en/news/one-strengthens-global-presence-terminal-acquisitions-us-west-coast-and-rotterdam","https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A52023M11056","https://www.macquarie.com/au/en/about/company/macquarie-asset-management/our-portfolio/trapac.html"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"TraPac LLC","country":"United States","status":"Active","sector":"Transportation","subsector":"Marine container terminals","website":"https://www.trapac.com/","yearFounded":1985,"investmentYear":2023,"headquarters":"California","owners":[{"firm":"Macquarie Asset Management","vehicle":"Macquarie Infrastructure Partners VI","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2023,"isActive":true}],"description":"The seed describes a two-terminal Los Angeles/Oakland platform established by Mitsui O.S.K. Lines and says ONE completed a 51% acquisition in 2023 while Macquarie-managed funds remained an investor.","milestones":[{"date":"1985","event":"TraPac was established by Mitsui O.S.K. Lines.","category":"Founding"},{"date":"1991","event":"TraPac expanded to Oakland.","category":"Expansion"},{"date":"2023","event":"MIP VI invested in TraPac.","category":"Financing"},{"date":"Jan 9, 2026","event":"TraPac announced new ship-to-shore cranes.","category":"Expansion"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve TraPac's exact legal identity, aliases, operating subsidiaries, acquisition holding companies, and relationship to its Los Angeles and Oakland terminal concessions. Reconstruct all relevant ownership from MOL through any Macquarie/MIP VI acquisition and the 2023 ONE transaction: verify announcement and legal closing dates; what stake each seller transferred; whether ONE acquired exactly 51%; whether Macquarie acquired, retained, sold, or diluted an interest; every direct current/former owner; each disclosed percentage; exact Macquarie fund/vehicle; and any management or strategic rollover. Reopen EU/other competition decisions and transaction-party releases rather than inferring the residual 49% owner. Search through the cutoff for a later sale, recapitalization, dilution, concession change, ownership transfer, signed pending exit, or operator restructuring. Verify current ownership from current company/ONE/Macquarie/filing sources.

BOUNDARY AND RELATED-RECORD QUESTIONS
Count TraPac once as the manager-level two-terminal operating platform. Do not separately count Los Angeles or Oakland terminals, berths, rail assets, cranes, concessions, or holding SPVs. Resolve whether the 2022 Ceres–JAXPORT arrangement at the former TraPac Jacksonville facility has any corporate relationship to TraPac LLC after the Jacksonville business changed operators; do not merge Ceres Terminals Jacksonville into TraPac merely because the terminal retained a TraPac name in a lease announcement. Keep International Transportation Service and Long Beach Container Terminal separate.

Verify the official website, founding year, headquarters wording, terminal footprint, services, customers/end markets, operating status, infrastructure-strategy basis and North American qualification. Do not infer a current Macquarie percentage, ONE percentage beyond direct evidence, or MIP VI entry year from a close year without a source.

RESEARCH RULES
- Resolve canonical identity, aliases, platform/terminal/concession/SPV boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit date, and transaction state.
- Search through 2026-08-19 for subsequent ownership transfers, recapitalizations, exits, concession changes, and signed pending transactions.
- Reopen direct pages and filings. Prefer TraPac, ONE, Macquarie, MOL, competition/regulatory decisions, port records, and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE, or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.trapac.com/
- https://www.trapac.com/history/
- https://www.macquarie.com/au/en/about/company/macquarie-asset-management/our-portfolio/trapac.html
- https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A52023M11056
- https://www.one-line.com/en/news/one-strengthens-global-presence-terminal-acquisitions-us-west-coast-and-rotterdam

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
