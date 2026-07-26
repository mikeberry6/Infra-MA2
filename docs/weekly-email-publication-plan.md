# Weekly Infrastructure M&A Email — Research and Publication Playbook

- **Status:** Standing defaults and user preferences for future weekly email updates
- **Applies to:** `public/email-format/YYYY-MM-DD.html`
- **Last updated:** July 25, 2026

## Purpose

Use this playbook for future weekly infrastructure M&A emails from research through production publication. It records the operating decisions established while finalizing the July 18–24, 2026 edition. `AGENTS.md` remains authoritative for repository-wide rules; this document adds the weekly workflow and the user-directed editorial preferences that should persist across future issues. Explicit instructions for a later run override this playbook.

## Non-negotiable scope

- Start new issues from `public/email-format/template.html` and preserve the established Guggenheim purple/gold email style, compact card structure, mobile readability, and email-compatible table layout.
- Treat the weekly email as manually curated. Automated or model-generated results are candidate discovery, not publication authority.
- Do not modify `src/data/deals.ts`, Prisma seed data, source manifests, or database records during an email-only workflow unless the user explicitly asks.
- Do not rewrite a historical weekly email unless the user explicitly requests it.
- Preserve unrelated local changes. Stage, commit, and publish only files changed for the weekly workflow.
- Stop and ask the user if Google presents a CAPTCHA, login prompt, or account-verification challenge.

## End-to-end weekly workflow

### 1. Establish the issue

1. Confirm the inclusive seven-day target period and publish date.
2. Locate the issue at `public/email-format/YYYY-MM-DD.html`. Reconcile the existing draft when present; create it from `public/email-format/template.html` only when it does not exist. Never overwrite an existing draft or historical issue implicitly.
3. Create or update `outputs/gemini-weekly-workflow-YYYY-MM-DD_to_YYYY-MM-DD.md`.
4. Record the run timestamp and the exact Gemini batch-prompt template supplied for that run. Do not silently reconstruct or improve the prompt.

### 2. Run the 20 Gemini research batches

Use this section when the weekly request calls for the 20-batch Gemini workflow. The configuration below is the standing default established by the July 18–24 run until the user supplies a different batch structure, model, or prompt. Always use the target period in the current run's supplied prompt; never copy the July 18–24 dates into a later issue.

- Use the user's logged-in Google Gemini session in Chrome.
- Use **Gemini 3.1 Pro Deep Think / Pro Deep Think only**.
- Run 20 separate queries in 20 new Gemini chats, one chat per batch.
- Submit Batch 1 exactly as supplied.
- For Batches 2–20, copy the prompt verbatim and replace only the `Batch to Process` number.
- Do not rewrite, shorten, summarize, normalize, or otherwise alter the batch prompt.
- If Pro Deep Think is temporarily unavailable because of quota, wait until usage is restored rather than switching models.
- Wait for each response to complete before treating it as a finished batch.
- For every batch, save the full response, chat URL, model, completion state, and completion timestamp in the run note.
- Close only the Gemini tabs opened for the workflow, and only after their output and URL have been saved.

### 3. Consolidate in a new Gemini chat

1. Open one new Gemini chat after all 20 batches have completed.
2. Select **Pro Deep Think** and verify the mode before submission.
3. Use the exact consolidation prompt supplied for the run.
4. Append all 20 full batch outputs without summarizing or silently editing them.
5. Verify the staged prompt content before submitting, submit it once, and wait for completion.
6. Save the full consolidation response, chat URL, model, and completion timestamp in the run note.

The consolidation must return:

1. a short QA summary;
2. a qualifying-transactions table with announcement date, batch firm, firm role, target, deal type, sector, subsector, region/country, qualification trigger, inclusion rationale, and source URL; and
3. a separate rejected/watchlist table with a concise exclusion reason.

It must deduplicate overlapping findings, preserve every relevant batch firm involved in a duplicated transaction, and separate qualifying transactions from rejected/watchlist candidates. Its result is still subject to independent source QA.

### 4. Apply independent source QA

A transaction can be published only when all four gates pass:

1. **Infrastructure isolation**
   - Direct investment: an infrastructure strategy is explicitly named, or the asset is in a traditional infrastructure vertical.
   - Portfolio-company transaction: the transacting company should have verifiable infrastructure-fund ownership lineage. If direct vehicle proof is unavailable, it may still pass when credible official signs strongly indicate infrastructure ownership lineage and the rationale is documented. Standard private equity, buyout, growth, or credit ownership does not qualify.
2. **First formal announcement**
   - The first disclosure of a definitive/binding agreement, signed purchase agreement, scheme implementation deed, or previously undisclosed closing falls strictly inside the target period.
   - For an IPO, use the first trading day. Do not use filings, price ranges, placements, or other pre-IPO activity.
3. **Equity scope**
   - Include acquisitions, divestitures, exits, minority/majority stakes, growth investments, joint ventures, bolt-ons, and qualifying IPOs.
   - Exclude debt, refinancing, credit facilities, recapitalizations, bonds, fundraising, fund closes, and personnel announcements.
4. **Source support**
   - The linked source must support the parties, transaction, timing, and claimed scale.
   - Prefer official company/fund disclosures and stock-exchange filings, followed by major wire services and credible specialist reporting.

Reject prior-announced transactions, closings or regulatory updates to prior deals, rumors, unsupported claims, false positives, and items whose cited source does not prove the claimed transaction. Source-backed qualifying transactions may be retained even if Gemini omitted or rejected them.

The run note must preserve:

- candidates added to or retained in the briefing;
- candidates rejected and a concise reason;
- user-directed editorial removals, clearly distinguished from source-QA failures; and
- corrections made to transaction descriptions, lineage, dates, values, or sources.

### 5. Reconcile against the draft briefing

- Compare the independently vetted candidate set with the current weekly HTML.
- Add missing qualifying transactions.
- Remove candidates that fail any hard gate.
- Honor explicit user curation decisions even when a candidate is source-backed.
- Recalculate every dependent field after an addition or removal: total card count, section count labels, preheader, previous-editions comment, theme statistics, YTD sector counts, YTD region counts, and bar widths.
- Never change the weekly HTML count without reconciling the visible cards, source links, summaries, and YTD totals.

## Editorial assembly rules

### Section order

Order active sectors by current-week deal count, highest to lowest. Resolve ties in this fixed order:

1. Power & ET
2. Digital
3. Transportation
4. Utilities
5. Midstream
6. Social Infra

Omit zero-deal sectors. The preheader and previous-editions summary must list sectors in the same order.

### Deal order within a sector

Rank deals from largest to smallest, including within closely comparable subsectors:

1. disclosed economic size: transaction value, enterprise value, purchase price, committed equity, fund-interest size, or project financing;
2. physical scale when economics are unavailable: MW/MWh, portfolio footprint, route kilometers, customers, homes passed, fleet size, or platform breadth;
3. undisclosed or no-quantum deals last, unless public evidence clearly shows that the transaction represents a larger platform.

Store or maintain the validator's scale metadata on each deal card so the ordering is auditable.

### Deal-card copy

- Title: `{Target / Asset} | {infrastructure fund or fund manager only}`.
- Metadata: `{Sponsor} ({transaction type}) · {subsector} · {region/country}`.
- Overview: one concise paragraph, normally one or two sentences, stating what happened, who transacted, the relevant value or scale, and why the asset/platform matters.
- Source: one link labeled `Source`.
- Do not put portfolio companies, sellers, developers, or operating partners after the title pipe.
- Use restrained, factual language and consistent transaction labels.

## Key-themes style

The following are standing user-directed editorial preferences, not observations limited to the July 24 copy.

- Keep the themes succinct: normally two short paragraphs.
- Use the first paragraph for the strongest capital-deployment and valuation signals, not a catalogue of every deal.
- When U.S. transactions are present, use the second/final paragraph for named U.S. deployment across operating assets, platforms, and portfolio-company transactions.
- Do not append a generic European or non-U.S. roundup to the final paragraph unless the user explicitly requests it. Non-U.S. activity can be used selectively as contrast in the first paragraph.
- Bold only infrastructure fund or fund-manager names in theme body copy.
- Do not bold targets, transaction names, values, capacities, deal-count phrases, or entire clauses.
- In themes, abbreviate `billion` to `bn` and `approximately` to `~` (for example, `~US$7bn`, `US$1bn`, and `€5bn`).
- Redraft the themes after every material addition or removal; do not merely patch the old deal count.

## Canonical concise sponsor names

The user directed that future issues use concise infrastructure-manager names consistently across titles, metadata, themes, and overview copy. These are editorial display names, not permission to alter underlying database records.

| Long form | Weekly email display name |
| --- | --- |
| Global Infrastructure Partners | GIP |
| Energy Capital Partners | ECP |
| Ridgewood Infrastructure | Ridgewood |
| PSP Investments | PSP |
| Tiger Infrastructure Partners | Tiger Infrastructure |
| GCP Infrastructure Investments | GCP Infra |
| Blackstone Energy Transition Partners | Blackstone |
| Goldman Sachs Asset Management | GSAM |

Preserve already concise names such as Brookfield, Blackstone, Ontario Teachers, Mirova, La Caisse, TPG, KKR, and Actis. Add new abbreviations deliberately and use them everywhere in the issue once adopted.

## Footer and author photo

The visible placeholder is a standing user-directed layout preference for future issues.

- Preserve the author-signature layout at the end of the email.
- Keep a visible **72 × 72 px** light-gray (`#E5E7EB`) photo placeholder beside Mike Berry's signature until a real photo is supplied.
- The placeholder cell must remain visibly filled even when its image source is a transparent fallback.
- Use `alt="Photo placeholder"` for the fallback image.
- Do not rely on a transparent 1 × 1 image without a visible background; that makes the intended photo location disappear.

## Counts and YTD charts

- The visible number of deal cards must equal the issue total and the number of `Source` links.
- Recalculate affected YTD sector and region totals after every addition or removal.
- Sort both YTD tables in descending count order.
- Set the leading bar to `100%`.
- Set every other width to `round(count / leadingCount × 100)`.
- Confirm no lower-count row appears above a higher-count row.

## Validation gate

Run the deterministic validator with source-link checks:

```bash
npm run validate-weekly-email -- public/email-format/YYYY-MM-DD.html --check-links --max-links=80 --link-timeout-ms=5000 --link-budget-ms=30000
```

Run its Vitest suite:

```bash
npm test -- scripts/validate-weekly-email.test.ts
```

Before publication, also confirm:

- [ ] card count, issue total, section totals, and `Source` count agree;
- [ ] every retained transaction passes infrastructure, timing, equity, and source gates;
- [ ] rejected, removed, and false-positive names are absent;
- [ ] sector sections and preheader summaries use the correct weekly order;
- [ ] deals are ranked by economic or physical scale;
- [ ] YTD rows are sorted and widths are recalculated;
- [ ] theme copy follows the bolding and abbreviation rules;
- [ ] sponsor names use the canonical concise forms;
- [ ] all email tables and tags are balanced;
- [ ] desktop and mobile visual QA pass after content changes; and
- [ ] only intended files appear in the staged diff.

## GitHub and production publication

Perform this section only when the user has authorized publication, commit/push, deployment, or making the issue active on the website.

- As of July 25, 2026, `main` is protected: changes go through a pull request, the required strict `build` check must pass, conversations must be resolved, and linear history is enforced. Verify the current policy rather than assuming it is unchanged.
- The user-directed policy is **zero required approving reviews** for this publication workflow. Do not reintroduce an approval requirement unless the user explicitly asks, and do not silently mutate other branch protections.
- Create a narrowly scoped branch and commit only the weekly HTML, its run note, and any explicitly requested planning/documentation changes.
- Merge only after required checks pass and the user has authorized making the change live.
- Wait for the production Vercel deployment to complete.
- Verify the exact public URL:

  `https://infra-ma-2.vercel.app/Infra-MA2/email-format/YYYY-MM-DD.html`

- Do not assume a successful deployment updated that alias. Confirm the page contents at the exact URL. If it still points to an older production deployment, repoint `infra-ma-2.vercel.app` only when making the requested issue live is within the user's authorization, then verify again.

## July 18–24, 2026 decision record

The published baseline for `public/email-format/2026-07-24.html` is **11 deals and 11 sources**:

| Sector | Deals |
| --- | ---: |
| Power & ET | 7 |
| Utilities | 2 |
| Transportation | 1 |
| Social Infra | 1 |

The following candidates were explicitly removed from this historical issue and must not be reintroduced without a new user instruction:

| Candidate | Decision |
| --- | --- |
| Chargepoly | User-directed editorial removal |
| Atlantic Towing offshore division | User-directed editorial removal |
| Gabia | User-directed editorial removal |

Source QA also overrode Gemini candidates including Majis (prior announcement), Pembina Gas Infrastructure (prior-transaction update), Nicollin Environnement (prior announcement), and Carester (infrastructure-isolation failure). Burton Wold/Winscales Moor, Vena Energy KN Wind Power, the Altus/New Leaf Virginia community-solar portfolio, and OIL! Tankstellen were retained in the published reconciliation even where model consolidation was incomplete. That historical outcome is not a substitute for rechecking first-announcement timing and every other hard gate in future issues.

This decision record is historical. Future issues must apply the protocol to their own target period rather than copying the July 24 list or counts.

## Future-issue handoff

A weekly issue is complete only when:

1. when the 20-batch workflow was requested, all batches and the consolidation have finished and are recorded;
2. independent source QA is complete;
3. the HTML and run note agree;
4. editorial order, names, themes, footer, counts, and charts conform to this playbook;
5. automated and visual validation pass;
6. when publication was requested, the exact intended files are merged to `main`; and
7. when a live update was requested, the exact public URL serves the new issue.
