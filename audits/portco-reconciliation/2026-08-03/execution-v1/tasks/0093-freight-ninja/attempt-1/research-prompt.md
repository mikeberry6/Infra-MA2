# Freight Ninja — compact Phase 1 reconciliation

Freshly research **Freight Ninja** as of **2026-08-16**. This is one manager-level PortCo list decision, not a scorecard. Requested manager: **Argo Infrastructure Partners**.

The repository currently publishes Freight Ninja as a separate active Argo PortCo (`cmrxpj78w00khivheaaxm91l6`) with one active Argo ownership row dated 2025. It also publishes **LAZ Parking** separately (`cmrxpj5s200iaivhegqucgc2l`) as an active Argo-backed platform from 2021. LAZ announced on May 6, 2025 that it had acquired a majority interest in Freight Ninja, and LAZ's existing record already contains that acquisition as a milestone. The manager census treated LAZ as the manager-level holding and Freight Ninja as an acquisition beneath it. Treat every claim as unverified.

Our census counts a manager-level operating company/platform once. It excludes subsidiaries, bolt-ons, brands, projects and assets beneath an already-counted platform. A subsidiary is not a duplicate legal identity: do **not** recommend a canonical merge/redirect merely because LAZ owns Freight Ninja. If Freight Ninja remains a distinct active operating company controlled through LAZ, the expected list treatment is to archive/remove its standalone published PortCo row while preserving the acquisition on LAZ; preserve accurate indirect ownership history rather than inventing an Argo exit.

Independently search direct pages and later sources to resolve:

1. Freight Ninja's canonical legal identity, brand/status, official site, headquarters and current operations;
2. the exact LAZ/Freight Ninja transaction: announcement versus closing, majority stake, retained founder/management or seller interest if disclosed, and whether Freight Ninja became a subsidiary or remained a distinct legal opco;
3. Argo's current ownership/infrastructure-strategy basis in LAZ, vehicle if disclosed, and whether Argo owns Freight Ninja only indirectly through LAZ;
4. whether LAZ remains the correct single manager-level PortCo boundary, with Freight Ninja as its truck-parking/industrial-outdoor-storage acquisition;
5. any later sale, exit, restructuring, merger, rebrand or pending transaction involving Freight Ninja or LAZ through the as-of date;
6. whether the current direct-looking Freight Ninja Argo ownership row should instead be retained only as indirect historical context when the standalone record is archived.

Open direct pages and documents—not snippets. Prefer Freight Ninja, LAZ Parking, Argo Infrastructure Partners, corporate filings and reliable transaction sources. Search explicitly for acquisitions and subsequent exits. Do not infer a legal merger, ownership percentage, fund vehicle, headquarters or closing date. Use `NOT_PUBLICLY_DISCLOSED` for nonblocking gaps and `DEFERRED` only if current identity or ownership is genuinely unresolved.

Start with:

- https://www.lazparking.com/our-company/about/news/2025/05/06/laz-parking-acquires-majority-interest-in-freight-ninja
- https://www.freightninja.com/
- https://www.freightninja.com/partners/
- https://www.lazparking.com/our-company/about/news/2022/01/03/laz-parking-announces-a-long-term-investment-from-argo-infrastructure-partners
- https://www.prnewswire.com/news-releases/laz-parking-announces-a-long-term-investment-from-argo-infrastructure-partners-301452042.html

Return exactly one **complete, minified, fenced `json` object**, then one Markdown bullet. No narration. Maximum total response: **3,500 characters**. Use strings under 140 characters, at most 4 milestones, 7 evidence rows and 7 before/after strings. Never truncate the JSON; shorten strings or lists instead.

Include every key in this compact schema:

```json
{"asOfDate":"2026-08-16","requestedCompany":"Freight Ninja","requestedManager":"Argo Infrastructure Partners","decision":"VERIFIED_NO_CHANGE|PROPOSED_CORRECTION|SUPERSEDED_OR_DUPLICATE|EXCLUDED|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","aliases":[],"officialWebsite":null,"headquarters":null,"country":"United States","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentOwners":[],"formerOwners":[],"pendingOwnershipTransactions":[]},"operatingResolution":{"sector":"TRANSPORTATION","subsector":"","region":"NORTH_AMERICA","countryTags":["United States"],"description":"","companyStatus":"ACTIVE","yearFounded":null,"services":"","footprint":"","scale":[]},"acquisitionExitCheck":{"formationOrAcquisition":"","legalClosing":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}
```

Owner rows may contain only `manager`, `fund`, `vehicle`, `stake`, `announcementDate`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, `transactionState`. Use `CLOSED_ACTIVE` or `REALIZED`. Evidence rows may contain only `label`, `url`, `purpose`, `sourceTier`, `workingStatus`, `isRecommendedPrimary`; recommend exactly one primary. The Markdown bullet must state the decision and whether Freight Ninja remains a standalone manager-level PortCo.
