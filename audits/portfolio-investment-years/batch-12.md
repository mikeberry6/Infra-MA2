# Batch 12 - Morrison, Brazos, Arco Norte, Gulf Coast Express, and OnTrac

Run date: 2026-05-02

Audit after batch:
- Owner-company rows: 1,314
- Flagged rows: 479
- Priority split: 45 critical, 128 high, 285 medium, 21 low

## Implemented Changes

### Longroad Energy / Morrison
- Prior stored year: Morrison owner row missing; top-level year already 2016. Corrected year: 2016.
- Decision: changed. Longroad Energy's founding/investor release states that Infratil and the New Zealand Superannuation Fund were the initial committed investors and that Morrison & Co manages Infratil. The release describes the initial equity investment as closing in connection with Longroad's launch, supporting 2016 as Morrison's original investment year through Infratil.
- Date basis: close date disclosed in the founding investor release.
- Change made: added Morrison's 2016 owner investment year, aligned the 2016 financing milestone to the initial investment, and added a labeled investment-date source.
- Sources:
  - https://www.longroadenergy.com/longroad-announces-new-investors/

### Brazos Midstream / MSIP and EnCap Investments
- Prior stored years: MSIP/top-level 2024; EnCap Investments 2026. Corrected years: MSIP/top-level 2018 and EnCap Investments 2022.
- Decision: changed. Brazos Midstream disclosed that it completed the sale of its Delaware Basin subsidiaries to NHIP II, an investment fund managed by Morgan Stanley Infrastructure, on May 29, 2018. EnCap Flatrock Midstream's portfolio page lists Brazos Midstream as an initial 2022 investment, so EnCap's later current-owner row should not inherit MSIP's 2018 date or a 2026 operating update date.
- Date basis: MSIP close date; EnCap portfolio initial-investment disclosure.
- Change made: updated MSIP's owner and top-level investment years to 2018, updated EnCap's owner investment year to 2022, aligned the MSIP milestone to the completed sale, retained the EnCap 2022 investment milestone, and added separately labeled owner-specific source evidence.
- Sources:
  - https://brazosmidstream.com/news/brazos-midstream-completes-sale-delaware-basin-subsidiaries-morgan-stanley-infrastructure
  - https://brazosmidstream.com/news/brazos-midstream-agrees-sell-delaware-basin-subsidiaries-morgan-stanley-infrastructure-175
  - https://www.morganstanley.com/im/en-gb/intermediary-investor/companies/brazos-midstream.html
  - https://www.encapinvestments.com/about/midstream/portfolio/current/brazos-midstream

### Arco Norte / OTPP and CPP Investments
- Prior stored years: OTPP/top-level 2016; CPP Investments 2018. Corrected years: OTPP/top-level 2016 and CPP Investments 2016.
- Decision: changed. CPP Investments' Arco Norte disclosure identifies its investment in the Mexican toll road partnership in 2016, while Ontario Teachers' later Pacifico Sur release states that the same consortium's ownership structure was consistent with Arco Norte at 51% IDEAL, 29% CPPIB, and 20% Ontario Teachers'. The 2018 Pacifico Sur transaction was a later expansion of the partnership, not CPP's original investment in Arco Norte.
- Date basis: 2016 investment/partnership disclosure; no later close date used to reset the owner year.
- Change made: updated CPP Investments' owner investment year to 2016, put OTPP first as the displayed primary owner, aligned 2016 acquisition milestones with owner-specific wording, and added labeled investment-date sources for both owners.
- Sources:
  - https://www.cppinvestments.com/newsroom/cppib-invests-mexican-infrastructure/
  - https://www.otpp.com/en-ca/about-us/news-and-insights/2018/ideal-cppib-and-ontario-teachers-expand-mexican-infrastructure-partnership-with-pacifico-sur-toll-road/

## Unchanged High-Conviction Confirmations

- Longroad Energy / Infratil: retained 2016 because the same Longroad founding release identifies Infratil as one of the initial committed investors in Longroad.
- Arco Norte / OTPP: retained 2016 because public owner disclosures tie Ontario Teachers' to the original Arco Norte partnership and ownership split in 2016.

## Unresolved / No Change

### Gulf Coast Express Pipeline LLC / Mubadala
- Current stored year: missing.
- Suspected year: not high-conviction from public evidence reviewed.
- Sources reviewed:
  - https://www.mubadala.com/en/what-we-do/gulf-coast-express
  - https://www.kindermorgan.com/operations/natural-gas/gulf-coast-express-pipeline
  - https://www.arclight.com/news/arclight-completes-acquisition-of-gulf-coast-express-pipeline-stake-from-phillips-66/
  - https://www.spglobal.com/commodityinsights/en/market-insights/latest-news/natural-gas/011325-arclight-to-buy-additional-gulf-coast-express-stake-phillips-66-says
- Why unresolved: Mubadala's portfolio page confirms current ownership exposure, but the reviewed public sources do not disclose when Mubadala first acquired or funded its Gulf Coast Express stake.
- Evidence needed: Mubadala, project-company, seller, filing, or financial-close disclosure identifying Mubadala's initial investment date in Gulf Coast Express.

### OnTrac / Oaktree / Duration
- Current stored year: missing.
- Suspected year: not high-conviction from public evidence reviewed.
- Sources reviewed:
  - https://www.ontrac.com/about/
  - https://www.ontrac.com/lasership-and-ontrac-unveil-new-name-and-brand-identity/
  - https://www.american-securities.com/en/news/press-releases/lasership-and-ontrac-logistics-to-combine-forming-the-first-pure-play-and-nationwide-e-commerce-last-mile-delivery-network
  - Oaktree public portfolio and investment pages located through web search
- Why unresolved: Public OnTrac and LaserShip materials disclose the LaserShip/OnTrac combination and current business history, but the reviewed materials do not clearly identify Oaktree / Duration's original investment date into the named OnTrac business.
- Evidence needed: Oaktree, Duration, OnTrac, LaserShip, seller, or transaction disclosure identifying the initial owner investment date.
