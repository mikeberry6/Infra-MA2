# PortCo proposal — Hamakua Energy

- Task: 272 (ledger:0272:hamakua-energy:72375ecc)
- As of: 2026-08-30
- Actions: CORRECT_COMPANY, ADD_OWNER
- Proposal SHA-256: ba200d82ae551297f5d72263dea421ea3e3465bd67a84ac623753c3b45d91831
- Production snapshot SHA-256: 698ec52ea17601657e29c33526259d747aef75ce5ea2895273db5ae342103163
- Current company snapshot SHA-256: d669a00a4192cadb33a6f03ec0bced87fa4d5d92ce9c31960bf04ec7ba6bd366
- After-image SHA-256: 466d10c7860c236f8d60b171c26c5b9739d1a34560b92b4147069f106122049a

## Recommendation

Correct the existing Hamakua Energy Plant record to the canonical Hamakua Energy identity rather than creating a duplicate. Pacific Current sold all interests in Hamakua Holdings to an indirect wholly owned Harbert Management Corporation subsidiary on March 10, 2025. Harbert owns the current platform at the parent level, but the buyer subsidiary and fund are not publicly disclosed; the existing Gulf Pacific attribution is unsupported and is removed. Preserve the prior Enserch/Jones, TECO, Energy Investors Funds, ArcLight and Pacific Current ownership history. No later sale or signed pending ownership transaction was identified through August 19, 2026.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| ArcLight Capital Partners | — | ArcLight Energy Partners Fund IV, L.P. through Great Point Power Hamakua Holdings | 100% | 2010 | 2017 | REALIZED |
| Energy Investors Funds Group | — | United States Power Fund, L.P. through Hamakua Energy Partners | 50% from June 2004 and 100% from July 15, 2004 | 2004 | 2010 | REALIZED |
| Enserch Corporation / J.A. Jones | — | Encogen Hawaii, L.P. | Co-owned; percentages not publicly disclosed | — | 2004 | REALIZED |
| Harbert Management Corporation | — | Undisclosed HMC subsidiary through Hamakua Holdings, LLC | 100% of Hamakua Holdings ownership interests | 2025 | — | CLOSED_ACTIVE |
| Hawaiian Electric Industries / Pacific Current | — | Pacific Current, LLC through Hamakua Holdings, LLC | 100% | 2017 | 2025 | REALIZED |
| TECO Energy | — | Hamakua Energy Partners, L.P. | 50% at exit | 1999 | 2004 | REALIZED |

## Source holdings

- 050-harbert-management-corp:holding:002:hamakua-energy

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

- [ArcLight ownership transition](https://www.ftc.gov/legal-library/browse/early-termination-notices/20100281) — ArcLight Energy Partners Fund IV and Great Point Power were the 2010 acquiring chain
- [Current Harbert ownership and March 2025 closing](https://www.hei.com/investor-relations/news-and-events/news/news-details/2025/HEI-Subsidiary-Sells-Hawaii-Island-Power-Plant-to-Experienced-Plant-Operator/default.aspx) — An indirect wholly owned Harbert Management Corporation subsidiary acquired the platform, Pacific Current sold all interests in Hamakua Holdings, The sale closed on March 10, 2025
- [Parent and subsidiary identity and seller exit](https://www.sec.gov/Archives/edgar/data/354707/000035470726000008/he-20251231.htm) — Hamakua Holdings is the parent of the plant and related operating entities, Pacific Current no longer owned the business after the March 2025 sale

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
