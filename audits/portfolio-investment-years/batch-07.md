# Batch 07 - Fengate, GIP, Harbert, Instar, Searchlight, and Blackstone owner-year corrections

Run date: 2026-05-02

Audit after batch:
- Owner-company rows: 1,314
- Flagged rows: 509
- Priority split: 68 critical, 130 high, 290 medium, 21 low

## Implemented Changes

### Freeport Power Limited / Fengate Asset Management
- Prior stored owner years: 2025; corrected owner and top-level year: 2024.
- Decision: changed. Fengate announced financial close on the acquisition of a 50% interest in Freeport Power Limited in December 2024. The later 2025 acquisition of the remaining stake is a follow-on stake increase and does not reset the original investment year.
- Date basis: close / financial close.
- Change made: updated both Fengate owner rows and the top-level `investmentYear` to 2024, retained the 2025 remaining-stake milestone as historical context, and relabeled Fengate's 2024 release as `Close date source - Fengate Asset Management - Freeport Power Limited`.
- Source: https://fengate.com/news/fengate-acquires-significant-stake-in-440-megawatt-texas-cogeneration-asset

### Reworld / EQT Infrastructure and GIC
- Prior stored EQT owner year: 2024; corrected EQT owner year: 2021. GIC owner and top-level year remain 2025.
- Decision: changed for EQT and owner ordering. EQT completed the Covanta acquisition on November 30, 2021. GIC acquired a 25% minority stake in Reworld in a transaction that closed on January 22, 2025. Because the displayed primary firm remains GIC, the top-level year remains 2025.
- Date basis: close date for both owners.
- Change made: reordered the owners so GIC is primary, updated EQT's owner year to 2021, aligned 2021 and 2025 owner-specific acquisition milestones, and added labeled close-date evidence for both owners.
- Sources:
  - https://eqtgroup.com/news/covanta-and-eqt-infrastructure-to-create-the-leading-sustainable-waste-solutions-provider-driving-compelling-value-for-all-stakeholders
  - https://www.reworldwaste.com/news-resources/newsroom/eqt-broadens-reworld-investor-base-welcoming-gic-as-strategic-investor
  - https://hl.com/about-us/transactions/reworld-eqt-gic/

### Tallgrass Energy / Blackstone
- Prior stored owner year: 2020; corrected owner and top-level year: 2019.
- Decision: changed. Blackstone Infrastructure Partners closed its purchase of Tallgrass's general partner and approximately 44% economic interest on March 11, 2019. The 2020 take-private was a subsequent ownership expansion and should not reset Blackstone's original investment year.
- Date basis: close.
- Change made: updated Blackstone's owner year and the top-level `investmentYear` to 2019, aligned the March 11, 2019 acquisition milestone, and relabeled the Blackstone release as `Close date source - Blackstone - Tallgrass Energy`.
- Source: https://www.blackstone.com/news/press/blackstone-infrastructure-partners-closes-purchase-of-controlling-interest-in-tallgrass-energy/

### Wecom Fiber / Searchlight
- Prior stored owner year: 2025; corrected owner and top-level year: 2023.
- Decision: changed. Wecom announced Searchlight's strategic investment on May 15, 2023. No separate close notice was found in reviewed public sources.
- Date basis: announcement fallback.
- Change made: updated Searchlight's owner year and the top-level `investmentYear` to 2023, aligned the investment milestone, and relabeled the Wecom release as `Announcement date source - Searchlight - Wecom Fiber`.
- Source: https://wecomfiber.com/wecom-and-searchlight-capital-partners/

### Aligned Data Centers / Global Infrastructure Partners, Macquarie Asset Management, and Mubadala
- Prior stored years: GIP 2025, Macquarie 2025, Mubadala 2023. Corrected owner order and Macquarie owner year to 2018; GIP remains 2025 and Mubadala remains 2023.
- Decision: changed for Macquarie and owner ordering. Macquarie Infrastructure Partners made its initial strategic investment in Aligned on April 23, 2018. GIP's current entry is based on the October 15, 2025 agreement by AIP, MGX, and BlackRock's GIP to acquire all equity in Aligned; no closing disclosure was found. Mubadala's 2023 source remains valid for its separately disclosed investment.
- Date basis: announcement fallback for GIP and Macquarie; existing investment announcement for Mubadala.
- Change made: reordered owners to match the displayed primary firm, updated Macquarie's owner year to 2018, aligned owner-specific milestones for Macquarie, Mubadala, and GIP, and added separately labeled owner evidence.
- Sources:
  - https://aligneddc.com/press-release/aligned-energy-announces-new-strategic-investment-by-macquarie-infrastructure-partners/
  - https://aligneddc.com/blog/mubadala-invests-in-aligned-data-centers/
  - https://aligneddc.com/press-release/ai-infrastructure-partnership-aip-mgx-and-blackrocks-global-infrastructure-partners-gip-to-acquire-all-equity-in-aligned-data-centers/

### The AES Corporation / Global Infrastructure Partners and EQT Infrastructure
- Prior stored top-level year: missing; corrected owner and top-level year: 2026.
- Decision: changed. AES announced on March 2, 2026 that a consortium led by Global Infrastructure Partners and EQT entered into a definitive agreement to acquire AES. The same announcement states the transaction is expected to close in late 2026 or early 2027, so no close year is available yet.
- Date basis: announcement fallback.
- Change made: added top-level `investmentYear` 2026, made GIP the primary owner to match the displayed firm, aligned acquisition milestones for GIP and EQT, and added owner-specific announcement-date source labels.
- Sources:
  - https://www.aes.com/energy-insights/consortium-led-global-infrastructure-partners-and-eqt-agrees-acquire-aes
  - https://www.prnewswire.com/news-releases/consortium-led-by-global-infrastructure-partners-and-eqt-agrees-to-acquire-aes-302700916.html

### Generate Capital / Harbert Management Corp, QIC, AustralianSuper, and CBRE Investment Management
- Prior stored years: Harbert 2021, QIC 2019, AustralianSuper 2021, CBRE missing, duplicate QIC missing. Corrected missing CBRE year to 2021 and duplicate QIC year to 2019.
- Decision: changed for missing owner years and owner ordering. QIC's public portfolio page records a 2019 acquisition year. Generate's July 19, 2021 release says the $2 billion corporate equity raise was led by existing investors AustralianSuper and QIC with new investment from Harbert Management Corporation, Aware Super, and CBRE Caledon. Harbert's own release announces that Harbert Infrastructure agreed to acquire an interest in Generate on the same date.
- Date basis: QIC portfolio acquisition year for QIC; close announcement / announcement fallback for the 2021 equity raise participants.
- Change made: reordered Harbert as primary to match the displayed firm, added missing CBRE and duplicate QIC owner years, aligned 2019 and 2021 financing milestones, and added owner-specific source labels for QIC, AustralianSuper, CBRE, and Harbert.
- Sources:
  - https://www.qic.com/Investment-Capabilities/Infrastructure/Global-Portfolio/Generate
  - https://www.businesswire.com/news/home/20210719005233/en/Generate-Closes-%242-Billion-Equity-Raise-from-Global-Institutional-Investors-to-Accelerate-and-Scale-Sustainable-Infrastructure-and-Climate-Solutions
  - https://www.harbert.net/assets/press-releases/harbert-infrastructure-generate-press-release-july-19-2021.pdf

### Steel Reef Infrastructure Corp. / Instar
- Prior stored owner years: 2020 and 2025; corrected owner years and top-level year: 2016.
- Decision: changed. InstarAGF Essential Infrastructure Fund invested C$75 million in Steel Reef in April 2016, representing 20.6% of Steel Reef's outstanding common shares. Later 2020 and 2025 activity reflects additional ownership or follow-on context, not Instar's original investment into Steel Reef.
- Date basis: investment announcement / original equity investment disclosure.
- Change made: updated both Instar owner rows and the top-level `investmentYear` to 2016, retained later events as historical context, and relabeled source evidence as `Investment date source - Instar - Steel Reef Infrastructure Corp.`
- Source: https://boereport.com/2016/04/21/instaragf-essential-infrastructure-fund-invests-75-million-in-steel-reef-infrastructure-corp/

## Unchanged High-Conviction Confirmations

- Aligned Data Centers / Global Infrastructure Partners: retained 2025 as announcement fallback because the GIP-led acquisition was announced on October 15, 2025 and reviewed sources do not disclose a close.
- Aligned Data Centers / Mubadala: retained 2023 based on the existing Mubadala investment announcement.
- Reworld / GIC: retained 2025 because Houlihan Lokey's transaction note states the GIC stake sale closed on January 22, 2025.
- Generate Capital / AustralianSuper and QIC: retained 2021 and 2019 respectively based on public owner-specific evidence.

## Unresolved / No Change

- None added in this batch.

