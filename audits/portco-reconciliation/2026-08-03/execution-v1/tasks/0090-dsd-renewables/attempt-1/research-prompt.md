# DSD Renewables — Phase 1 PortCo reconciliation

Research **DSD Renewables** as of **2026-08-15** using a fresh, current web search. Requested census managers: **Ares Management, BlackRock, and Global Infrastructure Partners (GIP)**. This is a list/ownership decision, not a full scorecard.

Existing production company `cmrxpj8vd00n1ivhe5l7psm8n` treats DSD as one active U.S. distributed-solar, storage, and EV-charging platform. It records **BlackRock** as active from 2019 through vehicle `n.a.` and **Ares Management** as active from 2022 through `Infrastructure and Power strategy`, with no disclosed stakes, no former owners, and no pending transaction. Its narrative also says Cox Enterprises invested in 2023, but Cox has no ownership period. Treat every existing claim as unverified.

The immutable queue contains one Ares census holding plus repo-only BlackRock and GIP judgments. It flags that Ares made a $200 million preferred-equity investment in 2022 and may have obtained control in 2025; BlackRock's retained-equity status is unclear; and GIP may be only an incorrect attribution of legacy BlackRock infrastructure vehicles. There is only one canonical production company and no duplicate candidate, so do not recommend a merge unless fresh evidence identifies an actual second company record.

Resolve the complete legal ownership sequence:

- GE Solar / Distributed Solar Development predecessor and the 2019 DSD launch;
- BlackRock Real Assets' reported 80% 2019 acquisition and remaining 20% 2020 acquisition, including exact vehicle/fund;
- Ares' March 3, 2022 preferred-equity investment and whether it is direct infrastructure equity rather than debt;
- Cox Enterprises' November 2023 strategic investment, whether it conveyed a direct ownership stake, and whether Cox remains an owner;
- the reported March/May 2025 consensual change of control / preferred-to-common conversion and whether Ares became majority owner;
- whether BlackRock retained a minority stake, fully exited, or remains unresolved after that change;
- whether any BlackRock interest is properly attributable to GIP after BlackRock's GIP acquisition—do not infer a DSD ownership transfer from manager-level corporate integration;
- the November 2025 report that Ares was exploring a sale, and any later signed sale, closing, exit, restructuring, insolvency, or owner reference through the as-of date. An exploratory process is not a pending ownership transaction.

Use reliable secondary sources if primary evidence is unavailable, but distinguish reported facts from direct company/manager disclosure. `UNRESOLVED` current legal ownership requires `DEFERRED`; use `NOT_PUBLICLY_DISCLOSED` for noncritical gaps. Do not infer an exact stake from investment dollars. Do not count lenders, tax-equity investors, customers, project counterparties, subsidiaries, or individual projects as platform owners.

Also verify canonical/legal identity and platform boundary; official site and headquarters; infrastructure basis; current status; operating footprint/scale sufficient for the list; and whether the database's four milestones require correction or consolidation.

Open direct pages, not search snippets, including:

- https://dsdrenewables.com/overview/
- https://dsdrenewables.com/featured/dsd-celebrates-5-years/
- https://dsdrenewables.com/press-release/dsd-secures-200m-preferred-equity-investment-from-ares-management-press-release/
- https://dsdrenewables.com/press-release/dsd-receives-250m-strategic-investment-from-cox-enterprises-press-release/
- https://dsdrenewables.com/press-release/dsd-secures-238-million-in-long-term-financing-for-233-mw-of-solar-energy/
- https://ionanalytics.com/insights/infralogic/ares-exploring-sale-of-dsd-renewables/
- https://newprojectmedia.com/risk-dsd-renewables-pursuing-asset-sales-amongst-layoffs-restructuring/
- https://www.stblaw.com/our-team/partners/sonia-lopez

Choose exactly one: `VERIFIED_NO_CHANGE`, `PROPOSED_CORRECTION`, `SUPERSEDED_OR_DUPLICATE`, `EXCLUDED`, or `DEFERRED`.

Return one complete fenced `json` object, then at most two concise Markdown bullets. Start with ` ```json `. Keep the entire response under 5,000 characters: strings under 220 characters, at most 6 milestones and 9 direct-URL evidence rows. Include every top-level key below. No research narration.

```json
{
  "asOfDate":"2026-08-15",
  "requestedCompany":"DSD Renewables",
  "requestedManager":"Ares Management / BlackRock / Global Infrastructure Partners",
  "decision":"",
  "confidence":"HIGH|MEDIUM|LOW",
  "rationale":"",
  "identityResolution":{"canonicalLegalName":"","aliases":[],"officialWebsite":null,"headquarters":null,"country":null,"platformBoundary":"","duplicateDecision":""},
  "ownershipResolution":{"managerAliasDecision":"","currentOwners":[],"formerOwners":[],"pendingOwnershipTransactions":[]},
  "operatingResolution":{"sector":null,"subsector":null,"region":null,"countryTags":[],"description":null,"companyStatus":null,"yearFounded":null,"services":null,"footprint":null,"scale":[]},
  "acquisitionExitCheck":{"formationOrAcquisition":"","legalClosing":"","subsequentExitSearch":""},
  "milestones":[],
  "evidence":[{"label":"","url":"https://...","purpose":"","sourceTier":"PRIMARY|REGULATORY|INSTITUTIONAL|REPUTABLE_SECONDARY","workingStatus":"WORKING|REDIRECTED|BROWSER_BLOCKED_BUT_VERIFIED|DEAD","isRecommendedPrimary":false}],
  "beforeAfterChanges":[],
  "excludedOrDuplicateCandidates":[],
  "unresolvedQuestions":[],
  "recommendedListAction":""
}
```

Ownership rows may use only manager, fund, vehicle, stake, announcementDate, entryDate, entryYear, exitDate, exitYear, isActive and transactionState. State explicitly whether Ares preferred equity is in-scope direct equity, whether BlackRock and Cox remain current, and why GIP is or is not an owner. Recommend exactly one primary source. A complete parseable object and the Markdown review are mandatory.
