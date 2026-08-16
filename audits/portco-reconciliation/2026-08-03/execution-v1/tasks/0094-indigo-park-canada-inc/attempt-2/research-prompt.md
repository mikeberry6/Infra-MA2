# INDIGO Park Canada — Phase 1 PortCo boundary decision

Research **INDIGO Park Canada Inc.** as of **2026-08-16** for **Argo Infrastructure Partners**. Treat all supplied facts as claims. This is a PortCo-list decision, not a scorecard.

Repo state: INDIGO Park Canada is separately published with two active Argo rows dated 2025. LAZ Parking is separately published as Argo's manager-level platform. Official 2025 releases say LAZ acquired 60% of INDIGO Park Canada and INDIGO Group retained 40%.

Rule: count a manager-level platform once; exclude a subsidiary/bolt-on beneath it. Do not merge distinct legal entities. If INDIGO remains a distinct active LAZ subsidiary, archive only its standalone PortCo record, preserve the acquisition on LAZ, and retain accurate indirect ownership context without inventing an Argo exit.

Open direct pages and search current ownership plus later sale/exit/rebrand/pending transactions. Establish:

- legal identity, official site, headquarters and active operations;
- whether July 1, 2025 was announcement, closing, or both; LAZ 60% / INDIGO 40%;
- whether Argo exposure is only through LAZ and the disclosed Argo vehicle;
- LAZ-versus-INDIGO platform boundary;
- whether either duplicate-looking Argo row should remain;
- any later ownership change through the as-of date.

Start with:

- https://www.lazparking.com/our-company/about/news/2025/07/01/laz-parking-acquires-majority-stake-in-indigo-park-canada
- https://www.group-indigo.com/wp-content/uploads/2025/07/20250701-Press-Release-INDIGO-Group-forges-strategic-partnership-with-LAZ-Parking-in-Canada.pdf
- https://www.park-indigo.ca/en/
- https://www.group-indigo.com/en/press/press-release/indigo-group-s-a-2025-annual-results/
- https://www.lazparking.com/our-company/about/news/2022/01/03/laz-parking-announces-a-long-term-investment-from-argo-infrastructure-partners

Use web research only; do not use personal-context or code tools. Return one complete minified fenced `json` object, then one Markdown bullet. Maximum **2,200 characters**. Completeness beats detail: use short strings, `null`, or `[]`; never truncate. At most 3 milestones, 5 evidence rows and 5 changes.

```json
{"asOfDate":"2026-08-16","requestedCompany":"INDIGO Park Canada Inc.","requestedManager":"Argo Infrastructure Partners","decision":"VERIFIED_NO_CHANGE|PROPOSED_CORRECTION|EXCLUDED|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identity":{"canonicalName":"","aliases":[],"website":null,"headquarters":null,"country":"Canada","boundary":"","isLegalDuplicate":false},"ownership":{"directOwners":[],"argoBasis":"","repoOwnerAction":"","pending":[]},"operations":{"sector":"TRANSPORTATION","subsector":"","status":"ACTIVE","description":"","footprint":"","scale":[]},"transactionCheck":{"announcement":"","closing":"","laterExitSearch":""},"milestones":[],"evidence":[],"changes":[],"unresolved":[],"listAction":""}
```

Direct-owner rows: `owner`, `stake`, `entryDate`, `state`. Evidence rows: `label`, `url`, `purpose`, `tier`, `working`, `primary`; exactly one `primary:true`. Use `NOT_PUBLICLY_DISCLOSED` for noncritical gaps. The bullet must state whether INDIGO remains a standalone manager-level PortCo.
