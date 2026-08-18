# PortCo proposal — Virginia International Gateway

- Task: 109 (ledger:0109:virginia-international-gateway:39eeee70)
- As of: 2026-08-18
- Actions: CREATE_COMPANY
- Proposal SHA-256: 1781350d4039d09cdf5819dbbf86192de885e173e7e26da398567645ad81915c
- Production snapshot SHA-256: 382e1070f50511789fa60fdea85038d3e052434941568309cb47505c7b42bd1f
- Current company snapshot SHA-256: New company
- After-image SHA-256: 0e096a356b9e65fd478fb1eb2f7f52c81300ed6c92a5507d728fc682cc76c66f

## Recommendation

Create one canonical Virginia International Gateway company. Astatine's current site lists VIG as Active and separately identifies a Fund II VIG investment as exited in 2019. The August 2025 Virginia Port Authority final official statement identifies USS and PSP as the current underlying owners, so the canonical record should preserve an active Astatine manager attribution, an active PSP direct-owner association and the realized 2014-2019 Astatine Fund II period. Exact active fund, vehicle, stakes and PSP entry date are not publicly disclosed. No later full sale or signed pending exit was identified through August 18, 2026. Count APM Terminals Virginia as the predecessor name and treat VPA, VIT, the lease, bonds, cranes and expansion projects as related parties or assets rather than separate PortCos.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Astatine Investment Partners | — | — | Active Astatine-managed interest; exact manager-level percentage not publicly disclosed | — | — | CLOSED_ACTIVE |
| Astatine Investment Partners | — | Alinda Infrastructure Fund II | — | 2014 | 2019 | REALIZED |
| PSP Investments | — | — | Joint underlying owner with USS; exact percentage not publicly disclosed | — | — | CLOSED_ACTIVE |

## Source holdings

- 016-astatine-investment-partners:holding:009:virginia-international-gateway

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

- [Manager identity continuity](https://astatineip.com/2022/04/13/alinda-capital-partners-rebrands-its-mid-market-infrastructure-strategy-to-astatine-investment-partners/) — Alinda Capital Partners renamed its mid-market infrastructure strategy Astatine Investment Partners in 2022, Alinda and Astatine are one manager lineage rather than separate owners
- [Realized Fund II period and duplicate-period resolution](https://astatineip.com/investment/virginia-international-gateway-2/) — Astatine identifies a Fund II investment in the same VIG company as exited in 2019, The exited Fund II page and active page represent separate ownership periods rather than duplicate companies
- [Current Astatine manager attribution, active status, infrastructure classification and operating scale](https://astatineip.com/investment/virginia-international-gateway/) — Astatine labels Virginia International Gateway Active and classifies it as Transportation & Logistics Infrastructure, The terminal has approximately 2 million TEU annual throughput capacity and is operated under a long-term public-authority lease
- [Manager-level ownership methodology and active/exited profile coexistence](https://astatineip.com/investments/) — Astatine lists both the active and exited VIG profiles, The index states that listed businesses are currently or formerly owned by Astatine-managed funds
- [Canonical legal identity, current underlying owners, 2014 acquisition history, terminal boundary and lease status](https://finpressllc.com/doc/16391/Virginia%20Port%20Authority%20Final%20Official%20Statement%20Series%202025.pdf?source=website) — Alinda-managed fund affiliates and USS acquired the predecessor terminal in August 2014, The 2025 lease amendment did not transfer terminal title to VPA, The current underlying owners are USS and PSP, Virginia International Gateway, Inc. is the private owner of the terminal and VPA is the lessee

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
