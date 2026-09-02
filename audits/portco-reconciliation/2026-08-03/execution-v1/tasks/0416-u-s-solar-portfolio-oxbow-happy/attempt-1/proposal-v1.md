# PortCo proposal — U.S. Solar Portfolio (Oxbow + Happy)

- Task: 416 (ledger:0416:u-s-solar-portfolio-oxbow-happy:cdda9d96)
- As of: 2026-09-01
- Actions: CREATE_COMPANY
- Proposal SHA-256: 953c0294a4046b6f2bf0c9bcac4a631ed2501e525663851a0381e3ef7a70cdd5
- Production snapshot SHA-256: e2503b77f76e6c36325d6210fe1f727be166b97b7d6723ada4a5ee761d3defcb
- Current company snapshot SHA-256: New company
- After-image SHA-256: 09c78f897c6d627283a83d8e44d43377520f71a6bccc5dbdf9c79c7ab00de36b

## Recommendation

Create one canonical Crawfish Solar Holdings 2 portfolio for Oxbow and Happy. Record JERA Nex and Schroders Greencoat at 50% each from July 30, 2025, preserve JERA's preceding 100% period through the current ownership row, and retain Lightsource bp only as the former owner and continuing service provider.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| JERA Nex | — | JERA Nex Americas LLC through Crawfish Solar Holdings 2, LLC | 50%; 100% from August 2, 2024 until July 30, 2025 | 2024 | — | CLOSED_ACTIVE |
| Lightsource bp | — | Exact selling affiliate not publicly disclosed | Former 100% sponsor and common-equity owner | — | 2024 | REALIZED |
| Schroders Greencoat | — | SG US Aggregator LLC; exact managed fund or client pool not publicly disclosed | 50% | 2025 | — | CLOSED_ACTIVE |

## Source holdings

- 087-schroders-greencoat:holding:003:u-s-solar-portfolio-oxbow-happy

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

- [Regulatory ownership and transaction-date evidence.](https://disclosure2dl.edinet-fsa.go.jp/searchdocument/pdf/S100WI4Y.pdf) — JERA closed its 100% acquisition on August 2, 2024, JERA reduced its interest to 50% on July 30, 2025, Oxbow and Happy sit in one legal-entity chain
- [Former ownership and service-continuity evidence.](https://lightsourcebp.com/news/jera-nex-expands-presence-in-us-with-395mw-solar-farms-acquisition-from-lightsource-bp/) — Lightsource bp remains asset manager and O&M provider rather than owner, Lightsource bp sold the portfolio to JERA
- [Current ownership and operating evidence.](https://www.jera.co.jp/en/corporate/business/projects/happy-oxbow) — JERA Nex and Schroders Greencoat each own 50%, The combined portfolio has 395 MW of operating solar capacity
- [Schroders acquisition vehicle evidence.](https://www.mayerbrown.com/en/news/2025/07/mayer-brown-advises-jera-nex-on-sale-of-50-equity-interest-in-solar-project-portfolio-to-affiliate-of-schroders-greencoat) — SG US Aggregator acquired 50%, SG US Aggregator is a Schroders Greencoat affiliate

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
