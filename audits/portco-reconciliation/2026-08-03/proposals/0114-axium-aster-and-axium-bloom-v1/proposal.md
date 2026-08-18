# PortCo proposal — Axium Aster & Axium Bloom

- Task: 114 (ledger:0114:axium-aster-and-axium-bloom:b9357b8d)
- As of: 2026-08-18
- Actions: CORRECT_COMPANY, ADD_OWNER
- Proposal SHA-256: 1ebf20ecb246b0083b8b1374b915c9b06ba7e78d2b3e0fe9c499af5fc3dd238a
- Production snapshot SHA-256: 75edbe5758fd9dcad8777ac522ef4f569191c7d7ad8bc80448db6db53590107d
- Current company snapshot SHA-256: d28046a003d316aa5060b4d7b221a9bfc7023e677fdab30ef7a1f98d9f31b602
- After-image SHA-256: 3914dd64528835a18801fa46c10095b2771db6a32b8a5a5a7f0ab986b404262f

## Recommendation

Axium's current portfolio page presents Axium Aster & Axium Bloom together as one active manager-level social-infrastructure investment comprising two legal portfolios, 26 facilities and 4,114 beds in Alberta and British Columbia. Axium owns 92.5% of each portfolio and AgeCare owns the 7.5% balance and operates the facilities. The existing AgeCare Facilities Portfolio record already contains the Aster and Bloom identity and the same primary manager source, so it is corrected in place rather than duplicated. Its Ontario 16-home / 2,418-bed scale belongs to separately presented Axium Iris and is removed for a later delta-sweep task. The proposal preserves separate Aster and Bloom vehicles and entry histories, removes the unsupported generic Axium Managed Funds / AxInfra Fund I-IV attribution, records AgeCare as current minority co-owner and Revera as the former western-portfolio co-owner, and finds no Axium exit or signed pending sale through August 18, 2026. Axium's 2022 ESG report identifies Aster with AIC II, but no matching production Fund row exists; this proposal therefore does not invent or create a fund relation and records the disclosure for later fund-data review.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| AgeCare | — | Aster Joint Venture Limited Partnership | 7.5% current (20% at 2020 entry) | 2020 | — | CLOSED_ACTIVE |
| AgeCare | — | Bloom Limited Partnership | 7.5% current; AgeCare acquired Revera's 15% interest in certain Alberta and British Columbia homes in 2022 | 2022 | — | CLOSED_ACTIVE |
| Axium Infrastructure | — | Bloom Limited Partnership | 92.5% current (75% at 2017 entry) | 2017 | — | CLOSED_ACTIVE |
| Axium Infrastructure | — | Aster Joint Venture Limited Partnership | 92.5% current (80% at 2020 entry) | 2020 | — | CLOSED_ACTIVE |
| Revera Inc. | — | Western Revera-Axium joint venture | 25% at 2017 entry; sold a 15% interest in certain Alberta and British Columbia homes in 2022 | 2017 | 2022 | REALIZED |

## Source holdings

- 019-axium-infrastructure:holding:043:axium-aster-and-axium-bloom

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

- [Current legal-vehicle corroboration](https://www.alrb.gov.ab.ca/umpireregistry.html) — the current registry includes Aster JVLP operating as Age Care and Bloom Limited Partnership
- [Aster formation, original scale and infrastructure strategy](https://www.axiuminfra.com/2020/01/08/agecare-and-axium-infrastructure-form-a-partnership-to-share-ownership-of-five-continuing-care-facilities-in-alberta/?lang=en) — Aster was announced January 8, 2020 as five Alberta facilities with 1,402 beds, the investment is direct social infrastructure and AgeCare operates the facilities
- [Current identity, manager-level boundary, ownership, geography, scale and operating status](https://www.axiuminfra.com/portfolio-assets/?lang=en) — Axium Iris is a separately presented Ontario portfolio, Axium intentionally presents Aster and Bloom together in one current portfolio card, Axium owns 92.5%, AgeCare owns the balance and operates the facilities, the card covers two portfolios, 26 facilities and 4,114 beds in Alberta and British Columbia
- [Aster original ownership split](https://www.axiuminfra.com/wp-content/uploads/2020/01/Website-Release_Project-Aster_Axium_en_Final.pdf) — Axium held 80% at formation and AgeCare held 20% and remained operator
- [Aster fund disclosure and continued operations](https://www.axiuminfra.com/wp-content/uploads/2023/08/Annual-ESG-Report-_Q4-2022_vSummary_FINAL.pdf) — Axium's 2022 ESG report identifies AgeCare / Axium Aster with AIC II and records continued portfolio operations
- [Bloom predecessor formation, first close and original ownership](https://www.goodmans.ca/expertise/case/revera-and-axium-infrastructure-form-a-joint-venture-to-acquire-and-share-ownership-of-32-long-term-care-homes) — Axium held 75% and Revera 25% at formation, the western predecessor tranche first closed December 21, 2017
- [Bloom co-owner transition and exit search](https://www.goodmans.ca/expertise/case/revera-inc.-sells-interest-in-certain-long-term-care-homes-to-agecare) — AgeCare would own the homes in joint venture with Axium, Revera sold its 15% interest in certain Alberta and British Columbia homes to AgeCare on August 22, 2022

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
