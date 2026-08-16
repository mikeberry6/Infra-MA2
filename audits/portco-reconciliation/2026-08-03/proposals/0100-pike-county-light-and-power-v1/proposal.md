# PortCo proposal — Pike County Light & Power

- Task: 100 (ledger:0100:pike-county-light-and-power:66f65814)
- As of: 2026-08-16
- Actions: CORRECT_COMPANY, MERGE_COMPANIES
- Proposal SHA-256: fec4121fa72802210d31cf4a06f6a0ff80b12767a5b7d67070370f3bf91f13d9
- Production snapshot SHA-256: a8916ff4a91c71f276a62bb31b094773ae72884042937d2f34decfd20098f6ba
- Current company snapshot SHA-256: 5bb49656a8f729dd0c7d4e6af0083949f7703607b7f17b46fa64008ad632ee93
- After-image SHA-256: 43bb44cabcf38bebbf771b70c239d2ef23abc9605d1b7681e9906f91526f1c85

## Recommendation

Remove Pike County Light & Power as a standalone manager-level PortCo and consolidate it with the existing Corning parent record. Pike's current official site identifies it as a Corning Energy Corporation subsidiary and says Argo acquired the Corning parent on July 6, 2022. The Pennsylvania PUC's 2025 indirect-control proceeding shows Pike and Leatherstocking below Corning Energy, ACP Crotona and Argo-managed entities; it does not show a separate Pike-level Argo investment. Use Corning Energy Corporation as the current canonical parent name, preserve Corning Natural Gas Holding Corporation and Pike identities as aliases and subsidiary history, and retire the existing duplicate Corning production identity into the immutable queue target. The proposed Apollo indirect-control transaction did not close and was terminated in January 2026, so Argo remains current and no pending ownership transaction is recorded.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Argo Infrastructure Partners | — | ACP Crotona Holdings, L.P. / ACP Crotona Corp. | 100% | 2022 | — | CLOSED_ACTIVE |

## Source holdings

- None

## Retired company records

- cmrxpj5nf00i2ivhew54p3fxp

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| MILESTONE | cmrxpkioh02kqivhewy6tf0td | cmrxpkjue02m5ivhet3lfscal | Both milestones describe Corning's August 2016 acquisition of Pike County Light & Power from Orange & Rockland. |
| MILESTONE | cmrxpkip002krivhe2gkhwu30 | cmrxpkjuv02m6ivhe47h3zlkh | Both milestones describe Argo and ACP Crotona's July 2022 acquisition of 100% of the Corning parent platform. |
| MILESTONE | cmrxpkiph02ksivheubxrut4v | cmrxpkjuv02m6ivhe47h3zlkh | This duplicate milestone describes the same July 2022 Argo acquisition already preserved in the canonical history. |
| OWNERSHIP_PERIOD | cmrxpjqo901euivhedi6h79di | cmrxpjqzx01fcivhewff15s5x | Both periods represent Argo's July 2022 acquisition and continuing ownership of the same Corning parent platform and its Pike subsidiary. |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [Apollo-Argo transaction termination and current-owner confirmation](https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7BF082C39B-0000-C423-9296-BE68E22B02CF%7D) — the proposed transaction did not close by January 10, 2026, the termination created no ownership change for Corning or Pike, the transaction agreement and proposed transaction were terminated
- [Subsidiary identity, current parent, operating boundary and scale](https://pclpeg.com/about-us) — Argo acquired the Corning parent on July 6, 2022, Corning acquired Pike on August 31, 2016, Pike County Light & Power is a Corning Energy Corporation subsidiary
- [Corning platform history and subsidiary acquisitions](https://www.corninggas.com/company-history) — Corning Natural Gas began operations in 1904, the Corning platform acquired Pike in August 2016, the holding company was formed in 2013
- [Argo acquisition closing and manager-level platform boundary](https://www.globenewswire.com/news-release/2022/07/06/2475377/0/en/corning-natural-gas-holding-corporation-acquired-by-argo-infrastructure-partners-lp.html) — Argo completed the Corning parent acquisition on July 6, 2022, the manager-level investment is Corning rather than each regulated subsidiary, the transaction acquired 100% of Corning's common and preferred stock
- [Direct ownership chain and 2025 indirect-control proceeding](https://www.puc.pa.gov/pcdocs/1903783.pdf) — Argo-managed entities and ACP Crotona sit above the Corning parent platform, Pike and Leatherstocking are operating utilities below Corning Energy Corporation, the Apollo application proposed an indirect change of control of Corning and its utilities

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
