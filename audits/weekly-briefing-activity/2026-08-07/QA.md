# August 7 publication QA

Status: **PUBLISHED VIA USER-AUTHORIZED WAIVER — OUTLOOK DESKTOP QA NOT PERFORMED**

The standard human-review and Outlook desktop gates below were not completed.
The user explicitly authorized their waiver for this edition. The committed
waiver records that exception without asserting that any omitted check passed.

- [x] Standard validation returns the exact waived issue set and nothing else:
      404 missing first reviews, 15 missing second reviews, one unapproved
      manifest finding, and one unset-final-control finding.
- [x] Render dry run confirms that only the delimited YTD block changes; the
      protected non-chart hash still matches the frozen input.
- [x] Render the deterministic chart block into the public August 7 email.
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
- [ ] Copy/paste the exact rendered email into Outlook desktop. **Not
      performed; explicitly waived.**
- [ ] Send the Outlook draft to self and inspect the received desktop and
      mobile messages. **Not performed; explicitly waived.**
- [ ] Record Outlook version and screenshots. **Not performed; explicitly
      waived.**
- [x] Commit `user-authorized-publication-waiver.json`, bound to the unchanged
      manifest, exact validation findings, protected non-chart hash, and exact
      rendered-email hash.
- [x] Advance the approved-edition index with a hash-bound
      `USER_AUTHORIZED_WAIVER` entry and verify August 7 resolves as latest.

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
- Not performed: named record approvals, independent second approvals for the
  15 verified exception records, Outlook desktop copy/paste, and Outlook
  send-to-self inspection. These remain visibly absent rather than being
  represented as completed attestations.
