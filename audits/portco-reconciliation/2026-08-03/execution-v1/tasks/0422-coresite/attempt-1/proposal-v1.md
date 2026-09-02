# PortCo proposal — CoreSite

- Task: 422 (ledger:0422:coresite:28c96afd)
- As of: 2026-09-02
- Actions: CORRECT_COMPANY, ADD_OWNER
- Proposal SHA-256: c1bab9dcb60950911ff7e24ffc2b1ece8a16f01cf760454d1b05ecba9f7d6802
- Production snapshot SHA-256: ca8b3cf4a8388a8f746b2388783da3d5a3d58cfe4e6c206aab09aa3840eeb03a
- Current company snapshot SHA-256: 854d9e6bbbb4774f4e80ff84661f4ef6fbad77ec70fc44bf5b5c0b5f5af8b84d
- After-image SHA-256: ac5792fc9d8ebfec1964e40c02aa41b778181b0e8ebf0bfb2ff0d0484fafa17c

## Recommendation

Correct the existing CoreSite record to include American Tower's controlling ownership, Stonepeak's last-reported common and preferred interests, and predecessor ownership. Preserve the fully converted 64%/36% ratio as expected economics rather than asserting an unconfirmed conversion completion.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| American Tower Corporation | — | American Tower U.S. data-center holding companies | 71% common at June 30, 2026; approximately 64% on a fully converted basis | 2021 | — | CLOSED_ACTIVE |
| Public market | — | NYSE:COR common shares | Former public float acquired for $170 per share | 2010 | 2021 | REALIZED |
| Stonepeak | — | Platform common and mandatory convertible preferred interests; exact investment vehicles not publicly disclosed | 29% common plus all mandatory convertible preferred interests at June 30, 2026; approximately 36% on a fully converted basis | 2022 | — | CLOSED_ACTIVE |
| The Carlyle Group | — | Carlyle-affiliated predecessor interests; exact funds not publicly disclosed | Former founder and sponsor interests; exact historical percentage not publicly disclosed | 2000 | 2021 | REALIZED |

## Source holdings

- 090-stonepeak:holding:005:coresite-american-tower-u-s-data-center-business

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

- [Initial Stonepeak investment and platform-boundary evidence.](https://stonepeak.com/news/american-tower-partners-with-stonepeak-in-u-s-data-center-business) — American Tower retained control, Stonepeak invested in the U.S. data-center platform in 2022
- [Upsize closing and fully converted economics.](https://stonepeak.com/news/stonepeak-upsizes-investment-in-american-towers-data-center-business) — Stonepeak's total investment reached $3.07 billion and approximately 36% fully converted, The upsize closed on October 20, 2022
- [Current ownership and security evidence.](https://www.sec.gov/Archives/edgar/data/1053507/000105350726000133/amt-20260630.htm) — American Tower held 71% of common equity, CoreSite comprises American Tower's U.S. data-center segment, Stonepeak held 29% of common equity plus all mandatory convertible preferred interests

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
