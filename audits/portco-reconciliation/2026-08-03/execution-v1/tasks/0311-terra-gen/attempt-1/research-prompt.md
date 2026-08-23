Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Terra-Gen
MANAGERS TO RESOLVE: Igneo Infrastructure Partners and Pantheon Ventures / Pantheon Infrastructure Plc; also identify Masdar, ECP and all current/former owners
TASK: ledger:0311:terra-gen:621138d4
CANONICAL KEY: terra-gen|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"Production contains Terra-Gen with one active Igneo/GDIF period. Census evidence confirms Igneo and separately lists Pantheon Infrastructure Plc's June 2026 £41m commitment as a direct co-investment. Direct Terra-Gen materials call the company jointly owned by Igneo and Masdar. Resolve whether Pantheon has qualifying direct/co-investment ownership and add all supported owners without double-counting upstream fund exposure.","productionCompanyId":"cmrxpjiqj0128ivhepgbwb3mj","seedKey":"terra-gen|United States","sourceHoldingIds":["056-igneo-infrastructure-partners:holding:009:terra-gen","077-pantheon-ventures:holding:001:terra-gen"],"startingEvidence":["https://terra-gen.com/masdar-accelerates-u-s-renewables-expansion-closes-acquisition-of-50-stake-in-terra-gen/","https://www.igneoip.com/usa/en/institutional/our-offering/assets/terra-gen-soltage.html","https://www.pantheoninfrastructure.com/portfolio/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Terra-Gen","legalNameClaim":"Terra-Gen Power Holdings II, LLC / Terra-Gen, LLC","website":null,"country":"United States","status":"Active","sector":"Power & ET","subsector":"Utility-scale wind, solar, and battery storage","headquarters":"California; Texas; New York","yearFounded":2007,"investmentYear":2020,"owners":[{"firm":"Igneo Infrastructure Partners","vehicle":"Global Diversified Infrastructure Fund (GDIF)","stake":null,"investmentYear":2020,"exitYear":null,"isActive":true}],"descriptionClaim":"Igneo acquired 40% in December 2020 and increased to 50% in 2021; Masdar acquired ECP's remaining 50% on October 1, 2024. Pantheon announced a Terra-Gen commitment in June 2026 but is not yet in the record."}

IDENTITY, OWNERSHIP AND CO-INVESTMENT QUESTIONS
Resolve Terra-Gen's legal/canonical company boundary and holding-company chain. Reconstruct ECP's ownership, Igneo/First Sentier's initial 40% closing on December 31, 2020, later increase to 50%, exact GDIF entity/vehicle and ECP's continuation vehicle. Reconstruct Masdar's 50% acquisition: announcement and October 1, 2024 legal closing and ECP exit. Then determine exactly what Pantheon Infrastructure Plc committed/acquired in June 2026: direct equity or a targeted co-investment in Terra-Gen, participation in an Igneo-managed holding vehicle, fund interest/LP exposure, secondary interest, debt or a pending commitment. Establish closing status, beneficial stake if disclosed, vehicle and whether it reduces/reallocates Igneo's economic 50% without changing Terra-Gen's public two-shareholder cap table. Include qualifying direct co-investment per the census rules, but exclude LP/fund-of-funds exposure. Search through the cutoff for later closings, owner changes, exits and signed pending transactions. Verify current operating scale and treat project SPVs/assets as underlying holdings rather than separate PortCos.

RESEARCH RULES
- Distinguish legal shareholders, beneficial co-investors and non-qualifying LP/fund exposure; do not infer Pantheon's stake from commitment value.
- Require direct evidence for each current owner/co-investor, vehicle, transaction state, date and stake. Use NOT_PUBLICLY_DISCLOSED rather than inference.
- Preserve ECP as former owner and distinguish its continuation fund from the operating company.
- Search through 2026-08-19 for Pantheon closing evidence, later owner changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Terra-Gen, Igneo, Pantheon/PINT RNS or reports, Masdar, ECP and regulatory filings. Use UNRESOLVED for material identity or current ownership; either blocks application.
- Return PROPOSED_CORRECTION, VERIFIED_NO_CHANGE, EXCLUDED or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://terra-gen.com/about-us/our-story/
- https://terra-gen.com/masdar-accelerates-u-s-renewables-expansion-closes-acquisition-of-50-stake-in-terra-gen/
- https://terra-gen.com/media-1/
- https://www.igneoip.com/usa/en/institutional/our-offering/assets/terra-gen-soltage.html
- https://www.pantheoninfrastructure.com/portfolio/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
