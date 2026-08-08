# PortCo proposal — Brightspeed

- Task: 46 (ledger:0046:brightspeed:f81f08b3)
- As of: 2026-08-08
- Actions: CORRECT_COMPANY, RETIRE_OWNERSHIP, ADD_PENDING_TRANSACTION
- Proposal SHA-256: bc6630e883a2af241225a11ebf999846cb6aa04b2cf2a769e4b0cec39ea377ca
- Production snapshot SHA-256: 268f91403b0d623d2d9af22d6589959d433276e3cc77dbca932d94558750d831
- Current company snapshot SHA-256: 4ec002ac33cf8295bb52bf10d747a561c4bf69983e9857207ed03be1d7082814
- After-image SHA-256: a43f8165ac87b8116dcbcec0b5e78b888a1e9fc91a66d96d80caa248c2a5b1f3

## Recommendation

Keep Brightspeed active and correct the ownership-scope treatment. Apollo's original acquisition was led by private-equity funds, but the FCC's 2022 approval order for the subsequently consummated acquisition also identifies AIOF II Connect Holdings, L.P. as a direct owner with less than 5%; Apollo identifies AIOF II as a dedicated infrastructure fund. The FCC's December 2023 ruling shows AIOF II at 2% equity and 3% voting only in the proposed post-Mubadala structure. Retain the manager's active ownership period, identify the AIOF II vehicle within the Apollo-managed ownership group and qualify the historical disclosures because Brightspeed's August 2024 recapitalization issued warrants and preferred stock. Mubadala's May 2, 2023 $500 million minority investment was signed subject to regulatory approvals. The FCC approved the proposed foreign-ownership structure on December 20, 2023, but no public legal-closing announcement or date was found. Retire the unsupported closed-active Mubadala period and record the investment as SIGNED_PENDING_INCOMING through CEPSA Holding LLC. No Apollo or Mubadala exit was found through August 8, 2026.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Apollo Global Management | — | Apollo-managed funds (including AIOF II Connect Holdings, L.P.) | Current combined stake not publicly disclosed; AIOF II was less than 5% after the Oct 2022 close (2% equity / 3% voting in the Dec 2023 pro forma structure) | 2022 | — | CLOSED_ACTIVE |
| Mubadala | — | CEPSA Holding LLC (signed transaction; legal closing not publicly confirmed) | Proposed ~28% equity / ~3% voting in the FCC-approved Dec 2023 structure; current exact stake not publicly disclosed | — | — | REALIZED |

## Source holdings

- 070-mubadala:holding:001:brightspeed

## Retired company records

- None

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| — | — | — | None |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [Regulatory evidence for the consummated acquisition structure and AIOF II's direct interest of less than 5%](https://docs.fcc.gov/public/attachments/DA-22-871A1.pdf) — CLOSED_ACTIVE, INFRASTRUCTURE_VEHICLE, OWNERSHIP_CHAIN
- [Regulatory evidence for the proposed post-Mubadala ownership structure and its pro forma percentages](https://docs.fcc.gov/public/attachments/DA-23-1195A1.pdf) — MUBADALA_PENDING_TRANSACTION, PROPOSED_OWNERSHIP_STRUCTURE, PRO_FORMA_STAKE, VEHICLE
- [Apollo primary evidence that AIOF II is its dedicated infrastructure fund](https://ir.apollo.com/_assets/_6af0e860d6a2e33effc1927c5d4ca6b9/apollo/news/2022-01-06_Apollo_Closes_Second_Dedicated_Infrastructure_38.pdf) — FUND_IDENTITY, INFRASTRUCTURE_STRATEGY
- [Apollo strategy classification and original acquisition context](https://www.apollo.com/insights-news/insights/2022/02/brightspeed-broadband-across-the-land) — IDENTITY, ORIGINAL_ACQUISITION, PRIVATE_EQUITY_STRATEGY
- [Completed August 2024 recapitalization, continuing Apollo involvement and current operating status](https://www.brightspeed.com/brightspeed-news/Brightspeed_Enters_Next_Era_of_Growth_as_Fiber_Broadband_Leader/) — CURRENT_OWNERSHIP, CURRENT_STATUS, EXIT_SEARCH, RECAPITALIZATION
- [Primary evidence of recapitalization warrants and preferred stock affecting interpretation of older ownership percentages](https://www.brightspeed.com/content/dam/brightspeed/pdfs/Form%208937%20Attachments.pdf) — RECAPITALIZATION, STAKE_QUALIFICATION, TRANSACTION_DATE
- [Signed Mubadala transaction, conditions precedent, digital-infrastructure strategy and U.S. operating profile](https://www.brightspeed.com/content/dam/brightspeed/pdfs/brightspeed-mubadala-press-release.pdf) — GEOGRAPHY, HEADQUARTERS, INFRASTRUCTURE_STRATEGY, SIGNED_TRANSACTION, TRANSACTION_STATE
- [Post-recapitalization parent structure showing AP IX Connect Holdings as the holder of approximately 62% of Connect Parent common stock](https://www.nj.gov/bpu/pdf/boardorders/2025/20250618/IVA%20ORDER%20Brightspeed%20Credit%20Agreement%20Refinancing.pdf) — CURRENT_PARENT_STRUCTURE, CURRENT_STATUS, EXIT_SEARCH

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
