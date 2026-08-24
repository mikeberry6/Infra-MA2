# PortCo proposal — Arco Norte

- Task: 190 (ledger:0190:arco-norte:b9067e32)
- As of: 2026-08-23
- Actions: CORRECT_COMPANY, MERGE_COMPANIES
- Proposal SHA-256: 9c4b4e572d56995ea6ae3c3b8fe4de9f87072afde7e59ac3f3de947e777e586a
- Production snapshot SHA-256: ece00ce08fabaa6de568ace106e41dd0c3b74dcb23d362ac6c736c8703dd5a30
- Current company snapshot SHA-256: d5a3ff5098e42fa6a78a918132d098a0b196d4ab839bbb57bc9fdd31f0c01713
- After-image SHA-256: 27f6f740aff49ea4bddfd7d744a68f615510571aab58da8c5471101178f1d150

## Recommendation

Merge Arco Norte and Autopista Arco Norte, S.A. de C.V. because they are the same federal concessionaire. Keep the earlier canonical database ID, use the legal concessionaire name with Arco Norte as an alias, preserve both manager ownership periods, and correct the disclosed stakes as percentages of Promotora Punta Cometa rather than unsupported direct look-through percentages. IDEAL Group and Pacifico Sur remain separate investments.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| CPP Investments | — | Promotora Punta Cometa, S.A. de C.V. | 29% of Promotora Punta Cometa at the December 2016 close; current Arco Norte look-through not publicly disclosed | 2016 | — | CLOSED_ACTIVE |
| OTPP | — | Promotora Punta Cometa, S.A. de C.V. | 20% of Promotora Punta Cometa at the December 2016 close; current Arco Norte look-through not publicly disclosed | 2016 | — | CLOSED_ACTIVE |

## Source holdings

- 032-cpp-investments:holding:004:arco-norte

## Retired company records

- cmrxpjmbm017uivheptthqtyf

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| MILESTONE | cmrxpmjp80503ivhe8vg9nl93 | cmrxpmjjd04zyivhe5nhvugy9 | Both rows preserve the July 2009 first-phase operating milestone. |
| MILESTONE | cmrxpmjps0504ivhec97dzwvq | cmrxpmjjx04zzivhe4d9qnalk | Both rows preserve the 2011 second-phase operating milestone. |
| MILESTONE | cmrxpmjqa0505ivheyufxjtoe | cmrxpmjkj0500ivhet6iurpbd | Both rows describe the 2016 IDEAL, CPP Investments and Ontario Teachers' partnership for Arco Norte. |
| OWNERSHIP_PERIOD | cmrxpk8rp027bivhe191ench8 | cmrxpk8oj0279ivhe0fc6b7ay | Both rows represent Ontario Teachers' ownership through Promotora Punta Cometa in the same Arco Norte concessionaire. |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [Legal identity and operating concession](https://micrs.sct.gob.mx/index.php/infraestructura/direccion-general-de-desarrollo-carretero/titulos-de-concesion) — Autopista Arco Norte is the legal concessionaire, The concession remains listed through its 2065 expiry
- [Transaction close and ownership vehicle](https://www.otpp.com/en-ca/about-us/news-and-insights/2016/ontario-teachers-and-cppib-complete-investment-in-ideal-subsidiary-promotora-punta-cometa/) — CPP held 29% and Ontario Teachers' held 20% of Promotora Punta Cometa, The transaction closed on December 22, 2016
- [Current ownership and platform boundary](https://www.otpp.com/en-ca/investments/our-advantage/our-performance-and-track-record/major-investments/) — Arco Norte and IDEAL are separately listed investments, Ontario Teachers' continues to list Arco Norte

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
