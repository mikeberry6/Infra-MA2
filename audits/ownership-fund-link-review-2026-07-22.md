# Ownership-to-Fund Link Review — 2026-07-22

> **REVIEW-ONLY CONTROL:** Every item in this document is **PENDING RESEARCH REVIEW**. This artifact is not an approval file and authorizes no database, seed, ownership, fund, publication, or other mutation.

## Scope

This review covers four validation issues in which an ownership period retains the editorial vehicle label `TPG Rise Climate` but its `fundId` points to the fund now named `TPG Rise Climate II`. The proposed mechanical treatment is to **unlink `fundId` only**. It is not to relabel any ownership period as `TPG Rise Climate II`.

| Ownership period ID | Company | Company ID | Stored vehicle label | Currently linked fund manifest row | Review status |
| --- | --- | --- | --- | --- | --- |
| `cmoelbgjt007k3alznlmo13vq` | Monarch Bioenergy | `cmnva0lna00ckm8lztuem9e3y` | `TPG Rise Climate` | `FUND-146` · `TPG Rise Climate II` | **PENDING RESEARCH REVIEW** |
| `cmoelbgqb007q3alz9hnc5hec` | Olympus Terminals | `cmnva0lnv00clm8lzf129v5o5` | `TPG Rise Climate` | `FUND-146` · `TPG Rise Climate II` | **PENDING RESEARCH REVIEW** |
| `cmoelbgwc007v3alz5kk6tjz4` | Pike Corporation | `cmnva0lom00cmm8lza8354g4w` | `TPG Rise Climate` | `FUND-146` · `TPG Rise Climate II` | **PENDING RESEARCH REVIEW** |
| `cmoelbh5100833alzd5nyuxr0` | Summit Carbon Solutions | `cmnva0lp600cnm8lzmpwtl0cr` | `TPG Rise Climate` | `FUND-146` · `TPG Rise Climate II` | **PENDING RESEARCH REVIEW** |

## Provenance and root cause

The fund manifest row with legacy ID `FUND-146` was historically named `TPG Rise Climate`. Commit `8ad65efa527a553b37311f85f54857083a38efed` (`8ad65efa`, “Update fund database sources,” 2026-05-07) corrected that fund row to the specific successor name `TPG Rise Climate II`. The existing ownership foreign keys persisted across the correction, so they now point from an older `TPG Rise Climate` vehicle label to a different, specifically numbered fund.

That persistence is a stale-link condition, not evidence that any of the four investments belongs to `TPG Rise Climate II`. The existing first-party source trails recorded in `audits/portfolio-current-owner-fund-verification-2026-05-13.csv` support the editorial ownership assertions only to the level documented there. For all four rows, the CSV leaves the verified fund vehicle as `n.a.`; it does not establish Rise Climate II as the investing fund.

### Supplemental fund-lineage evidence — 2026-07-23

Additional first-party and filing-grade research strengthens the proposed unlink while preserving the human-review boundary:

- TPG's [2026 Operating Principles report](https://cms.tpg.com/wp-content/uploads/2026/05/OPFIM_TPG-Impact-2026.pdf) identifies `TPG Rise Climate, L.P.` and the collective `TPG Rise Climate II` vehicles as legally distinct.
- The [Rise Climate II Form D](https://www.sec.gov/Archives/edgar/data/2014691/000201469126000001/xslFormDX01/primary_doc.xml) reports formation in 2023 and a first sale on 2024-08-02.
- Monarch Bioenergy's [2022 transaction announcement](https://monarchbio.com/press-releases-articles-whitepapers/tpg-rise-climate-accelerates-renewable-energy-development-with-investment-in-monarch-bioenergy-joint-venture) and Summit Agricultural Group's [2022 financing announcement](https://www.summitag.com/summit-carbon-solutions-announces-successful-completion-of-1-billion-equity-raise-following-300-million-investment-from-tpg-rise-climate/) name only the Rise Climate strategy. Fund II is chronologically impossible for those investments, but neither source identifies the exact legal LP required for an exact Fund link.
- TPG's [2024 Olympus announcement](https://www.tpg.com/news-and-insights/tpg-rise-climate-to-acquire-olympus-terminals-leading-renewable-fuels-logistics-provider) predates Fund II's reported first sale and names only the strategy. TPG reported zero Fund II invested capital at [2024 year-end](https://www.sec.gov/Archives/edgar/data/1880661/000188066125000014/tpg-20241231.htm) and [2025 first quarter-end](https://www.sec.gov/Archives/edgar/data/1880661/000188066125000032/tpg1q25earningsreleasefi.htm). That weighs against the current link but does not resolve signing, warehouse, co-investment, or later-closing mechanics.
- TPG's [2025 Pike announcement](https://www.tpg.com/news-and-insights/pike-corporation-to-accelerate-growth-through-partnership-with-tpg-la-caisse-and-management) names the multi-pool Rise Climate platform rather than a numbered fund. Fund II is chronologically plausible, but the exact vehicle remains unproven.

The resulting recommendation remains **UNLINK all four stale `fundId` values while preserving `organizationId` and `vehicleName`**. No exact `LINK` is supportable from the current evidence. A future link to Fund I, Fund II, a co-investment vehicle, or another pool requires a matching Fund record, transaction-level vehicle evidence, and a regenerated approval artifact. This recommendation is still **PENDING RESEARCH REVIEW** and is not an approval.

## Proposed mechanical action and preservation boundary

For each item, the only proposed mechanical action is:

```text
fundId: <current stale link> -> null
```

If separately approved through the generated remediation workflow, the unlink must preserve without alteration:

- `organizationId`;
- `vehicleName`, exactly `TPG Rise Climate`;
- stake or ownership-interest data;
- all start, investment, closing, end, and other date fields;
- active/inactive state;
- the company relationship; and
- every editorial ownership assertion, description, milestone, and source trail.

Do **not** relabel any vehicle as `TPG Rise Climate II`, infer a Fund II attribution, rewrite an ownership assertion, or use this review to modify seed data. A future fund link would require separate first-party evidence of an exact normalized vehicle-to-fund match and a newly generated review artifact.

## Item reviews

### Monarch Bioenergy

- **Review status:** **PENDING RESEARCH REVIEW**
- **Ownership period:** `cmoelbgjt007k3alznlmo13vq`
- **Company:** `cmnva0lna00ckm8lztuem9e3y`
- **Validation issue:** `vehicleName` is `TPG Rise Climate`, while the linked fund is `FUND-146` / `TPG Rise Climate II`.
- **Existing first-party trail:** The verification CSV records the [Monarch Bioenergy transaction announcement](https://monarchbio.com/press-releases-articles-whitepapers/tpg-rise-climate-accelerates-renewable-energy-development-with-investment-in-monarch-bioenergy-joint-venture), together with Monarch's company, projects, and origins pages.
- **Existing evidence classification:** The CSV records `verified_fund_vehicle_result: n.a.` and explains that the supplemental `TPG Rise Climate` detail identifies an owner/manager label, not a distinct verified fund vehicle.
- **Proposed treatment, not approved:** Unlink `fundId` only and preserve every ownership field and editorial assertion listed in the preservation boundary.

### Olympus Terminals

- **Review status:** **PENDING RESEARCH REVIEW**
- **Ownership period:** `cmoelbgqb007q3alz9hnc5hec`
- **Company:** `cmnva0lnv00clm8lzf129v5o5`
- **Validation issue:** `vehicleName` is `TPG Rise Climate`, while the linked fund is `FUND-146` / `TPG Rise Climate II`.
- **Existing first-party trail:** The verification CSV records the [TPG transaction announcement](https://www.tpg.com/news-and-insights/tpg-rise-climate-to-acquire-olympus-terminals-leading-renewable-fuels-logistics-provider) and the [Olympus Terminals company site](https://olympusterminals.com/), with the remaining supporting URLs retained in the CSV row.
- **Existing evidence classification:** The CSV records `verified_fund_vehicle_result: n.a.` and states that the fund was not publicly disclosed.
- **Proposed treatment, not approved:** Unlink `fundId` only and preserve every ownership field and editorial assertion listed in the preservation boundary.

### Pike Corporation

- **Review status:** **PENDING RESEARCH REVIEW**
- **Ownership period:** `cmoelbgwc007v3alz5kk6tjz4`
- **Company:** `cmnva0lom00cmm8lza8354g4w`
- **Validation issue:** `vehicleName` is `TPG Rise Climate`, while the linked fund is `FUND-146` / `TPG Rise Climate II`.
- **Existing first-party trail:** The verification CSV records the [TPG transaction announcement](https://www.tpg.com/news-and-insights/pike-corporation-to-accelerate-growth-through-partnership-with-tpg-la-caisse-and-management), the [Pike company site](https://www.pike.com/), and the TPG shareholder source retained in that row.
- **Existing evidence classification:** The CSV records `verified_fund_vehicle_result: n.a.` and explains that the supplemental `TPG Rise Climate` detail identifies an owner/manager label, not a distinct verified fund vehicle.
- **Proposed treatment, not approved:** Unlink `fundId` only and preserve every ownership field and editorial assertion listed in the preservation boundary.

### Summit Carbon Solutions

- **Review status:** **PENDING RESEARCH REVIEW**
- **Ownership period:** `cmoelbh5100833alzd5nyuxr0`
- **Company:** `cmnva0lp600cnm8lzmpwtl0cr`
- **Validation issue:** `vehicleName` is `TPG Rise Climate`, while the linked fund is `FUND-146` / `TPG Rise Climate II`.
- **Existing first-party trail:** The verification CSV records the [Summit-issued transaction release](https://www.prnewswire.com/news-releases/summit-carbon-solutions-announces-successful-completion-of-1-billion-equity-raise-following-300-million-investment-from-tpg-rise-climate-301545158.html), the [Summit Carbon Solutions company site](https://www.summitcarbonsolutions.com/), and the Summit Agricultural Group version retained in that row.
- **Existing evidence classification:** The CSV records `verified_fund_vehicle_result: n.a.` and explains that the supplemental `TPG Rise Climate` detail identifies an owner/manager label, not a distinct verified fund vehicle.
- **Proposed treatment, not approved:** Unlink `fundId` only and preserve every ownership field and editorial assertion listed in the preservation boundary.

## Required approval path

This Markdown file cannot be used as a remediation approval. No database or seed mutation is authorized by its creation or review.

1. Complete the company-merge review first and apply any separately approved merge decisions only to the isolated validation branch.
2. Generate a fresh **post-merge** ownership-to-fund-link template. Discard any pre-merge ownership template.
3. Research must review these four rows in that generated template, preserving its opaque IDs, snapshot values, candidates, and other generated binding data.
4. Any unlink decision must be recorded in the generated template without changing `vehicleName` or other ownership metadata, then committed at the canonical approval path `audits/approvals/ownership-fund-links.json`.
5. A second reviewer must review the exact file bytes and record the exact SHA-256. Operations may later supply that digest only through the protected remediation workflow under a separate mutation authorization.

The generated post-merge template and its exact reviewed hash—not this narrative artifact—must bind any later approval. A stale template, hand-authored substitute, or approval that relabels the vehicle is invalid.

## Reviewer decision table

| Ownership period ID | Company | Proposed mechanical action | Reviewer decision | Reviewer | Review date | Rationale |
| --- | --- | --- | --- | --- | --- | --- |
| `cmoelbgjt007k3alznlmo13vq` | Monarch Bioenergy | Unlink `fundId` only | **PENDING RESEARCH REVIEW** | — | — | — |
| `cmoelbgqb007q3alz9hnc5hec` | Olympus Terminals | Unlink `fundId` only | **PENDING RESEARCH REVIEW** | — | — | — |
| `cmoelbgwc007v3alz5kk6tjz4` | Pike Corporation | Unlink `fundId` only | **PENDING RESEARCH REVIEW** | — | — | — |
| `cmoelbh5100833alzd5nyuxr0` | Summit Carbon Solutions | Unlink `fundId` only | **PENDING RESEARCH REVIEW** | — | — | — |

No row may advance from **PENDING RESEARCH REVIEW** based on this document alone.
