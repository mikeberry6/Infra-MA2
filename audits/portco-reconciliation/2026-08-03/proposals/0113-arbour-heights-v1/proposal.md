# PortCo proposal — Arbour Heights

- Task: 113 (ledger:0113:arbour-heights:24819145)
- As of: 2026-08-18
- Actions: CORRECT_COMPANY, ADD_OWNER, MERGE_COMPANIES
- Proposal SHA-256: 4b43d7de87d12fc1b0cc0d966caca76a39e83e544486788aae83fb1080e58576
- Production snapshot SHA-256: 46007e5e216ee4876ff835593ba819c08883aa1558c18c82f0a42a842db60868
- Current company snapshot SHA-256: c7704f083207c1fa53bbce4d420eef21fe66a689b38dc5d0a4fdf3764c4a5e31
- After-image SHA-256: 354bfc38b940a30d62f2c2fb566a1fbfbb1536ea36bdcd78a05cde79cedd81f3

## Recommendation

Arbour Heights is a 174-bed underlying facility, not a standalone manager-level portfolio company. Ontario's current licensee record places it under Axium Extendicare LTC II LP, the successor to AXR Operating (National) LP and the Ontario-Manitoba portion of the Revera-Axium platform. Current Extendicare filings disclose 26 operating homes and 3,502 beds, with Axium at 85% and Extendicare at a 15% managed interest. Revera's western interest moved to a separate AgeCare-Axium platform in 2022 and Revera sold its remaining 15% Ontario-Manitoba interest to Extendicare on August 1, 2023. No later sale, restructuring, insolvency or signed pending ownership transfer was found through August 18, 2026. The proposal keeps the existing platform record as canonical, redirects the Arbour facility record, removes the unsupported AxInfra Fund I-IV heuristic, preserves historical ownership and makes no Deal Database change.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Axium Infrastructure | — | Axium LTC Limited Partnership | 85% current (75% at formation) | 2017 | — | CLOSED_ACTIVE |
| Extendicare Inc. | — | Axium Extendicare LTC II LP | 15% managed interest | 2023 | — | CLOSED_ACTIVE |
| Revera Inc. | — | AXR Operating (National) LP | 25% at formation; 15% immediately before exit | 2017 | 2023 | REALIZED |

## Source holdings

- None

## Retired company records

- cmrxpj7n300l3ivheede9bqxw

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| MILESTONE | cmrxpkquh02ufivhes8nido9k | cmrxpkt7002x5ivhe68yi8fh7 | Both rows describe completion of the original Revera-Axium platform; the canonical milestone records the exact April 27, 2018 second close. |
| MILESTONE | cmrxpkquw02ugivhe6bcvh8xc | cmrxpkt8602x7ivheeughxt6o | Both rows describe Arbour Heights as the platform's first external acquisition; retain one exact July 3, 2019 close milestone. |
| MILESTONE | cmrxpkqvh02uhivheg62cnyw2 | cmrxpkt8602x7ivheeughxt6o | Both rows record the same July 3, 2019 Arbour Heights acquisition; retain the canonical platform milestone. |
| OWNERSHIP_PERIOD | cmrxpjspf01i4ivhep91o028z | cmrxpjt8o01j2ivhey92f3vsx | Both rows represent Axium's ownership of the same long-term-care platform; the canonical period preserves the platform identity and is corrected to the direct 2017 entry, current 85% stake and disclosed Axium LTC vehicle. |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [Current ownership structure and platform scale](https://extendicare-1c124.kxcdn.com/app/uploads/2026/08/EXE-Q2-2026-Interim-MDA-vSedar2.pdf?x89279=) — Extendicare holds a 15% managed interest in Axium Extendicare LTC II LP with Axium LTC Limited Partnership, the platform owned 26 operating properties with 3,502 beds at June 30, 2026
- [Arbour Heights platform boundary and acquisition close](https://www.axiuminfra.com/2019/07/03/july-3-2019-joint-venture-of-revera-inc-and-axium-infrastructure-expands-with-acquisition-of-arbour-heights-long-term-care-home-in-kingston-ontario/?lang=en) — Arbour Heights is one facility beneath the broader multi-home platform, the existing joint venture closed its acquisition of Arbour Heights on July 3, 2019
- [2023 successor transaction, current legal name and stakes](https://www.extendicare.com/app/uploads/2025/06/997.pdf) — AXR Operating (National) LP became Axium Extendicare LTC II LP, Axium owns the remaining 85% and Extendicare operates the homes, Extendicare acquired Revera's 15% interest on August 1, 2023
- [Current facility operator and service profile](https://www.extendicare.com/location/arbourheightsltc/) — Extendicare currently operates and brands the Arbour Heights home, the facility provides regulated long-term care in Kingston, Ontario
- [Original formation, close dates and ownership split](https://www.goodmans.ca/expertise/case/revera-and-axium-infrastructure-form-a-joint-venture-to-acquire-and-share-ownership-of-32-long-term-care-homes) — Axium held 75% and Revera 25% at formation, the April 27, 2018 second close completed the 32-home portfolio, the platform formed and first closed on December 21, 2017
- [Western portfolio separation and Revera exit search](https://www.goodmans.ca/expertise/case/revera-inc.-sells-interest-in-certain-long-term-care-homes-to-agecare) — Revera sold its 15% interest in certain Alberta and British Columbia homes to AgeCare in 2022, the western assets continued in a separate AgeCare-Axium joint venture
- [Current facility-to-platform identity and operating scale](https://www.ontario.ca/locations/longtermcare/homes/2982-arbour-heights/) — Arbour Heights is a 174-bed licensed home, the current licensee is Axium Extendicare LTC II LP through its Extendicare and Axium general partners

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
