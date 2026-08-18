# PortCo proposal — Edwards Sanborn 1A

- Task: 115 (ledger:0115:edwards-sanborn-1a:6fff6c99)
- As of: 2026-08-18
- Actions: CORRECT_COMPANY, MERGE_COMPANIES
- Proposal SHA-256: dc05a16402bdc36427148bf62dfff86c4b70952dd6fd302710dbbc73a58d7d19
- Production snapshot SHA-256: 59d3b2e87030568ee581d5c76f337ad81c30e6b5104265c7d47b43112e819f93
- Current company snapshot SHA-256: 498e2da42bfd2a2ebc9b4f913d415c9c500a9d08809ba953e3983e4cb5e102c3
- After-image SHA-256: 6788df6404b917c3c108175275b0c08223e85f93da089ea3c10f50a99091c9a5

## Recommendation

Consolidate the standalone Edwards Sanborn 1A record into the existing combined record and rename the survivor Edwards Sanborn Solar + Storage. Axium's live portfolio presents EdSan1A and EdSan1B together under Axium ES Holdings LLC. FERC records establish that Axium completed the Phase 1A transaction on October 20, 2022 and acquired 80%, while Terra-Gen retained 20%. A January 2024 FERC filing establishes that Axium ES Holdings completed the Phase 1B transaction on December 22, 2023 and acquired 50% of the voting interests, while Terra-Gen retained 50%. The same filing identifies Axium ES Holdings beneath Axium Co-Invest Holdings and AxInfra US LP and states that AxInfra owns 92.26% of the co-invest holding company. These phase-level facts do not support one synthetic percentage for the combined PortCo. No direct source identifies AxInfra Fund I-IV as the owning fund, so both generic fund links are removed and the disclosed Axium ES Holdings LLC / AxInfra US LP vehicle chain is retained. Current Axium and Terra-Gen pages continue to show the combined operating project, and no later Axium sale, signed pending exit or ownership transfer was identified through August 18, 2026. Task 116 covers the same canonical holding and may be superseded only after this exact merge is released, applied and production-verified.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Axium Infrastructure | — | Axium ES Holdings LLC / AxInfra US LP | Phase 1A: 80% (Terra-Gen 20%); Phase 1B: Axium ES Holdings LLC 50% / Terra-Gen 50%, with AxInfra US LP owning 92.26% of the upstream co-invest holding company | 2022 | — | CLOSED_ACTIVE |

## Source holdings

- None

## Retired company records

- cmrxpj7v900liivhelzpabyae

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| MILESTONE | cmrxpkrwj02vlivhe7km1lrwh | cmrxpkryn02voivheznai3lvy | Both 2022 acquisition milestones describe Axium's Phase 1A entry. Preserve the canonical milestone and correct it to the exact October 20, 2022 legal close established by FERC. |
| OWNERSHIP_PERIOD | cmrxpjszp01ikivhe4x8l4n76 | cmrxpjt0801ilivhe3or1eica | Both periods describe the same active Axium manager-level investment. Preserve the immutable combined-record period while replacing its unsupported generic fund link and adding the verified phase-specific ownership disclosure. |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [Exact Phase 1A and Phase 1B closing dates, voting stakes and Axium vehicle chain](https://elibrary.ferc.gov/eLibrary/filelist?accession_number=20240130-5233) — Axium ES Holdings is held beneath Axium Co-Invest Holdings and AxInfra US LP, and AxInfra owns 92.26% of Axium Co-Invest Holdings, Phase 1A closed on October 20, 2022 and Axium acquired 80%, Phase 1B closed on December 22, 2023 and Axium ES Holdings acquired 50% while Terra-Gen retained 50%
- [Company-side Phase 1A ownership confirmation](https://terra-gen.com/axium-infrastructure-invests-in-phase-1-of-edwards-sanborn-solar-storage-facility/) — Axium acquired 80% and Terra-Gen retained 20%, the Phase 1A transaction completed
- [Company-side Phase 1B transaction and boundary confirmation](https://terra-gen.com/axium-infrastructure-invests-in-phase-1b-of-the-edwards-sanborn-solar-storage-facility/) — the Phase 1B acquisition involved an Axium-managed fund and limited-partner co-investor, the acquired Phase 1B interest was 50%, the release describes Phases 1A and 1B as one combined Edwards Sanborn investment
- [Combined project boundary, operating footprint and current scale](https://terra-gen.com/edwards-sanborn/) — Terra-Gen presents Phase 1A and Phase 1B together, the project is operating and interconnected to CAISO, the project spans approximately 4,600 acres in Kern County
- [Current manager-level identity, operating status and phase scale](https://www.axiuminfra.com/portfolio-assets/?lang=en) — Axium currently presents one Axium ES Holdings LLC card covering EdSan1A and EdSan1B, both phases are operating, the current portfolio reports phase-specific operating scale
- [Phase 1A ownership and transaction-era scale](https://www.axiuminfra.com/wp-content/uploads/2022/10/Axium_News-Release_Edwards-Sanborn-1A.pdf) — Axium announced completion of an 80% Phase 1A acquisition, Terra-Gen retained 20%, the release reports 397 MWac of solar and 1,505 MWh of storage
- [Phase 1B co-invest structure, combined boundary and transaction-era scale](https://www.axiuminfra.com/wp-content/uploads/2024/01/Axium_News-Release_EdSan-1B.pdf) — an Axium-managed fund and an undisclosed limited-partner co-investor jointly acquired 50% of Phase 1B, the assets serve utilities, municipal utilities and corporate counterparties under long-term contracts, the combined phases total 807 MWac of solar and 3,002 MWh of storage

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
