# Canonical Company Merge Review

Generated read-only from the live database on 2026-07-22. The scan reviewed 1,174 company rows and found 21 proposed clusters covering 43 rows. No database writes were performed.

Each proposal remains **PENDING REVIEW**. A research owner must mark every row `APPROVE`, `REJECT`, or `REVISE` before `scripts/merge-duplicate-companies.ts --apply` may be used. Approved merges preserve retired IDs through `CompanyRedirect` and create a `CANONICAL_MERGE` audit event.

Counts are shown as `owners / milestones / management / sources`. Re-run `npm run db:duplicates:report` to regenerate the full live detail.

| # | Decision | Proposed survivor | Retired row(s) | Country conflict | Evidence counts (keep → retire) |
|---:|---|---|---|---|---|
| 1 | PENDING REVIEW | Alpha Generation, LLC (`cmnva0slh00nmm8lzew8x0vm3`) | Alpha Generation (AlphaGen) (`cmoqbxfm6004k171f6yqbqr3i`) | No | `2/5/0/19 → 1/4/0/6` |
| 2 | PENDING REVIEW | American Student Transportation Partners (ASTP) (`cmnva0yw700y8m8lz066tfhwl`) | American Student Transportation Partners (`cmoqbyrxz00ep171f0j0xkh9o`) | No | `1/4/0/18 → 1/4/0/8` |
| 3 | PENDING REVIEW | Boldyn Networks (US) (`cmnva0nf200fgm8lzckud2zgk`) | Boldyn Networks (`cmoqbx3az001x171fmlp3rf24`) | **Yes — verify U.S. vs U.S./Canada scope** | `2/5/0/19 → 1/5/0/10` |
| 4 | PENDING REVIEW | Cleco Corporation (`cmoqbxwj50084171fwym9a80l`) | Cleco Corporate Holdings LLC (`cmnva0ng800fim8lz95b1no81`) | No | `3/6/6/7 → 3/6/6/7` |
| 5 | PENDING REVIEW | Coastal GasLink Pipeline Project (`cmnva0psl00jcm8lzi01srw0p`) | Coastal GasLink Pipeline (`cmoqc06f300pj171fz77p460g`) | No | `2/5/0/22 → 1/5/0/8` |
| 6 | PENDING REVIEW | Convergent Energy and Power — United States (`cmoqbyx6l00fv171f32ezu2ch`) | Convergent Energy and Power — North America (`cmnva0o2700ghm8lzwp37rpx9`) | **Yes — verify geographic scope** | `2/3/0/12 → 1/0/0/6` |
| 7 | PENDING REVIEW | CoolCo (`cmnva12qt0152m8lzwh32rl0d`) | CoolCo (Cincinnati District Energy) (`cmoqbzq6100m1171fx36pzrsj`) | No | `1/4/0/16 → 1/3/0/8` |
| 8 | PENDING REVIEW | Direct ChassisLink, Inc. (`cmnva0qc300k8m8lz0ukvcrlw`) | Direct ChassisLink Inc. (DCLI) (`cmoqbzgu500k1171fs4ccuw39`) | No | `3/4/0/23 → 1/4/0/8` |
| 9 | PENDING REVIEW | ExteNet Systems (`cmnva0mwt00elm8lz2xp3ijr4`) | Extenet (`cmoqc0y7100vi171flkm8xuz4`) | No | `4/6/0/18 → 1/4/0/0` |
| 10 | PENDING REVIEW | GCT Global Container Terminals — Canada/U.S. (`cmoqc0put00tn171ffyt56gok`) | GCT Global Container Terminals — Canada (`cmnva13lf016gm8lz8ws9mnx2`); GCT Global Container Terminals Inc. (`cmoqbxwza0088171ffl39qhda`) | **Yes — verify entity and geographic scope** | `2/5/0/7 → 3/5/0/5 + 3/4/5/5` |
| 11 | PENDING REVIEW | Gulf Coast Express Pipeline (GCX) (`cmoqbxg4x004p171fzy5wwte4`) | Gulf Coast Express Pipeline LLC (`cmnva0rsh00m5m8lzrh4iikgq`) | No | `1/5/0/8 → 2/4/0/24` |
| 12 | PENDING REVIEW | JW Water Holdings (incl. Robson Utilities) (`cmnva0z1n00yim8lzbh3yfx1c`) | JW Water Holdings (`cmoqbytnp00f3171fjyn934yg`) | No | `1/4/0/12 → 1/4/0/6` |
| 13 | PENDING REVIEW | Landmark Dividend LLC (`cmoqbx33h001v171f207gs2e3`) | Landmark Dividend (`cmnva0zyr0105m8lz7mzz7ea2`) | No | `2/5/0/12 → 2/0/0/8` |
| 14 | PENDING REVIEW | Luminace (`cmoqby8li00ao171flqpuqq6j`) | Luminace Holdings, LLC (`cmnva0nyo00gbm8lz6vln8d8d`) | No | `2/5/0/12 → 2/0/0/9` |
| 15 | PENDING REVIEW | Northview Energy — U.S./Canada (`cmoqbxxhq008d171ffvxr3rv9`) | Northview Energy — United States (`cmnva0xvs00wgm8lzqdgowwv1`) | **Yes — verify geographic scope** | `3/4/0/6 → 2/0/0/5` |
| 16 | PENDING REVIEW | Pattern Energy Group LP (`cmnva0stf00nzm8lz2pthnja0`) | Pattern Energy Group (`cmoqbyqsa00ef171fswry13u5`) | **Yes — verify U.S. vs U.S./Canada scope** | `3/5/0/18 → 1/4/0/8` |
| 17 | PENDING REVIEW | Pearl/Ruby Solar Portfolio (`cmnva0tjn00p9m8lz7d3k3svi`) | Pearl / Ruby solar portfolio (`cmoqbxnxb006a171fwojc3elz`) | No | `1/2/0/12 → 1/1/0/6` |
| 18 | PENDING REVIEW | Puget Sound Energy (`cmnva0pnm00j4m8lzk4vmiuoa`) | Puget Energy / Puget Sound Energy (`cmnva0pr700jam8lzjb1yb2n1`) | No | `6/6/0/9 → 2/5/0/7` |
| 19 | PENDING REVIEW | Skyservice US (formerly Leading Edge Jet Center) (`cmnva0ols00hem8lz203dcggi`) | Skyservice US (`cmoqc03lb00ow171fge71941i`) | No | `1/5/0/18 → 1/3/0/6` |
| 20 | PENDING REVIEW | Transportation Equipment Network (`cmnva0pwi00jjm8lzomcojs56`) | Transportation Equipment Network (TEN) (`cmoqbzvsz00n9171f6oiy98aw`) | No | `3/4/0/32 → 1/4/0/6` |
| 21 | PENDING REVIEW | U.S. Medical Outpatient Facilities Portfolio (Montecito JV) (`cmnva11ml0133m8lzhltgjdef`) | U.S. Medical Outpatient Facilities Portfolio (MedCraft JV) (`cmoqbzd9p00j9171fy63wi359`) | No, but **verify Montecito vs MedCraft are the same portfolio** | `1/3/0/15 → 1/3/0/6` |

## Required reviewer checks

For every cluster, verify legal/entity identity, geographic and portfolio scope, current and former ownership periods, canonical name, citation quality, and whether milestones refer to the same operating business. For approved rows, record the reviewer, date, and rationale before applying the merge. Do not infer approval from name similarity alone.
