# PortCo proposal — Channelview Cogeneration

- Task: 266 (ledger:0266:channelview-cogeneration:a4e4cfd5)
- As of: 2026-08-29
- Actions: CREATE_COMPANY
- Proposal SHA-256: c9f55628a22c4e772ce83bc79999a91b2d3bd70e6b566bef338ccf8ddc456d84
- Production snapshot SHA-256: bb59530841115f65b2f6cb1e304b53888ef51f3df42af12d912d039f9fea41cc
- Current company snapshot SHA-256: New company
- After-image SHA-256: 6bf73dd7a4536e63ed38acb8d9b697380a73039030ba90b1e5eff2b4364fc866

## Recommendation

Create one standalone Channelview Cogeneration asset record while correcting the stale census implication that GIP remains a current owner. GIP and Fortistar acquired the plant in 2008 and fully exited to Energy Investors Funds in 2014. Ares subsequently became the fund manager and retained 3% when Elliott acquired 97% in 2025. BlackRock's 2024 acquisition of GIP's manager occurred a decade after the asset exit and is not a Channelview ownership transfer.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Ares Management | — | EIF United States Power Fund IV, L.P. via Ares Channelview Acquisition L.P. / EIF Channelview, LLC | 3% current; 100% from the 2014 acquisition until the 2025 Elliott transaction | 2014 | — | CLOSED_ACTIVE |
| Elliott Investment Management | — | Elliott Associates, L.P. and Elliott International, L.P. via Chip Energy Investor LLC and EIF Channelview, LLC | 97% | 2025 | — | CLOSED_ACTIVE |
| Fortistar | — | GIM Channelview Cogeneration, LLC | 10% | 2008 | 2014 | REALIZED |
| Global Infrastructure Partners | — | GIM Channelview Cogeneration, LLC | 90% | 2008 | 2014 | REALIZED |
| Reliant Energy | — | Reliant Energy Channelview LP and related project entities | 100% control | 2001 | 2008 | REALIZED |

## Source holdings

- 048-global-infrastructure-partners:holding:011:channelview-cogeneration

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

- [Current ownership and legal chain](https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7B70A8259D-0000-CC2D-ADEE-B0DFFB934636%7D&DocTitle=Joint+Petition+for+Declaratory+Ruling+or+Authorization+under+Section+70+PSL) — Elliott owns 97% and the Ares-managed vehicle retains 3%, The legal ownership chain terminates at EIF Channelview Cogeneration, LLC
- [GIP realized status](https://www.global-infra.com/portfolio-page/channelview-cogeneration/) — GIP classifies Channelview as realized rather than current
- [2014 GIP and Fortistar exit](https://www.infrapppworld.com/news/gip-and-fortistar-sell-u-s-power-plant) — Energy Investors Funds completed its acquisition on January 10, 2014, GIP and Fortistar exited the plant

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
