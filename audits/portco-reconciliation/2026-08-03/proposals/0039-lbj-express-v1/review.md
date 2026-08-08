# PortCo proposal — LBJ Express

- Task: 39 (ledger:0039:lbj-express:7e5653c8)
- As of: 2026-08-08
- Actions: CORRECT_COMPANY, MERGE_COMPANIES
- Proposal SHA-256: 5ed0fec8c6e92595037fcac5b9bc6455d6f92e86dafa20269aa12cc6acc56304
- Production snapshot SHA-256: f2ac5a2fd25b7e1a4b429097bf57328c371766f2d2ef78e0bb9aa7d3daaa6934
- Current company snapshot SHA-256: d18396831a70cd0bbcfbf4fa8cc9490699c8c5e57979e2b108f527c99d54fa88
- After-image SHA-256: 3d90b8fab852905b26e866ba65f2fa74b187bbf6bd85430d6c28cc5c3a6309ab

## Recommendation

Consolidate the duplicate LBJ Express and LBJ Infrastructure Group, LLC repository records under LBJ Infrastructure Group, LLC, the legal concession company, while preserving LBJ Express as the principal project alias. TxDOT and USDOT identify LBJ Infrastructure Group, LLC as the concession company and TIFIA borrower for the same IH 635 managed-lanes project marketed as LBJ Express, so the two published records represent one 52-year Dallas toll-road concession rather than separate portfolio companies. Correct APG's investment year from 2010 to 2012 because a federal P3 report states that APG joined in August 2012 by acquiring an interest from Meridiam. Ferrovial's audited 2025 ownership table and its SEC-filed May 2026 factbook confirm the current ownership split as Cintra 54.60%, LBJ Blocker (APG) 28.33%, and Meridiam Infrastructure S.a.r.l. (MI LBJ) 17.07%. Preserve APG Asset Management and Meridiam as separate active manager ownership periods with their disclosed stakes and vehicles, collapse only the explicitly mapped duplicate ownership and milestone rows, retain the unique 2025 anniversary milestone, deduplicate the sources, add the current project website, and retire the duplicate legal-name record through the canonical redirect workflow. Current Ferrovial, Meridiam, TxDOT, USDOT, and project materials show the concession in operation through 2061, and no later APG or Meridiam exit, pending sale, or change of control was found through August 8, 2026. Cintra's controlling interest is stated in the description and evidence but is not added as a manager ownership period because Cintra/Ferrovial is outside the supplied 100-manager census universe and no matching organization dependency exists in the approved task snapshot.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| APG Asset Management | — | LBJ Blocker (APG) | 28.33% | 2012 | — | CLOSED_ACTIVE |
| Meridiam | — | Meridiam Infr. S.a.r.l. (MI LBJ) | 17.07% | 2010 | — | CLOSED_ACTIVE |

## Source holdings

- 009-apg-infrastructure:holding:011:lbj-express
- 067-meridiam:holding:010:lbj-express

## Retired company records

- cmrxpj5ez00hrivhe2s6f2ot4

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| MILESTONE | cmrxpkhjd02jaivher8t6uyg1 | cmrxpkhfa02j4ivhe2x9ysgdh | Collapse the two 2009 formation/commercial-close milestones into the sourced September 2009 CDA milestone. |
| MILESTONE | cmrxpkhjz02jbivhe1yn6681i | cmrxpkhfw02j5ivhei82a401q | Collapse the duplicate June 22, 2010 financial-close milestones into one sourced event. |
| MILESTONE | cmrxpkhko02jcivhex2stim7j | cmrxpkhgf02j6ivhew7v9ge3n | Collapse the duplicate January 2011 construction-start milestones into one sourced event. |
| MILESTONE | cmrxpkhl302jdivhe0365fn6a | cmrxpkhhs02j8ivhejrlflthg | Collapse the duplicate September 2015 opening milestones into the exact USDOT substantial-completion event. |
| OWNERSHIP_PERIOD | cmrxpjqf201ehivhefsuv4npx | cmrxpjqei01egivhecrprfbm2 | Both rows represent APG's ownership of the same LBJ concession; retain the task-bound APG period and correct it to APG's evidenced August 2012 entry, current vehicle, and current stake. |

## Evidence

- [Official 2017 ownership-change evidence for the Dallas Police and Fire Pension System exit and acquisition by the remaining partners.](https://reports.ferrovial.com/2017/business-performance/overview.html) — MILESTONE_EVENT, OWNERSHIP_CHANGE
- [Federal P3 history establishing that APG entered the concession in August 2012 through a purchase from Meridiam.](https://rosap.ntl.bts.gov/view/dot/64188/dot_64188_DS1.pdf) — INVESTMENT_DATE, OWNERSHIP_CHANGE
- [Federal project profile establishing concessionaire identity, financial close, delivery model, geography, and project scope.](https://www.fhwa.dot.gov/ipd/project_profiles/tx_lbj_express.aspx) — GEOGRAPHY, IDENTITY, INFRASTRUCTURE_STRATEGY, INVESTMENT_DATE, MILESTONE_EVENT
- [Current Meridiam portfolio page confirming the in-operation asset, ownership split, and managed-lanes infrastructure basis.](https://www.meridiam.com/assets/1-8/) — CURRENT_OWNERSHIP, CURRENT_STATUS, INFRASTRUCTURE_STRATEGY, STAKE
- [Official September 2020 refinancing and operating-status evidence.](https://www.meridiam.com/news/successful-refinancing-of-lbj-express-a-usd-26-billion-highway-project-in-usa/) — CURRENT_STATUS, MILESTONE_EVENT
- [Audited year-end 2024 ownership table identifying the APG and Meridiam holding vehicles and exact stakes.](https://www.sec.gov/Archives/edgar/data/1468522/000146852225000034/R88.htm) — CURRENT_OWNERSHIP, STAKE, VEHICLE
- [Current SEC-filed sponsor factbook confirming the operating concession, ownership split, geography, scale, and term.](https://www.sec.gov/Archives/edgar/data/1468522/000162828026032618/ferrovial-factbook2026_s.htm) — CURRENT_OWNERSHIP, CURRENT_STATUS, EXIT_SEARCH, GEOGRAPHY, STAKE
- [Official project history supporting the September 2025 tenth-anniversary milestone and continuing consortium identity.](https://www.texpresslanes.com/lbj10/) — CURRENT_STATUS, MILESTONE_EVENT
- [Current public project website for LBJ Express operations and customer information.](https://www.texpresslanes.com/projects/lbj/) — CURRENT_STATUS, OPERATIONS_ASSETS, WEBSITE
- [Current USDOT profile tying LBJ Express to LBJ Infrastructure Group, LLC and confirming commercial close, construction, and substantial completion.](https://www.transportation.gov/buildamerica/projects/ih-635-managed-lanes) — IDENTITY, MILESTONE_EVENT, WEBSITE
- [Official public-counterparty evidence for the predecessor name, legal concessionaire, and September 2009 comprehensive agreement.](https://www.txdot.gov/business/road-bridge-maintenance/alternative-delivery/i635/executed-agreements.html) — IDENTITY, MILESTONE_EVENT

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
