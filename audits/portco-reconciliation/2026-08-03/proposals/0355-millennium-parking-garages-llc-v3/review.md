# PortCo proposal — Millennium Parking Garages, LLC

- Task: 355 (ledger:0355:millennium-parking-garages-llc:9385654a)
- As of: 2026-09-01
- Actions: CORRECT_COMPANY, ADD_OWNER
- Proposal SHA-256: f12f6c7df4acc9dd0315bab12c0208bb64ad1be2b952e916682c9d7c299f3299
- Production snapshot SHA-256: 991634f393cb7905dd9f5e9a7220ff9dd1d75895b78002556a1461b25fce259d
- Current company snapshot SHA-256: cf9277148919de3caa666a5d5cdae1ba4116db903d73d9776bf03aea11383cb7
- After-image SHA-256: 7243613e3ce5c5e48e04f19e5a1a95eb6ba7553b1777743f9b3a984fd1a8867c

## Recommendation

Keep one Millennium Parking Garages concession record, retain Northleaf as a current 50% owner, add InfraBridge-managed Global Infrastructure Fund I as the second current 50% owner from the February 2023 manager succession, and preserve AMP Capital as the predecessor manager of that same interest.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| InfraBridge (DigitalBridge) | — | Global Infrastructure Fund I (then managed by AMP Capital) | 50% | 2016 | 2023 | REALIZED |
| InfraBridge (DigitalBridge) | — | Global Infrastructure Fund I | 50% | 2023 | — | CLOSED_ACTIVE |
| Northleaf | — | Northleaf-managed infrastructure vehicle; exact fund/SPV not publicly disclosed | 50% (inferred from equal US$185 million buyer contributions; not directly disclosed) | 2016 | — | CLOSED_ACTIVE |

## Source holdings

- 071-northleaf-capital:holding:008:millennium-parking-garages-llc

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

- [Government evidence for the concession, buyer group and May 2016 acquisition.](https://www.fhwa.dot.gov/ipd/project_profiles/il_millennium_parking_garages_concession.aspx) — Millennium Parking Garages is one four-garage concession platform., Northleaf and AMP Capital acquired the concession in May 2016.
- [Official manager-succession evidence.](https://www.infrabridge.com/news/2023-02-03-digitalbridge-completes-acquisition-of-amp-capital-global-infrastructure-equity-investment-management-business) — InfraBridge succeeded AMP Capital as manager on February 2, 2023., The underlying fund interest continued through the manager succession.
- [Current manager portfolio evidence.](https://www.infrabridge.com/our-portfolio) — InfraBridge currently manages the Millennium Garages investment., The investment remains in Global Infrastructure Fund I.

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
