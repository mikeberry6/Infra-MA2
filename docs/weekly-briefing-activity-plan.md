# Weekly Briefing Activity Classification and Stacked-Bar Plan

- **Status:** Implementation plan; July 25–31 issue-level preview implemented
- **Applies to:** `/weekly-briefing`, weekly email YTD charts, and any later fund-activity analytics
- **Snapshot date:** August 7, 2026

## Outcome

The application now has an app-native Weekly Briefing view sourced from the immutable July 31 email. The first chart implementation uses the 20 reviewed cards in that issue: 14 direct investments and 6 portfolio-level activities. The historical email remains unchanged.

The published YTD bars should not be split yet. Their control total is 378 deals, while the current local seed produces 388 deals through July 31 and the configured database currently produces 352. The HTML-to-seed parser also loses transaction-side and acting-entity detail on compound labels. Publishing a YTD split from either source would create unsupported counts.

## Classification standard

Every published transaction must have one reviewed primary classification for sector and region deal-count charts:

- **Direct investment:** the infrastructure fund, manager, advised vehicle, or acquisition SPV is the economic transacting principal. This includes acquisitions of companies or asset portfolios, minority investments, exits, IPOs, new platforms, and fund-led joint ventures.
- **Portfolio-level activity:** an already-owned operating company or platform is the legal buyer, seller, or joint-venture actor; the infrastructure sponsor supplies the ownership lineage that makes the activity eligible for coverage.
- **Unclassified:** temporary migration state only. It must remain visible in internal QA and must be zero before a finalized two-segment chart is published.

Interpretation rules:

- A direct acquisition of an asset *portfolio* is still Direct; the word "portfolio" is not classification evidence.
- A fund acquiring a company is Direct even though the target becomes a portfolio company after closing.
- A platform's later bolt-on is Portfolio-level.
- A same-announcement platform formation plus seed acquisition is normally Direct; later acquisitions by that platform are Portfolio-level.
- An ownership relationship must have been active on the transaction's disclosure date.
- Compound buyer/seller announcements require side-by-side review. If they contain genuinely separate transactions, split them into separate deal records rather than forcing a misleading classification.

## Canonical data design

For the weekly sector and region charts, add a reviewed primary classification to each deal, with provenance:

```prisma
enum DealActivityScope {
  DIRECT
  PORTFOLIO_COMPANY
  UNCLASSIFIED
}

model DealActivityClassification {
  dealId            String            @id
  deal              Deal              @relation(fields: [dealId], references: [id])
  primaryScope      DealActivityScope @default(UNCLASSIFIED)
  actingEntityName  String?
  actingCompanyId   String?
  evidenceSourceId  String?
  reviewNote        String?
  reviewedAt        DateTime?
  reviewedBy        String?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
}
```

Keep `actingEntityName` even when `actingCompanyId` is null because the portfolio database does not yet contain every historical actor.

If the same split is later used in **Top fund activity**, add a separate per-manager, per-side attribution table. A single deal-level flag is insufficient there because one transaction can be direct for one sponsor and portfolio-level for another. Each attribution should be unique by deal, manager, and buyer/seller side so multi-category deals are not double-counted.

Future weekly cards should carry machine-readable attributes such as `data-activity-scope`, `data-acting-entity`, and `data-activity-review-status`. The visible metadata and overview remain the editorial source users read; these attributes make later aggregation deterministic.

## Historical reconciliation plan

### 1. Freeze the 378-deal publication universe

Create a diffable manifest keyed by canonical deal ID and source URL. Reconcile it to all July 31 controls before classification begins:

- sector totals: Power & ET 149, Digital 71, Transportation 68, Social Infra 36, Utilities 33, Midstream 21;
- region totals: North America 152, Europe 151, Asia-Pacific 55, Latin America 15, Middle East & Africa 5;
- sector and region grand totals must both equal 378;
- every included record must have one primary source and one non-duplicated identity.

Use the July 17 published control, the July 18–24 issue, and the finalized July 25–31 issue as sequential checkpoints. Resolve additions, removals, duplicates, and date differences explicitly; do not make the current seed or database authoritative merely because it is newer.

### 2. Generate candidates, not conclusions

Create a dry-run audit that proposes a scope, acting entity, evidence excerpt, source URL, and confidence. Strong candidate signals include:

- explicit "Portfolio Company Acquisition," "Portfolio Company Divestiture," or equivalent card metadata;
- a named portfolio company in `via [company]` text;
- primary-source wording that names a sponsor-backed company as the buyer or seller;
- a date-valid ownership-period match;
- a Bolt-On category, used as a review prompt rather than automatic proof.

The absence of a portfolio-company signal must never silently default a record to Direct.

### 3. Review primary sources

Review each candidate against the cited primary source and record:

- legal/economic transacting entity;
- sponsor and ownership vehicle;
- ownership validity on the disclosure date;
- primary scope and concise rationale;
- reviewer and review timestamp.

Route platform formations, IPOs, joint ventures, recapitalizations, sponsor exits, and mixed acquisition/divestiture announcements to a second review pass.

### 4. Apply safely

Maintain the reviewed classifications in a sidecar manifest rather than rewriting hundreds of existing deal objects. The apply command should:

- default new or unmatched records to `UNCLASSIFIED`;
- show creates, updates, conflicts, and expected control totals in dry-run mode;
- verify an expected input hash before mutation;
- apply transactionally and preserve an audit artifact;
- require the project's protected approval before any production schema or data write.

### 5. Enforce publication gates

The YTD chart can cut over only when:

- every one of the 378 deals has a reviewed primary scope;
- Direct + Portfolio-level equals each sector and region row total;
- `UNCLASSIFIED = 0` for the published view;
- sector and region grand totals both equal 378;
- all portfolio-level rows name an acting entity and retain supporting evidence;
- no deal has conflicting classification records.

## Replacement stacked-bar concept

Use an **absolute stacked bar**, not a 100%-normalized bar:

- the filled length remains `row total / leading row total`, preserving the current magnitude ranking;
- within that filled length, Direct appears first and Portfolio-level second in a fixed order;
- segment width is `segment count / leading row total`, not `segment count / row total`;
- Direct uses Guggenheim purple `#442142`;
- Portfolio-level uses the darker, accessible brand gold `#8F7C4D`;
- Unclassified uses neutral gray in internal review views only;
- the total stays right-aligned, with visible `N direct · N portfolio` text under each bar;
- one shared legend serves the sector and region charts;
- every row has an accessible label containing the row name, total, and both segment counts.

Keep rows in descending total-count order and retain the briefing's fixed tie-break rules. Use email-compatible nested presentation tables and inline widths in the Outlook artifact; use the same arithmetic and labels in the app-native React view. Do not use SVG, gradients, or a second visual encoding for transaction category in the same stack.

## Rollout

1. **Now:** show the reviewed 20-deal July 25–31 split as an app-native preview; preserve the published 378-deal total-only bars.
2. **Universe reconciliation:** produce and approve the exact 378-record manifest.
3. **Classification backfill:** review all records, resolve mixed cases, and reach zero Unclassified.
4. **Web cutover:** replace the app-native YTD total bars with the two-segment absolute stacks.
5. **Email cutover:** generate equivalent nested-table stacks and validate in Outlook, Gmail, and mobile clients.
6. **Optional tracker cutover:** use per-manager/per-side attribution to replace transaction-category segments in Top fund activity without double-counting multi-category deals.

## QA checklist

- Unit-test reconciliation, ordering, tie breaks, segment arithmetic, and zero-total behavior.
- Test the July 31 frozen snapshot at 20 deals, with a 14 Direct / 6 Portfolio-level split.
- Add parser fixtures for the GSAM/RWE, MSIP/QIC, CPP/CIP, ArcLight/REC Power, and Exolum/SeaSeaS cases.
- Verify the recreated issue retains 20 cards, 20 Source links, section counts 7/4/4/3/2, exactly two Key Themes paragraphs, and the original 378-deal YTD controls.
- Render at 320, 375, 600, and desktop widths; ensure no new page-level overflow and keep week navigation horizontally scrollable.
- Verify keyboard focus, non-color labels, screen-reader row summaries, and at least 3:1 visual contrast for chart segments.
- Preserve `public/email-format/2026-07-31.html` byte-for-byte unless the user separately requests a historical email revision.
