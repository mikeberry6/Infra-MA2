# PortCo proposal — Revolution Wind & South Fork Wind

- Task: 150 (ledger:0150:revolution-wind-and-south-fork-wind:141c088f)
- As of: 2026-08-23
- Actions: CORRECT_COMPANY, ADD_OWNER
- Proposal SHA-256: 431e52ca65cbd7ecb93e0cada8029a773a6a9c83cbc18463fa97be05b6208f42
- Production snapshot SHA-256: 2cd28155c38ce31d29815aae4975f71d9d3e41074728c49a358380ff4533aab8
- Current company snapshot SHA-256: 8548e0a8298ecad123ffdb452d9d495736cbb664cfd5f26a85d11be1ab5e209d
- After-image SHA-256: ae8b8ff30666a98ea06f99029d71789c7a8e67fa23c81f0469085bb329dc1d2e

## Recommendation

Retain the paired Revolution Wind and South Fork Wind record while correcting its legal-entity boundary and complete ownership history. GIP IV Whale/designated affiliates bought Eversource's 50% interests in both project LLCs at the September 30, 2024 closing, and Skyborn manages GIP's interests. Ørsted retains the other 50% of each project. BlackRock's October 2024 acquisition of GIP was an upstream manager transaction and did not create a separate BlackRock project ownership period. South Fork is operating and Revolution began delivering power in March 2026; no later project sale or signed pending exit was found.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Eversource Energy | — | North East Offshore, LLC; South Fork Class B Member, LLC | Former 50% of each project | 2019 | 2024 | REALIZED |
| GIP | — | GIP IV Whale Fund Holdings, L.P. and designated affiliates | 50% of each project | 2024 | — | CLOSED_ACTIVE |
| Ørsted | — | Ørsted DevCo, LLC; Ørsted SF Class B Member, LLC | 50% of each project since 2019 | 2018 | — | CLOSED_ACTIVE |

## Source holdings

- 048-global-infrastructure-partners:holding:012:revolution-wind-and-south-fork-wind

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

- [Regulatory ownership, vehicle and legal-entity evidence](https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7BC09E878F-0000-CA75-B0A2-F8C5D3DB3507%7D) — GIP IV Whale/designated affiliates were the acquisition vehicles, GIP acquired Eversource's 50% interests in Revolution Wind, LLC and South Fork Wind, LLC, Ørsted retained the other 50% interests
- [BlackRock-GIP parent transaction context](https://www.blackrock.com/corporate/newsroom/media/press-releases/blackrock-completes-acquisition-of-global-infrastructure-partners) — BlackRock completed its acquisition of GIP after the project-level closing, the manager transaction does not establish a separate BlackRock asset period
- [Closing and Eversource exit evidence](https://www.sec.gov/Archives/edgar/data/72741/000110465924104387/tm2425236d1_ex99-1.htm) — Eversource completed the sale of its 50% project interests on September 30, 2024
- [Current GIP ownership and Skyborn management evidence](https://www.skybornrenewables.com/articles/newsroom/skyborn_enters_us_joint_venture) — Skyborn manages GIP's U.S. offshore-wind joint-venture interests, the project interests remained partnered with Ørsted

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
