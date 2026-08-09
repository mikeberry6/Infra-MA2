# August 7 publication QA

Status: **BLOCKED — manifest is not approved and charts have not been rendered**

Complete these checks after all record and publication gates pass and before
advancing the approved-edition index.

- [ ] `npm run weekly:activity:validate -- --edition 2026-08-07` exits cleanly.
- [ ] Render dry run reports that only the delimited YTD block changes.
- [ ] Render with the explicit `--write` flag.
- [ ] Confirm the sector and region grand totals independently match the final
      manifest control.
- [ ] Confirm every row is descending by total and each filled width is
      `round(row total / leading total * 100)`.
- [ ] Confirm purple Direct plus gold Portfolio widths equal the filled width
      in every row.
- [ ] Inspect the exact email HTML at 320px, 375px, 600px, and desktop width.
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

Pending human QA.
