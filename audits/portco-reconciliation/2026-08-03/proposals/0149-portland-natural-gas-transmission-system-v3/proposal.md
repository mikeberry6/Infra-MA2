# PortCo proposal — Portland Natural Gas Transmission System

- Task: 149 (ledger:0149:portland-natural-gas-transmission-system:15040b8a)
- As of: 2026-08-23
- Actions: CORRECT_COMPANY, ADD_OWNER
- Proposal SHA-256: bcc169b405db816e87b92310c0d09f7eec0510d21efd1c721edef6868b3b591b
- Production snapshot SHA-256: abb3a15a2df1740cecb121ee548db18f117365ed6d27777b4ea29435786cd52c
- Current company snapshot SHA-256: ede32e71a1bfd70d5c8436ec3dd5f64ab754820ae8b8a4e2abe43bdb78830c5c
- After-image SHA-256: 7040a45dbc33320028d602bd3908b5cbcacc2048b16c8000a3c71c18a2a33e82

## Recommendation

Retain one Portland Natural Gas Transmission System record and correct its complete 2024 ownership transition. BlackRock Global Infrastructure Fund IV and North Haven Infrastructure Partners III each acquired a 50% indirect interest through Beehive Loop AcquisitionCo LLC when the US$1.14 billion sale closed on August 15, 2024. The prior direct owners, TC Pipelines and Énergir's Northern New England Investment Company, exited their 61.7% and 38.3% interests at closing. PNGTS remains an active standalone FERC-regulated pipeline; the later MSIP census task is the same canonical company and must not create a duplicate owner or PortCo.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| BlackRock | BlackRock GIF IV | Beehive Loop AcquisitionCo LLC | 50% indirect | 2024 | — | CLOSED_ACTIVE |
| Morgan Stanley Infrastructure Partners | North Haven Infrastructure Partners III | Beehive Loop AcquisitionCo LLC | 50% indirect | 2024 | — | CLOSED_ACTIVE |
| TC Energy Corporation | — | TC Pipelines, Inc. | 61.7% immediately before the August 2024 sale | — | 2024 | REALIZED |
| Énergir L.P. | — | Northern New England Investment Company, Inc. | 38.3% immediately before the August 2024 sale | — | 2024 | REALIZED |

## Source holdings

- 023-blackrock:holding:005:portland-natural-gas-transmission-system
- 069-morgan-stanley-infrastructure-partners:holding:005:portland-natural-gas-transmission-system

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

- [Current business profile and pipeline scale](https://www.pngts.com/who-we-are) — PNGTS remains an active natural-gas transmission system, the system spans approximately 295 miles with nearly 460,000 Dth per day of capacity
- [Funds, acquisition vehicle and equal indirect stakes](https://www.puc.nh.gov/VirtualFileRoom/ShowDocument.aspx?DocumentId=a01d59a1-e6ad-43e6-a7cf-d8c05b178aff) — BlackRock Global Infrastructure Fund IV and North Haven Infrastructure Partners III were equal indirect owners through Beehive Loop AcquisitionCo LLC
- [Announcement, buyers and transaction value](https://www.tcenergy.com/announcements/2024/2024-03-04-tc-energy-announces-sale-of-portland-natural-gas-transmission-system/) — BlackRock and Morgan Stanley Infrastructure Partners were the buyers, the transaction value was approximately US$1.14 billion including assumed notes, the transaction was announced on March 4, 2024
- [Closing and former-owner stake evidence](https://www.tcenergy.com/announcements/2024/2024-08-15-tc-energy-completes-the-sale-of-portland-natural-gas-transmission-system/) — TC Pipelines and Énergir sold their 61.7% and 38.3% interests, the sale closed on August 15, 2024

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
