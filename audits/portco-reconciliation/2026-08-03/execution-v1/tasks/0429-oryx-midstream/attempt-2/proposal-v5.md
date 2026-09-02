# PortCo proposal — Oryx Midstream

- Task: 429 (ledger:0429:oryx-midstream:eee190fa)
- As of: 2026-09-02
- Actions: CORRECT_COMPANY, ADD_OWNER, MERGE_COMPANIES
- Proposal SHA-256: 164cda50123514849d26c05605c76a2126f7fae6bdaf1e36c64cc6ec80cd3544
- Production snapshot SHA-256: feb6ba9d25b472fe87db998a2b726c5e8916607752540d995cb0a2b4d7cc3b7d
- Current company snapshot SHA-256: 04075b289e9dad791953adf1a63feb463057eda793334ad1cf4e8a43aea3eb1a
- After-image SHA-256: cb65250404d6396d94c813e02a9e3eb4d06aa36b64cf229dc1b99bb013d8fc79

## Recommendation

Keep Oryx Midstream as the single canonical platform and redirect the duplicate Oryx Midstream Services record. Current affirmative company and SEC evidence establishes Stonepeak and Qatar Investment Authority as continuing owner groups above OMSPB at undisclosed stakes. The operating asset boundary is OMSPB's 35% interest in the Plains-operated POPB joint venture; Plains' 65% operator interest remains beneath the Oryx PortCo boundary rather than becoming another Oryx owner.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| QIA | — | — | Current direct or indirect owner group above OMSPB; exact percentage and tier not publicly disclosed | 2019 | — | CLOSED_ACTIVE |
| Stonepeak | — | Middle Cadence Holdings LLC / Oryx Midstream Services Permian Basin LLC; current fund allocation not publicly disclosed | Current owner group above OMSPB; exact percentage not publicly disclosed | 2019 | — | CLOSED_ACTIVE |

## Source holdings

- 090-stonepeak:holding:011:oryx-midstream

## Retired company records

- cmrxpjmio0184ivheuuox3f9o

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| MILESTONE | cmrxpmki50512ivheuz7rfkop | cmrxpmq66057zivhe7tero8yx | Both milestones record Stonepeak's 2019 acquisition of the same Oryx platform; the canonical event is updated to the May 22 funding date. |
| MILESTONE | cmrxpmkip0513ivheig04lpbk | cmrxpmq5r057yivhe9gihln2p | Both milestones record QIA's August 2019 entry into the same Oryx platform. |
| MILESTONE | cmrxpmkja0514ivhe4s7cmsgk | cmrxpmq740581ivhe5vddw804 | Both milestones record the October 2021 closing of the Plains/Oryx POPB joint venture. |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [Current Stonepeak attribution and POPB governance evidence.](https://stonepeak.com/investments) — Stonepeak continues to list Oryx as an investment, Stonepeak describes Oryx's continuing governance role in POPB
- [Primary current owner-group evidence.](https://www.oryxmidstream.com/who-we-are/our-partners) — Oryx's live partner page identifies Stonepeak and QIA as its current backers, The current decision is based on affirmative company evidence rather than absence of an exit
- [Current QIA-affiliate evidence.](https://www.sec.gov/Archives/edgar/data/1274173/000110465926036161/tm269831d4_defa14a.htm) — A March 2026 SEC filing calls Oryx Midstream Services LLC an affiliate of Qatar Investment Authority in connection with a January 2025 refinancing
- [POPB legal closing and asset-boundary evidence.](https://www.sec.gov/Archives/edgar/data/1581990/000110465921123181/tm2129267d1_8k.htm) — POPB is owned 65% by Plains and 35% through the Oryx member, The 2021 transaction placed all legacy Oryx Permian assets into POPB
- [Current underlying-joint-venture evidence.](https://www.sec.gov/Archives/edgar/data/1581990/000158199026000017/pagp-20260331.htm) — Plains reported the continuing 35% POPB noncontrolling interest at March 31, 2026

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
