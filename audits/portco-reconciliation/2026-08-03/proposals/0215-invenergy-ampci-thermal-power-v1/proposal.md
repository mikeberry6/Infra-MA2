# PortCo proposal — Invenergy AMPCI Thermal Power

- Task: 215 (ledger:0215:invenergy-ampci-thermal-power:7aff1fc4)
- As of: 2026-08-29
- Actions: CORRECT_COMPANY, ADD_OWNER, ADD_PENDING_TRANSACTION
- Proposal SHA-256: 2c37f98d85d12f6c9faaf77ff58facd2b0dcaef99cd2e637d0e1c9591241a601
- Production snapshot SHA-256: 36fff253527e44aebbd6e568941daf49f0d4e7e688c87b59f2336c8aa44e9833
- Current company snapshot SHA-256: bd6780bbd92db1cb18edf24e071c3d0e0fd772c2abadd29edfe76fc8594e81ea
- After-image SHA-256: a6999b476907a9e17bba638dcb025022baa2f6caa0ed082c03f034a7eca9e501

## Recommendation

Correct the sole IATP record to show its 50/50 InfraBridge and Invenergy ownership. Keep InfraBridge active through legacy GIF II while its signed sale of that 50% interest to ArcLight remains pending, add Invenergy Clean Power as the continuing 50% owner and operator, and keep DigitalBridge only as the parent organization behind the InfraBridge record. No legal closing of the ArcLight acquisition was identified through August 19, 2026.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| DigitalBridge | AMP Capital Global Infrastructure Fund II (GIF II) | InfraBridge North America Thermal Power Acquisition, LLC | 50% | 2018 | — | SIGNED_PENDING_EXIT |
| Invenergy | — | Invenergy Clean Power LLC | 50% | 2018 | — | CLOSED_ACTIVE |

## Source holdings

- 036-digitalbridge:holding:009:invenergy-ampci-thermal-power
- 058-infrabridge:holding:004:invenergy-ampci-thermal-power

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

- [Original joint venture](https://invenergy.com/news/invenergy-strengthens-its-diversified-clean-energy-platform-through-new-equity-transactions-with-cdpq-and-amp-capital) — Invenergy and AMP formed the 50/50 partnership, Invenergy retained management responsibility
- [FERC filing](https://www.federalregister.gov/documents/2026/03/30/2026-06095/combined-notice-of-filings-1) — The ArcLight transaction required FERC approval under EC26-76
- [Antitrust review](https://www.ftc.gov/legal-library/browse/early-termination-notices/20261126) — Antitrust progress did not itself establish legal closing, Gray Wolf and the GIF II/IATP parties received HSR early termination
- [Signed pending sale](https://www.infrabridge.com/news/2026-03-12-arclight-to-acquire-infrabridge-50-stake-in-54-gw-power-portfolio) — InfraBridge agreed to sell its 50% interest to ArcLight, Invenergy remains a continuing owner and operator, The transaction was expected to close only after approvals
- [Current ownership and scale](https://www.infrabridge.com/our-portfolio) — InfraBridge reports an August 2018 entry and 11 assets totaling about 5.4 GW gross, The platform is a 50/50 joint venture

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
