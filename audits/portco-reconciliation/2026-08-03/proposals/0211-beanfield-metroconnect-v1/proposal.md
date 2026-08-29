# PortCo proposal — Beanfield Metroconnect

- Task: 211 (ledger:0211:beanfield-metroconnect:1a05dc89)
- As of: 2026-08-29
- Actions: CORRECT_COMPANY, MERGE_COMPANIES
- Proposal SHA-256: 12762bf4a650106408ae2ae42606cbc3a1dd142af746ba0c19208d1b5fff4465
- Production snapshot SHA-256: 36999efb557c421a1fc771f9df165b9ffa3915c55fdc7b03975349bb70a9029c
- Current company snapshot SHA-256: 37ee866e65bfce67612a0d288014b652d044549fee7938f9d69277f515dc9ae6
- After-image SHA-256: 6f1d81d0e9bffbfda7ea98ee826b6d0b9bc566686e24a9df2b37b2420c1826d3

## Recommendation

Consolidate the duplicate Beanfield Technologies Inc. production and seed record into the canonical Beanfield Metroconnect record because regulator and company sources establish that these are legal and trading names of one Canadian fibre platform. Preserve DigitalBridge as majority owner following its 2019 acquisition, move the existing OMERS ownership period to the canonical company as an active minority investment from the September 15, 2023 close, and exclude InfraBridge because no direct Beanfield equity interest was identified. OpenFace and the Aptum metro network remain subordinate acquired operations and assets. No Beanfield-specific sale, ownership transfer or signed pending exit was identified through August 19, 2026.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| DigitalBridge | — | Digital Colony Partners | Majority interest after the 2023 OMERS investment; exact percentage not publicly disclosed | 2019 | — | CLOSED_ACTIVE |
| OMERS Infrastructure | — | — | Minority interest; exact percentage not publicly disclosed | 2023 | — | CLOSED_ACTIVE |

## Source holdings

- 036-digitalbridge:holding:002:beanfield-metroconnect

## Retired company records

- cmrxpjm7v017nivhet0bl1s0p

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| MILESTONE | cmrxpmj2604zdivhey2qcp0h1 | cmrxplg3x03owivheaeh1j5zd | Both rows contain Beanfield's 1988 founding history. |
| MILESTONE | cmrxpmj2s04zeivhex5dt9um8 | cmrxplg4h03oxivheseuufho6 | Both rows contain Digital Colony's November 2019 acquisition of Beanfield Technologies. |
| MILESTONE | cmrxpmj3u04zgivhekj3v0n8v | cmrxplg5n03ozivheoldyna5r | Both rows describe the announced 2023 DigitalBridge and OMERS ownership partnership. |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [DigitalBridge ownership entry](https://blog.beanfield.com/digital-colony-acquires-beanfield-technologies-inc/) — Digital Colony Partners acquired Beanfield Technologies on November 12, 2019
- [Canonical legal and trading identity](https://crtc.gc.ca/eng/archive/2025/2025-154.htm) — Beanfield Technologies Inc. operates as Beanfield Metroconnect, The two repository records represent one company rather than separate platforms
- [Current DigitalBridge ownership and exit check](https://www.digitalbridge.com/portfolio/beanfield-metroconnect) — DigitalBridge continues to list Beanfield as a current portfolio company
- [OMERS ownership closing](https://www.mccarthy.ca/en/experience/omers-infrastructure-management-inc-completes-investment-in-beanfield-technologies-inc) — OMERS completed its Beanfield investment on September 15, 2023
- [Current co-ownership structure](https://www.omers.com/news/omers-infrastructure-announces-strategic-investment-in-beanfield-metroconnect) — DigitalBridge would remain the majority owner, OMERS Infrastructure agreed to a minority investment
- [Current OMERS ownership and exit check](https://www.omersinfrastructure.com/investments) — OMERS Infrastructure continues to list Beanfield as a current investment

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
