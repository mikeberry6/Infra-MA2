# August 7 publication QA

Status: **IN REVIEW — evidence-backed preview rendered; human record approval and Outlook desktop QA remain**

Complete these checks after all record and publication gates pass and before
advancing the approved-edition index.

- [ ] `npm run weekly:activity:validate -- --edition 2026-08-07` exits cleanly.
- [x] Render dry run confirms that only the delimited YTD block changes; the
      protected non-chart hash still matches the frozen input.
- [ ] Render with the explicit `--write` flag.
- [x] Confirm the sector and region grand totals independently reconcile to
      285 Direct + 117 Portfolio-company = 402 legally distinct transactions.
- [x] Confirm every row is descending by total and each filled width is
      `round(row total / leading total * 100)`.
- [x] Confirm purple Direct plus gold Portfolio widths equal the filled width
      in every row.
- [x] Inspect the exact preview HTML at 320px, 375px, 600px, and 1024px
      desktop width. The chart and legend fit at each width; 375px, 600px, and
      desktop have no horizontal overflow. At 320px the chart itself fits at
      269.4px; the unchanged historical email body retains 31px of pre-existing
      page overflow outside the chart block.
- [ ] Copy/paste the exact rendered email into Outlook desktop without editing
      the source artifact.
- [ ] Send the Outlook draft to the reviewer and inspect the received desktop
      and mobile messages.
- [ ] Record reviewer, timestamp, Outlook version, and screenshots below.
- [ ] Copy `outlook-qa-approval.template.json` to
      `outlook-qa-approval.json`, bind it to the approved manifest and exact
      rendered-email hashes, and have the named human reviewer attest every
      required viewport and Outlook check.
- [ ] Run the approved-index advance command first as a dry run, then with
      `--qa audits/weekly-briefing-activity/2026-08-07/outlook-qa-approval.json`;
      add `--write` only after the send-to-self test passes.

## Evidence log

- 2026-08-09 automated browser inspection of
  `preview/2026-08-07.html`:
  - 320px: chart/legend 269.4px; stacked bars, labels, totals, and footer remain
    legible.
  - 375px: chart/legend 293px; document width exactly 375px.
  - 600px: chart/legend 518px; document width exactly 600px.
  - 1024px: chart/legend 518px and centered; document width exactly 1024px.
  - All 11 displayed rows allocate exactly 100 integer width points across
    Direct, Portfolio-company, and unfilled remainder segments.
- Pending: named human record approvals, independent second approvals for the
  15 verified exception records, Outlook desktop copy/paste, and Outlook
  send-to-self inspection.
