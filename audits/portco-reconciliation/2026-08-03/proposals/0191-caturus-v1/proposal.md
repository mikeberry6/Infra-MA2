# PortCo proposal — Caturus

- Task: 191 (ledger:0191:caturus:fb78fef3)
- As of: 2026-08-23
- Actions: CORRECT_COMPANY, ADD_OWNER, MERGE_COMPANIES
- Proposal SHA-256: 8365a7e2f2efeae5f6d791dc8145c9a6caf6fb7e7fcf524dc0c33ca02db9279a
- Production snapshot SHA-256: 6b41dcff3efcd0f074d384aae6affa3f18802faa5c8365bb08acf8820534f489
- Current company snapshot SHA-256: d2cacd1673db1afed1b80de1092d7ac98e8d2551500bbc2ab811c4239814dd17
- After-image SHA-256: 5784916e20fd20d83a1077bf4cfc7219295cca7eaa8e197d559b9b085bae227d

## Recommendation

Keep one Caturus parent-platform record and merge the duplicate Caturus Energy row because Caturus Energy is a wholly owned upstream subsidiary, while Commonwealth LNG is another controlled subsidiary/project. Preserve the CPP ownership and milestone relations from the duplicate row, update the direct parent cap table to Kimmeridge 52.6%, Mubadala 24.1% and CPP Investments 22.8%, and disclose the remaining 0.5% management interest in narrative because no separate production organization row exists for that employee vehicle. Do not treat project financiers as parent owners.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| CPP Investments | — | Kimmeridge SoTex Aggregator, LLC / Kimmeridge-managed funds | 22.8% direct governance; additional 10.3% economic look-through through Kimmeridge-managed funds | 2025 | — | CLOSED_ACTIVE |
| Kimmeridge | — | Kimmeridge-managed funds; exact allocation not publicly disclosed | 52.6% direct governance after the May 2026 closing | 2023 | — | CLOSED_ACTIVE |
| Mubadala | — | — | 24.1% direct governance | 2025 | — | CLOSED_ACTIVE |

## Source holdings

- 032-cpp-investments:holding:005:caturus
- 063-kimmeridge-energy:holding:001:caturus
- 070-mubadala:holding:002:caturus

## Retired company records

- cmrxpjch400smivhexwb0tx7x

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| — | — | — | None |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [Platform scope and current operations](https://caturus.com/caturus-announces-final-investment-decision-for-9-5-mtpa-commonwealth-lng-export-facility-in-cameron-la/) — Caturus controls both the upstream business and Commonwealth LNG, Commonwealth LNG reached FID and financing close
- [Corrected direct cap table](https://www.energy.gov/documents/commonwealth-follow-questions) — Kimmeridge holds 52.6% direct governance, Management holds 0.5% and the remaining direct holders are Mubadala and CPP
- [Current ownership and legal chain](https://www.energy.gov/documents/commonwealth-lng-doe-notice-change-control-cpppdf) — CPP's direct 22.8% interest closed on May 14, 2026, The filing identifies the Caturus parent and subsidiary chain

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
