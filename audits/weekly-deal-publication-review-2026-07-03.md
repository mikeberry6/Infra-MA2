# Weekly Deal Publication Review — 2026-07-03

## Scope and hard guardrails

This artifact documents five true missing weekly records for individual research review. It is review-only: every item remains **PENDING RESEARCH REVIEW**, and nothing in this document constitutes approval to publish, sync, backfill, or change a live record.

- Do **not** edit any historical weekly email file, including `public/email-format/2026-07-03.html`.
- Do **not** write to any public or database-backed deal surface. This prohibits Prisma/Neon mutations, Deal seed-record or fixture edits, public deal-record changes, source replacements, and any sync or import command with an apply/write mode. The review-neutral weekly lineage manifest records existing card-to-seed identity only; it cannot alter a Deal fact or publication state.
- Do **not** infer batch approval. Each record requires an explicit, individual reviewer decision before a separately authorized implementation change may be prepared.
- Preserve the source claims and caveats below. A primary source supports the stated facts; it does not automatically settle classification, participant modeling, or publication eligibility.

The card ordinal remains useful issue provenance but is not a safe database
identity. Against the retained validation state, the collision-safe proposal
resolver produces the following deterministic DRAFT IDs without changing the
historical email or any existing record:

| Weekly card ID | Resolved DRAFT proposal ID | Record | Status |
| --- | --- | --- | --- |
| `WB-2026-07-03-004` | `WB-2026-07-03-H51d8779aff30cbe26ae12c54` | SK / KKR Korea renewables platform | **PENDING RESEARCH REVIEW** |
| `WB-2026-07-03-014` | `WB-2026-07-03-H77dfa5d1f31ce4d2c7cd1f6c` | Nippon Gateway Infrastructure | **PENDING RESEARCH REVIEW** |
| `WB-2026-07-03-019` | `WB-2026-07-03-H28d24dd65b37593e9094af84` | UK passenger rolling stock platform | **PENDING RESEARCH REVIEW** |
| `WB-2026-07-03-021` | `WB-2026-07-03-Hcd440cdb9811de846f6bbcad` | Avenue Capital aviation leasing portfolio | **PENDING RESEARCH REVIEW** |
| `WB-2026-07-03-024` | `WB-2026-07-03-Hbea094e0e7cb1d0d5da2ceaa` | Genus Power Infrastructures | **PENDING RESEARCH REVIEW** |

These are planned proposal identities, not evidence that a DRAFT was written.
The resolver treats an exact matching DRAFT as an idempotent replay, refuses to
overwrite a changed DRAFT, tracks matching `IN_REVIEW`, `PUBLISHED`, or
`ARCHIVED` records without mutation, rejects ambiguous matches, and fails
before mutation if a resolved ID is occupied by a different transaction.

## `WB-2026-07-03-004` — SK / KKR Korea renewables platform

**Review status:** **PENDING RESEARCH REVIEW**

### Current parsed record

- Title: `SK / KKR Korea renewables platform | KKR`
- Buyer / seller: KKR / N/A
- Classification: Power & ET · Renewable Power · Asia-Pacific · Joint Venture
- Country / record date / status: South Korea · 2026-07-03 · Announced
- Current overview: KKR and SK signed definitive agreements to establish a renewable-energy platform in South Korea. The investment is tied to KKR's Asia Pacific infrastructure strategy and targets power-transition assets in a high-demand market.

### Exact primary source

- KKR, “SK and KKR Launch Korea's Largest Renewable Energy Platform,” June 30, 2026: [KKR release](https://media.kkr.com/news-details/?news_id=d294a153-9bcd-4cd0-95b6-45239bdb3dac)

### Evidence and review points

The KKR release supports the definitive agreements, SK and KKR as the direct platform parties, the South Korea geography, and the renewable-energy platform launch. Before publication, the reviewer should confirm whether `Joint Venture` is the intended normalized category and whether SK should be modeled as a named co-investor/partner rather than left only in the target label and overview.

**Publication blocker:** No individual research approval has been recorded.

## `WB-2026-07-03-014` — Nippon Gateway Infrastructure

**Review status:** **PENDING RESEARCH REVIEW**

### Current parsed record

- Title: `Nippon Gateway Infrastructure | DigitalBridge`
- Buyer / seller: DigitalBridge / N/A
- Classification: Digital · Data Centers · Asia-Pacific · Acquisition (Buyout)
- Country / record date / status: Japan · 2026-07-03 · Announced
- Current overview: DigitalBridge and JEXI formed Nippon Gateway Infrastructure, a new Japanese colocation data-center platform. NGI launched with data-center assets acquired from NEC and is positioned for Japan's digital infrastructure demand.

### Exact primary source

- DigitalBridge, “DigitalBridge and JEXI Announce Formation of Nippon Gateway Infrastructure, a New Data Center Platform in Japan,” July 1, 2026: [DigitalBridge release](https://www.digitalbridge.com/news/2026-07-01-digitalbridge-and-jexi-announce-formation-of-nippon-gateway-infrastructure-a-new-data-center-platform-in-japan)

### Evidence and review points

The DigitalBridge release supports the formation of NGI by DigitalBridge and JEXI and says its foundational portfolio comprises Greater Tokyo and Osaka data-center assets acquired from NEC. Before publication, the reviewer should decide whether the record is principally a platform launch/joint venture or an acquisition, model JEXI as a direct formation partner, and identify NEC in the appropriate seller/counterparty field if the schema supports it. The current `Acquisition (Buyout)` label should not be accepted without that classification review.

**Publication blocker:** No individual research approval has been recorded.

## `WB-2026-07-03-019` — UK passenger rolling stock platform

**Review status:** **PENDING RESEARCH REVIEW**

### Current parsed record

- Title: `UK passenger rolling stock platform | Partners Group`
- Buyer / seller: Partners Group / N/A
- Classification: Transportation · Rail Rolling Stock · Europe · Acquisition (Minority Stake)
- Country / record date / status: United Kingdom · 2026-07-03 · Announced
- Current overview: Partners Group made a co-lead infrastructure secondaries investment in a UK passenger rolling stock leasing platform. The platform comprises more than 1,500 vehicles contracted into the UK rail system.

### Exact primary source

- Partners Group, “Partners Group invests GBP 260 million in next-generation UK rolling stock leasing platform,” July 1, 2026: [Partners Group release](https://www.partnersgroup.com/en/news-and-views/press-releases/investment-news/detail?news_id=eb98a158-5f80-4411-ae58-4194faa913fa)

### Evidence and review points

The Partners Group release supports a GBP 260 million infrastructure-secondaries investment as co-lead investor in a continuation vehicle established by Aberdeen Investments and Rock Rail. It also supports five UK passenger rolling stock fleets and more than 1,500 vehicles. Before publication, the reviewer should determine how Aberdeen Investments, Rock Rail, and the continuation vehicle belong in the seller/counterparty fields. The source does not disclose a percentage stake, so `Minority Stake` should remain a classification judgment rather than a sourced fact.

**Publication blocker:** No individual research approval has been recorded.

## `WB-2026-07-03-021` — Avenue Capital aviation leasing portfolio

**Review status:** **PENDING RESEARCH REVIEW**

### Current parsed record

- Title: `Avenue Capital aviation leasing portfolio | Partners Group`
- Buyer / seller: Partners Group / N/A
- Classification: Transportation · Aviation Leasing · North America · Acquisition (Minority Stake)
- Country / record date / status: Global · 2026-07-03 · Announced
- Current overview: Partners Group invested US$250 million as sole lead investor in a continuation vehicle acquiring a global commercial aviation leasing portfolio. The contracted aircraft-leasing exposure fits the firm's infrastructure secondaries strategy.

### Exact primary source

- Partners Group, “Partners Group invests in Avenue Capital Group's global commercial aviation leasing portfolio,” June 30, 2026: [Partners Group release](https://www.partnersgroup.com/en/news-and-views/press-releases/investment-news/detail?news_id=36cca93d-8e19-4943-8ce8-1725902ec800)

### Evidence and review points

The Partners Group release supports a USD 250 million investment as sole lead investor in a continuation vehicle established by Avenue Capital Group. It describes a global portfolio of 69 commercial aviation leasing projects with contracted cash flows. Before publication, the reviewer should capture Avenue Capital Group and the continuation vehicle in the appropriate seller/counterparty fields and confirm the geography normalization. The source does not disclose a percentage stake, so `Minority Stake` should remain a classification judgment rather than a sourced fact.

**Publication blocker:** No individual research approval has been recorded.

## `WB-2026-07-03-024` — Genus Power Infrastructures

**Review status:** **PENDING RESEARCH REVIEW**

### Current parsed record

- Title: `Genus Power Infrastructures | GIC`
- Buyer / seller: Undisclosed Buyer / GIC
- Classification: Utilities · Smart Metering / Utilities · Asia-Pacific · Sale (Buyout)
- Country / record date / status: India · 2026-07-03 · Announced
- Current overview: GIC sold an 11.03% equity stake in Genus Power Infrastructures through an open-market block transaction. Genus supplies smart-metering and utility digitalization infrastructure, making the sale a secondary equity rotation in the power-distribution value chain.

### Exact primary sources

- Chiswick Investment Pte. Ltd., “Disclosure under Regulation 29(2) of Securities and Exchange Board of India (Substantial Acquisition of Shares and Takeovers) Regulations, 2011,” filed July 1, 2026: [signed BSE filing](https://www.bseindia.com/xml-data/corpfiling/AttachHis/28CC25E4_BEF6_48BE_A642_E7FFDD9E7065_152159.pdf)
- GIC, “GIC Affiliate and Genus Power & Infrastructures Limited (‘Genus’) to set up a Platform to fund Smart Metering projects – USD 2 billion initial pipeline,” July 4, 2023: [GIC affiliation release](https://www.gic.com.sg/newsroom/all/gic-genus-smart-metering-platform/)

### Evidence and review points

The signed Chiswick filing identifies Genus Power Infrastructures Limited as the target and records Chiswick Investment Pte. Ltd.'s June 30, 2026 open-market sale of 33,559,114 shares, equal to 11.030% of Genus. It shows Chiswick's holding falling from 15.113% to 4.082% but does not identify or allocate the sold shares among buyers. The GIC release independently establishes Chiswick as a GIC affiliate.

Buyer qualification must remain: **multiple open-market buyers / not fully disclosed; do not name Madhusudan Kela as sole buyer.** Any secondary report naming a partial purchaser does not establish that purchaser as buyer of the entire 11.03% block. Before publication, the reviewer should decide whether the normalized buyer remains `Undisclosed Buyer` or becomes a plural open-market-buyer label, and should correct the economic classification only if individually approved: an 11.03% divestment is not supported as a buyout by the primary filing.

**Publication blocker:** The complete buyer allocation is not disclosed in the primary filing, and no individual research approval has been recorded.

## Reviewer decision log

| Weekly card ID | Resolved DRAFT proposal ID | Decision | Reviewer | Decision date | Notes |
| --- | --- | --- | --- | --- | --- |
| `WB-2026-07-03-004` | `WB-2026-07-03-H51d8779aff30cbe26ae12c54` | **PENDING RESEARCH REVIEW** | — | — | Confirm category and SK participant treatment. |
| `WB-2026-07-03-014` | `WB-2026-07-03-H77dfa5d1f31ce4d2c7cd1f6c` | **PENDING RESEARCH REVIEW** | — | — | Resolve platform formation versus acquisition and participant fields. |
| `WB-2026-07-03-019` | `WB-2026-07-03-H28d24dd65b37593e9094af84` | **PENDING RESEARCH REVIEW** | — | — | Resolve continuation-vehicle counterparties and stake classification. |
| `WB-2026-07-03-021` | `WB-2026-07-03-Hcd440cdb9811de846f6bbcad` | **PENDING RESEARCH REVIEW** | — | — | Resolve Avenue/continuation-vehicle fields and geography. |
| `WB-2026-07-03-024` | `WB-2026-07-03-Hbea094e0e7cb1d0d5da2ceaa` | **PENDING RESEARCH REVIEW** | — | — | Preserve the buyer-disclosure caveat and review sale classification. |

No record may advance from this log without an explicit reviewer decision. Approval, if later granted, authorizes neither a historical email edit nor a public/database write by itself.
