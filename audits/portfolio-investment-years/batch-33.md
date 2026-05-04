# Portfolio Investment-Year Verification — Batch 33

Date: 2026-05-02

Audit after batch:
- Rows reviewed by audit: 1,311 owner-company rows
- Remaining flagged rows: 289

## Implemented Changes

### Navisun LLC — OMERS
- Stored year before/after: 2022 / 2021
- Date basis: announcement fallback
- Change: Updated top-level and owner investment years to 2021, relabeled the Navisun source as `Announcement date source — OMERS — Navisun LLC`, and clarified that no public close date was found in the reviewed sources.
- Sources reviewed:
  - https://www.navisunllc.com/news/omers-infrastructure-signs-agreement-with-ares-management-to-acquire-100-of-navisun-llc-signals-entry-into-distributed-generation-space
- Rationale: OMERS announced a signed agreement to acquire 100% of Navisun on Nov. 2, 2021, with expected Q1 2022 close. Because no close/completion disclosure was found, the rule requires the announcement/signing year.

### Skyway Concession Company — OTPP
- Stored year before/after: 2016 / 2016
- Date basis: close date
- Change: Added explicit `(OTPP)` owner attribution to the 2016 acquisition milestones, relabeled the FHWA profile as `Close date source — OTPP — Skyway Concession Company`, changed the 2026 holding-list milestone from `Financing` to `Other`, and removed a duplicate OTPP owner row.
- Sources reviewed:
  - https://www.omersinfrastructure.com/news/omers-completes-acquisition-of-chicago-skyway
  - https://www.fhwa.dot.gov/ipd/project_profiles/il_chicago_skyway.aspx
  - https://www.chicagoskyway.org/the-skyway
  - https://www.cppinvestments.com/newsroom/cppib-consortium/
- Rationale: Public sources support February 2016 close for the Canadian pension consortium acquisition. The duplicate OTPP owner row did not represent a distinct owner/date and made owner-level audit output noisier.

### Primergy — Quinbrook
- Stored year before/after: 2020 / 2020
- Date basis: investment-date disclosure
- Change: Reworded and reclassified the May 18, 2020 launch as a `Financing` milestone, labeled the Primergy launch source as `Investment date source — Quinbrook — Primergy`, and reworded the 2024 continuation-fund milestone so it no longer looks like a new Primergy investment date.
- Sources reviewed:
  - https://www.primergypower.com/news/quinbrook-launches-primergy-solar-to-develop-solar-and-battery-storage-across-north-america
  - https://www.quinbrook.com/portfolio/primergy/
  - https://www.quinbrook.com/news-insights/quinbrook-closes-600m-solarstorage-continuation-fund/
- Rationale: Quinbrook launched Primergy as a new portfolio company in 2020. The 2024 continuation fund involved later fund structuring and portfolio transfers, not Quinbrook’s initial investment in Primergy.

### Rowan Cinco — Quinbrook
- Stored year before/after: 2025 / 2022
- Date basis: investment-date disclosure
- Change: Updated top-level and both owner investment years to 2022, added a same-year `Acquisition` milestone from Quinbrook’s project page, relabeled the source as `Investment date source — Quinbrook — Rowan Cinco`, and preserved 2025/2026 construction and financing milestones as later history.
- Sources reviewed:
  - https://www.quinbrook.com/projects/cinco/
  - https://rowan.digital/news/cinco-data-center/
  - https://rowan.digital/news/press-release/
  - https://www.davispolk.com/experience/rowan-551-million-project-financing-medina-county-texas-data-center
- Rationale: Quinbrook’s project page lists Cinco as acquired in 2022. Later construction start and construction financing are important development milestones but do not reset the original owner/project investment year.

### Rowan Temple — Quinbrook
- Stored year before/after: 2023 / 2022
- Date basis: investment-date disclosure
- Change: Updated top-level and both owner investment years to 2022, added a same-year `Acquisition` milestone from Quinbrook’s Temple project page, and relabeled the source as `Investment date source — Quinbrook — Rowan Temple`.
- Sources reviewed:
  - https://www.quinbrook.com/projects/temple/
  - https://www.quinbrook.com/news-insights/quinbrook-expands-rowan-green-data-center-platform/
  - https://rowan.digital/news/rowan-powers-texas-growth-as-construction-begins-on-300-mw-temple-data-center/
- Rationale: Quinbrook’s project page lists Temple as acquired in 2022. The 2023 Rowan platform expansion and 2026 construction start remain later development milestones.

### Valley of Fire — Quinbrook
- Stored year before/after: 2020 / 2017
- Date basis: investment-date disclosure
- Change: Updated top-level and owner investment years to 2017, added a same-year `Acquisition` milestone from Quinbrook’s Valley of Fire Solar project page, and relabeled the source as `Investment date source — Quinbrook — Valley of Fire`.
- Sources reviewed:
  - https://www.quinbrook.com/projects/valley-of-fire-solar/
  - https://www.quinbrook.com/news-insights/quinbrook-closes-600m-solarstorage-continuation-fund/
- Rationale: Quinbrook’s project page lists Valley of Fire Solar as acquired in 2017. The 2024 continuation fund transferred assets between fund structures and should not reset the investment year.

## Unchanged High-Conviction Confirmations

### Leeward Renewable Energy — OMERS
- Stored year before/after: 2018 / 2018
- Date basis: announcement fallback
- Sources reviewed:
  - https://www.omers.com/news/omers-infrastructure-announces-agreement-to-acquire-leeward-renewable-energy
  - https://www.omersinfrastructure.com/news/omers-infrastructure-announces-agreement-to-acquire-leeward-renewable-energy/
  - https://www.omersinfrastructure.com/news/leeward-renewable-energy-completes-acquisition-of-solar-development-platform/
- Rationale: OMERS announced the Leeward acquisition in March 2018 and no public close/completion release was found. The later 2021 First Solar platform acquisition is a Leeward bolt-on and does not change OMERS’s original Leeward investment year.

## Audit Tooling

- Added `acquisition`, `holding`, `holdings`, `listed`, and `transaction` to the audit owner-token stopword list.
- Rationale: Generic ownership-vehicle language was creating false owner matches against later acquisition/holding milestones, especially where the owner vehicle describes a transaction rather than a fund name.

## Unresolved Cases

- None newly unresolved in this batch.
