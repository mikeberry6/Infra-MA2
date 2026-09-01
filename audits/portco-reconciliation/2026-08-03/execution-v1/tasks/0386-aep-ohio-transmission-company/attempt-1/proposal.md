# PortCo proposal — AEP Ohio Transmission Company

- Task: 386 (ledger:0386:aep-ohio-transmission-company:b61a164a)
- As of: 2026-09-01
- Actions: CREATE_COMPANY
- Proposal SHA-256: 27e36d2578e8caa040772a8c12db88587d904dc6fe889dcc528b5f365591fafe
- Production snapshot SHA-256: 3b8cb64ddf4ea11f2ae150c4ce85be9ca430a9a1c45fa04336948aa052f1e696
- Current company snapshot SHA-256: New company
- After-image SHA-256: 7e44c04c3a1cccdb7f80790b27f34d5086a05b1da7e5fa5d8f70cccbff80ac24

## Recommendation

Create AEP Ohio Transmission Company, Inc. as a distinct regulated transmission operating company. Midwest owns the company directly; AEP holds 80.1% of Midwest and the KKR/PSP-backed Olympus vehicle holds 19.9%. KKR and PSP own Olympus 50/50, making each sponsor's look-through stake 9.95%. The investment closed on June 5, 2025 and no later ownership event was found through September 1, 2026.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| American Electric Power | — | AEP Transmission Company, LLC | 100% before the minority sale | 2009 | 2025 | REALIZED |
| American Electric Power | — | AEP Transmission Company, LLC through Midwest Transmission Holdings, LLC | 80.1% look-through | 2025 | — | CLOSED_ACTIVE |
| KKR | — | Olympus BidCo L.P. through Midwest Transmission Holdings, LLC | 9.95% look-through (50% of the 19.9% consortium interest) | 2025 | — | CLOSED_ACTIVE |
| PSP Investments | — | Olympus BidCo L.P. through Midwest Transmission Holdings, LLC | 9.95% look-through (50% of the 19.9% consortium interest) | 2025 | — | CLOSED_ACTIVE |

## Source holdings

- 081-psp-investments:holding:002:aep-ohio-transmission-company

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

- [Operating-company identity and regulated transmission profile](https://docs.aep.com/docs/investors/fercfilings/docs/2025/AEP%20Ohio%20Transmission%20Company%202025%20FF1_compressed.pdf) — Midwest owns OHTCo directly, OHTCo is a distinct Ohio transmission-only utility
- [KKR and PSP consortium split](https://www.investpsp.com/en/news/kkr-and-psp-investments-acquire-minority-stake-in-two-american-electric-power-transmission-companies/) — KKR and PSP formed a 50/50 partnership
- [Closing, legal chain and current ownership](https://www.sec.gov/Archives/edgar/data/4904/000000490425000069/aep-20250605.htm) — AEP retained 80.1%, Olympus acquired 19.9%, The transaction closed on June 5, 2025

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
