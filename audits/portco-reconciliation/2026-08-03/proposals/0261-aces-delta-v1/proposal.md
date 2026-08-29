# PortCo proposal — ACES Delta

- Task: 261 (ledger:0261:aces-delta:7027e92e)
- As of: 2026-08-29
- Actions: CORRECT_COMPANY, ADD_OWNER, RETIRE_OWNERSHIP
- Proposal SHA-256: 0f0e0778d641c7ffc6e2735f1f6addbe0470e329931c35bceb4cd7a8a123bd30
- Production snapshot SHA-256: 66c28c421196ec8084d6d90015c46de73240ef8c7a2b8f5542975d555b9348d2
- Current company snapshot SHA-256: ef69e346057a6d35da4673d980d1dfec45d23aad204dcff5939e763e5e0221b2
- After-image SHA-256: 0d01e326f0feaecfd7c84df2e3089d5d11893f76d38f05618aa3c5a8b4aa4084

## Recommendation

Correct ACES Delta's owner roster by removing the unsupported treatment of GIC, OTPP and AIMCo as direct owners. Those institutions, together with Manulife, invested as limited partners in Haddington ESP I. Current direct platform ownership is held through Chevron-controlled Magnum Development as majority owner and Mitsubishi Power Americas as minority owner. Haddington's former indirect platform ownership ended when Chevron acquired Magnum in 2023; Haddington's separately managed ACES I construction equity remains project-level context rather than a direct ACES Delta platform ownership period.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Chevron New Energies | — | Magnum Development, LLC | Majority; exact percentage not publicly disclosed | 2023 | — | CLOSED_ACTIVE |
| Haddington Ventures | — | Haddington Energy Partners III, L.P. via Magnum Development, LLC | Former indirect majority; exact percentage not publicly disclosed | 2019 | 2023 | REALIZED |
| Mitsubishi Power | — | Direct ACES Delta, LLC membership | Minority; exact percentage not publicly disclosed | 2019 | — | CLOSED_ACTIVE |

## Source holdings

- 076-ontario-teachers-pension-plan:holding:001:aces-delta

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

- [Current ownership and company identity](https://aces-delta.com/about-us/) — ACES Delta is a joint venture owned by Chevron-controlled Magnum Development and Mitsubishi Power Americas, The platform was established in 2019
- [LP and project-equity boundary](https://hvllc.com/haddingtonesp/) — GIC, OTPP, AIMCo and Manulife committed capital to Haddington ESP I, The investors were fund LPs rather than disclosed direct ACES Delta owners
- [Chevron acquisition and Haddington exit](https://www.businesswire.com/news/home/20230912536953/en/Chevron-Acquires-Majority-Stake-in-the-Advanced-Clean-Energy-Storage-Hydrogen-Project-in-Delta-Utah) — Chevron acquired 100% of Magnum Development from Haddington, The closed transaction gave Chevron a majority interest in ACES Delta

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
