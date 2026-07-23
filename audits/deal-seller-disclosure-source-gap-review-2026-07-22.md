# Deal Seller-Disclosure Source-Gap Review — 2026-07-22

> **REVIEW-ONLY CONTROL:** Every item in this document is **PENDING RESEARCH REVIEW**. This document records evidence and questions; it does not select `NOT_DISCLOSED` or `NOT_APPLICABLE`, approve a named seller, authorize a seed/database mutation, or approve publication. Do not copy a proposed decision from this document into an approval artifact without an identified Research reviewer independently evaluating the complete record.

## Scope and exact validation provenance

The hosted validation for Draft PR [#223](https://github.com/mikeberry6/Infra-MA2/pull/223), branch head `c946a5a223254527ebbb3103fc5dc34376758c80` and GitHub-tested PR merge commit `413f54a4b36ef702190e9f9b56ed8e15df0ba201`, generated a neutral seller-disclosure template in [CI run 29958426586](https://github.com/mikeberry6/Infra-MA2/actions/runs/29958426586). The template:

- was generated at `2026-07-22T21:25:16.928Z` from the isolated validation database;
- contains 194 published deals with no seller participant and no reviewed missing-seller treatment;
- has exact file SHA-256 `27a33a065c128e30cc015cd54ee8eef20a7aa403785083c21e6eb310b1ed85e9`;
- leaves every `decisionStatus` and `decisionReason` null; and
- contains three records with no source evidence in their generated snapshots: `INF-2026-080`, `INF-2026-082`, and `INF-2026-088`.

This review is intentionally limited to those three zero-source seller items. The broader primary-citation review remains in [Primary Citation Source-Gap Review — 2026-07-22](primary-citation-source-gap-review-2026-07-22.md). `INF-2026-095` (DTG Recycle) is not a seller-template item because its database snapshot already has a seller participant, but its unresolved primary-citation gap is noted below because it arose in the same source search.

## Review register

| Record | Generated snapshot | Best seller-treatment evidence | Record-level issue to resolve first | Decision status |
|---|---|---|---|---|
| `INF-2026-080` — Reload | Acquisition; no seller; no sources | Issuer release confirms Scale acquired Reload but names no seller | Confirm event date and add the reviewed primary citation | **PENDING RESEARCH REVIEW** |
| `INF-2026-082` — Andion CH4 Renewables | Minority acquisition; no seller; no sources | Target, investor, and adviser describe company financing plus existing-shareholder equity, not an acquisition | Correct or quarantine unsupported transaction semantics before deciding seller treatment | **PENDING RESEARCH REVIEW** |
| `INF-2026-088` — Ori Industries | Buyout/platform launch; no seller; no sources | Target/platform and target adviser describe an all-equity merger in which Ori investors continue in the combined platform | Correct or quarantine unsupported buyout, stake, and valuation semantics before deciding seller treatment | **PENDING RESEARCH REVIEW** |

## INF-2026-080 — Reload

### Snapshot identity

- Deal ID: `cmnva4a1u05gmm8lzmc1fsnha`
- Snapshot SHA-256: `9d52ec058920580e1b68f7d4fb8885f4508c57a05e1dd878c5b8a22ebb8bb922`
- Stored title: `EQT Infrastructure acquires Reload via Scale Microgrids (bolt-on)`
- Stored event: `2026-02-28`, `CLOSED`, `ACQUISITION_BOLT_ON`
- Stored participant: buyer `EQT Infrastructure (via Scale Microgrids)`; no seller participant
- Stored seller treatment: `LEGACY_UNREVIEWED`; no reason
- Sources in generated snapshot: 0

### Evidence

- **Primary transaction source:** [“Scale Acquires Reload to Accelerate Power Delivery for the Next Generation of Data Centers”](https://www.businesswire.com/news/home/20260223451115/en/Scale-Acquires-Reload-to-Accelerate-Power-Delivery-for-the-Next-Generation-of-Data-Centers) — release issued by Scale through Business Wire, February 23, 2026. [Scale's corporate mirror](https://www.scalemicrogrids.com/blog/scale-acquires-reload-to-accelerate-power-delivery-for-the-next-generation-of-data-centers) is dated February 24, 2026.
- Scale says it acquired Reload and that the transaction was backed by a material EQT capital commitment. The release names advisers to Reload, Scale, and EQT but does not name a seller or selling shareholder and does not expressly state that the seller was undisclosed.
- Reload's current website says it was backed by Eclipse and Tamarack Global, while [Tamarack's investment page](https://www.tamarackglobal.com/investments) marks Reload as acquired by Scale. Those ownership facts do not establish that Eclipse, Tamarack, Reload, or its founders were the legal seller.

### Reviewer questions

1. Should the Business Wire issuer release or Scale corporate mirror become the approved primary citation?
2. Which event date follows the repository's convention: the February 23 issuer-wire date or February 24 corporate-page date? The stored February 28 date is unsupported by these sources.
3. After citation and date review, does the evidence support a reviewed missing-seller treatment? Do not infer a named seller from historical ownership.

The evidence supports the transaction identity and buyer with high confidence. Actual seller identity remains unsupported. No seller-disclosure decision is made here.

## INF-2026-082 — Andion CH4 Renewables

### Snapshot identity

- Deal ID: `cmnva4a7e05gom8lzb02iag4b`
- Snapshot SHA-256: `f4019a0fb861bc90fc1ad154f1e84396602ab08d758f7c95b1753e6280c7fab7`
- Stored title: `Equitix leads growth equity investment in Andion CH4 Renewables`
- Stored event: `2026-02-28`, `CLOSED`, `ACQUISITION_MINORITY_STAKE`
- Stored participant: buyer `Equitix`; no seller participant
- Stored seller treatment: `LEGACY_UNREVIEWED`; no reason
- Sources in generated snapshot: 0

### Evidence

- **Primary target source:** [“Goldman Sachs Alternatives Backs Andion CH4 With €67 Million Private Credit Facility”](https://andionch4.com/goldman-sachs-alternatives-backs-andion-ch4-with-e67-million-private-credit-facility/) — Andion CH4 Renewables, February 23, 2026.
- **Primary investor source:** [“Equitix welcomes financing partnership to support Andion's European biomethane growth”](https://equitix.com/news/equitix-welcomes-financing-partnership-to-support-andions-european-biomethane-growth/) — Equitix, February 25, 2026.
- **Transaction-adviser corroboration:** [“GSK Stockmann advises Andion CH4 Renewables on a combined EUR 67 million debt financing”](https://gsk-lux.com/wp-content/uploads/2026/02/20260224_Press-release_Andion-CH4-Renewable.pdf) — GSK Stockmann, February 24, 2026.
- All three sources describe a Goldman Sachs private-credit facility and an equity contribution by Andion's existing shareholders led by Equitix. Andion and Equitix both state that Equitix had already supported the company for years. None describes a share sale, secondary transfer, new Equitix acquisition, or seller.

### Reviewer questions

1. Should this row remain a deal-database transaction, and if so, which financing/category semantics accurately represent it?
2. Should the buyer participant be represented as an existing-shareholder equity contributor, and should Goldman Sachs be represented as a financing counterparty rather than a buyer?
3. Which source and event date should be primary under the repository convention?
4. Only after the transaction model is corrected or explicitly retained: is a missing-seller treatment applicable to this financing event?

The public record strongly contradicts the current minority-acquisition framing. A reviewer should not resolve the seller field in isolation while leaving the unsupported acquisition model intact. No seller-disclosure or row-correction decision is made here.

## INF-2026-088 — Ori Industries / Radiant

### Snapshot identity

- Deal ID: `cmnva4ao105gum8lzsxlaa4ph`
- Snapshot SHA-256: `b0b10f130e8b22e009224876be09601ff22ac8ffeba3f6b8a2e54881b6188055`
- Stored title: `Brookfield Asset Management launches Radiant AI infrastructure platform via Ori Industries acquisition`
- Stored event: `2026-02-28`, `CLOSED`, `ACQUISITION_BUYOUT` and `PLATFORM_LAUNCH`
- Stored participant: buyer `Brookfield Asset Management`; no seller participant
- Stored seller treatment: `LEGACY_UNREVIEWED`; no reason
- Sources in generated snapshot: 0

### Evidence

- **Primary platform/target source:** [“Brookfield Launches Radiant as first vertically integrated AI Infrastructure Company Through Merger with Ori Industries”](https://radiant.co/press-release-launch) — Radiant, February 24, 2026. Radiant calls the transaction a merger and says Ori's founder and CEO became Radiant's president.
- **Direct target-adviser evidence:** [“Eversheds Sutherland advises on merger of AI Cloud operator Ori Industries with Brookfield-owned Radiant”](https://www.eversheds-sutherland.com/en/global/news/merger-ai-cloud-operator-ori-industrieswith-radiant) — Eversheds Sutherland, February 24, 2026. Ori's legal adviser calls the transaction an all-equity combination with Brookfield and Ori's shareholders and says the structure allows Ori investors to continue with the combined platform.
- **Financial-adviser corroboration:** [“PwC Corporate Finance advises AI infrastructure and cloud platform Ori on its merger with Brookfield's Radiant”](https://www.pwc.co.uk/services/deals/recent-deals/pwc-advises-ai-infrastructure-cloud-platform-ori-merger-brookfields-radiant.html) — PwC UK, February 2026. PwC also describes a merger/integration rather than a cash exit or conventional buyout.
- These sources do not identify a conventional seller, sale proceeds, a 100% stake purchase, or the stored US$1.3 billion valuation. The legal-adviser source identifies Ori shareholders as continuing investors, not as sellers.

### Reviewer questions

1. Should this record be modeled as a merger/platform combination instead of a 100% acquisition buyout?
2. Should the unsupported `stake`, valuation, title, category, status, and February 28 date be removed, revised, or quarantined pending stronger evidence?
3. Which of the Radiant and direct-adviser sources should be primary and supporting citations?
4. Only after the transaction model is corrected or explicitly retained: how should seller treatment apply to an all-equity merger with continuing shareholders?

The evidence supports an all-equity merger with high confidence and does not support adding `Ori shareholders` as a seller. It leaves an editorial distinction between seller treatment for a merger and seller non-disclosure; no decision is made here.

## Related unresolved citation gap — INF-2026-095 (DTG Recycle)

DTG Recycle is outside this seller-template subset because the database already records a seller participant. The primary-source gap remains open:

- [Waste Connections' Q1 2026 Form 10-Q](https://www.sec.gov/Archives/edgar/data/1318220/000110465926047074/wcn-20260331x10q.htm) reports three aggregate, immaterial waste-business acquisitions but does not name DTG, Recovery 1, Macquarie, Dan Guimont, transferred locations, or transaction dates.
- [DTG's first-party company history](https://www.dtgrecycle.com/about-dtg/) says it streamlined operations in 2026 and refocused on hauling, but omits the transaction parties, transferred assets, and timing.
- No Macquarie 2026 exit announcement was located. Its [December 2022 acquisition release](https://www.macquarie.com/tw/en/about/news/2022/macquarie-asset-management-completes-acquisition-of-dtg-recycle.html) confirms that founder Dan Guimont retained an ownership stake at acquisition, but it does not prove a 2026 repurchase or settle the later transaction.
- [Waste Dive's report](https://www.wastedive.com/news/macquarie-exits-dtg-recycle-with-sales-to-founder-waste-connections/812150/) remains the only located source for the full split-sale narrative. It is a secondary source and reports that transaction parties declined or did not provide comment.

The official evidence partially corroborates a 2026 operational change but does not establish the full transaction. It must not be promoted to primary transaction confirmation.

## Required human-review sequence

1. Research reviews each source and records an independent disposition for the underlying row and primary citation. Citation approval does not approve all stored transaction facts.
2. If a source identifies a seller, add the seller through the reviewed editorial workflow and regenerate the neutral seller template. Do not encode a named seller as a missing-seller decision.
3. Correct or quarantine any unsupported transaction model before deciding its seller treatment, then rerun isolated validation so the new snapshot and SHA bind the decision to current evidence.
4. Research reviews every freshly generated seller item independently and supplies a specific evidence-based reason; no batch inference is allowed.
5. Commit only the completed canonical approval file at `audits/approvals/deal-seller-disclosures.json`. Apply it only through the exact-SHA, reviewer-matched, release-bound, serializable remediation path described in the release runbook.

This document itself is not an approval artifact and must never be passed to the apply command.
