# PortCo proposal — 407 International Inc.

- Task: 384 (ledger:0384:407-international-inc:e9ed737e)
- As of: 2026-09-01
- Actions: CREATE_COMPANY
- Proposal SHA-256: cfe419caf0395c5997a3407b5f9dcad33391e3b4c102984d459ca59a3a8f06de
- Production snapshot SHA-256: 37fdc4ad588fbbcb6fe8ab7abac1f9f705997cdf8d4d1e9a60e939c18d6c23ef
- Current company snapshot SHA-256: New company
- After-image SHA-256: 979308bb66b37ec06afc8f440320d3ea353f8e586082c6c4096bf1f272209d52

## Recommendation

Create one canonical parent-company record for 407 International Inc. and retain 407 ETR as an operating-name alias. The current common-share cap table is Ferrovial/Cintra 48.29%, CPP Investments plus undisclosed institutional co-investors 44.20%, and PSP Investments 7.51%. PSP's purchase closed on June 6, 2025, AtkinsRéalis fully exited by June 11, 2025, and no later equity transfer or signed pending transaction was found through September 1, 2026.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| AtkinsRéalis | — | AtkinsRéalis Highway Holdings Inc. and predecessors | 16.77% by 2004-2019; 6.76% thereafter; fully sold | 1999 | 2025 | REALIZED |
| CPP Investments | — | Ramp Canada Roads LP; 7577702 Canada Inc.; MICI Inc. | 44.20% block with non-controlling institutional co-investors; look-through split not publicly disclosed | 2010 | — | CLOSED_ACTIVE |
| Ferrovial N.V. | — | Cintra 4352238 Investments Inc.; 1568417 B.C. Ltd. | 48.29% | 1999 | — | CLOSED_ACTIVE |
| La Caisse de dépôt (CDPQ) | — | Capital d'Amérique CDPQ Inc. | 16.13% fully diluted convertible position | 1999 | 2002 | REALIZED |
| Macquarie Group | — | Macquarie Infrastructure (Toll Route) S.A.; MICI Inc.; later Intoll Group | 16.13% fully diluted from 2002; 30% from 2004 | 2002 | 2010 | REALIZED |
| PSP Investments | — | Spectre Infra Limited Partnership | 7.51% | 2025 | — | CLOSED_ACTIVE |

## Source holdings

- 081-psp-investments:holding:001:407-international-inc

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

- [Current parent identity and common-share cap table](https://assets.ctfassets.net/oqdgumaqmw49/7onoKvOA39oX8idjWUjTCJ/dc9cace9a54d11c6b2d7af148c189887/AIF_-_YE2025.pdf) — 407 International Inc. is the canonical parent, Ferrovial/Cintra, the CPP-led block, and PSP hold 48.29%, 44.20%, and 7.51%
- [Ferrovial final tranche and AtkinsRéalis exit](https://newsroom.ferrovial.com/en/press-releases/ferrovial-acquires-a-5-06-stake-in-the-407-etr/) — AtkinsRéalis fully exited, Ferrovial completed the final tranche in June 2025
- [PSP acquisition closing](https://www.investpsp.com/en/news/psp-investments-and-cpp-investments-complete-407-etr-transactions/) — PSP completed its 7.51% acquisition on June 6, 2025

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
