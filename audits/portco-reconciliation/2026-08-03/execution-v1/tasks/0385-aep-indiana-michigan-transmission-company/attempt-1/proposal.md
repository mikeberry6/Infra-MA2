# PortCo proposal — AEP Indiana Michigan Transmission Company

- Task: 385 (ledger:0385:aep-indiana-michigan-transmission-company:45ae9c1c)
- As of: 2026-09-01
- Actions: CREATE_COMPANY
- Proposal SHA-256: 2732f8ca78b3aebfb56b8d92d6905126c0a988fb3af53e5f09e576dd08d3d924
- Production snapshot SHA-256: 45b79a0756fe63dc7f4498ab02ad9e2a92e8c9b72893b564bb883ef8a9121509
- Current company snapshot SHA-256: New company
- After-image SHA-256: 41931089717f9b8bed8f46d68e5c876913104f7007377afc560fdb4b86373115

## Recommendation

Create AEP Indiana Michigan Transmission Company, Inc. as a distinct regulated transmission operating company. AEP's 80.1% economic interest and the KKR/PSP consortium's 19.9% interest closed on June 5, 2025. Because KKR and PSP own Olympus 50/50, each has a 9.95% look-through interest; PSP must not be assigned the full consortium stake. No later ownership transfer or pending transaction was found through September 1, 2026.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| American Electric Power | — | AEP Transmission Company, LLC | 100% before the minority sale | 2009 | 2025 | REALIZED |
| American Electric Power | — | AEP Transmission Company, LLC through Midwest Transmission Holdings, LLC | 80.1% look-through | 2025 | — | CLOSED_ACTIVE |
| KKR | — | Olympus BidCo L.P. through Midwest Transmission Holdings, LLC | 9.95% look-through (50% of the 19.9% consortium interest) | 2025 | — | CLOSED_ACTIVE |
| PSP Investments | — | Olympus BidCo L.P. through Midwest Transmission Holdings, LLC | 9.95% look-through (50% of the 19.9% consortium interest) | 2025 | — | CLOSED_ACTIVE |

## Source holdings

- 081-psp-investments:holding:003:aep-indiana-michigan-transmission-company

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

- [KKR and PSP consortium split](https://www.investpsp.com/en/news/kkr-and-psp-investments-acquire-minority-stake-in-two-american-electric-power-transmission-companies/) — KKR and PSP formed a 50/50 partnership for the minority investment
- [Closing date and current economic ownership](https://www.sec.gov/Archives/edgar/data/4904/000000490425000069/aep-20250605.htm) — AEP retained control, The transaction closed on June 5, 2025
- [Legal entities, transaction structure and sponsor attribution](https://www.sec.gov/Archives/edgar/data/6879/000000490425000027/ex10b202410k.htm) — AEP retained 80.1% and Olympus acquired 19.9%, IMTCo is a distinct operating company, Olympus is backed 50/50 by KKR and PSP

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
