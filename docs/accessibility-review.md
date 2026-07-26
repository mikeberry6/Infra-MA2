# InfraSight Accessibility Review Procedure and Record

**Document state:** procedure and blank record template only. It does not attest that a human accessibility review has occurred.

## Purpose and conformance target

Use this procedure for the quarterly accessibility review and before a production release that materially changes navigation, forms, filters, tables, dialogs, drawers, authentication, or administrative workflows. The target is WCAG 2.2 Level AA across public and authenticated administration routes.

A release may record automated checks and a human review separately. Passing Playwright or axe does not establish WCAG conformance, replace keyboard-only review, or authorize a reviewer to mark the human-attestation fields complete.

## Evidence boundaries

### Automated evidence

The Release Gate can provide repeatable evidence for:

- axe rules tagged for WCAG A/AA on populated and no-result public routes, authenticated administration surfaces, mobile filters, loading/error/retry states, provider failures, invalid login, not-found, and import warning/error previews;
- body- and document-level horizontal overflow at 320, 390, 640, 768, 1280, and 1440 CSS pixels, including authenticated administration list and create-form surfaces;
- automated WCAG text-spacing stress on all primary public and authenticated administration routes;
- keyboard mechanics for navigation, filters, every drawer type, bidirectional focus wrapping, effective background inertness, Escape dismissal, and exact trigger restoration;
- accessible live-region semantics for route loading and error boundaries;
- reduced-motion behavior;
- deterministic representative public-route visual snapshots at the five required widths.

The authoritative record is the report artifact produced for the exact release Git SHA. A report from an older commit is historical context, not release evidence.

### Human evidence

A named human reviewer must still evaluate:

- whether focus order follows the visual and task sequence;
- whether focus indicators are visible, sufficiently contrasted, and not obscured;
- whether labels, instructions, errors, status messages, and accessible names are understandable in context;
- whether content remains usable with keyboard only, zoom, text spacing, and reflow;
- whether contrast is acceptable for text, controls, states, charts, and meaningful non-text graphics;
- whether dynamic updates, dialogs, drawers, validation, and destructive confirmations are announced and operable;
- whether the experience is understandable with a representative screen reader;
- whether any automated exception is a true false positive and has documented evidence.

## Review prerequisites

1. Review an immutable preview built from the proposed release SHA.
2. Use an isolated non-production database and a dedicated administrator account for authenticated workflows.
3. Record browser, operating system, viewport, zoom, assistive technology, release SHA, preview URL, date, and reviewer.
4. Confirm the exact-SHA Release Gate reports are available. Do not copy a result from a different commit.
5. Use realistic published data and safe draft fixtures. Do not mutate production data.
6. Disable browser extensions that alter page styles or keyboard behavior unless the extension itself is under test.

## Required route and state matrix

Review each applicable route in its default, populated, empty, loading, error, validation-error, and permission-denied states. Record `N/A` only with a reason.

| Area | Required routes or states |
| --- | --- |
| Primary navigation | `/tracker`, `/dashboard`, `/news`, `/earnings`, `/search`; desktop and mobile menu |
| Public databases | `/tracker`, `/funds`, `/portfolio`; search, filters, active chips, sort, pagination, empty results, deep-linked drawer |
| Public supporting routes | `/search`, `/news`, `/dashboard`, `/earnings`, `/login`; loading, empty, failed, and retry states where supported |
| Drawers and sheets | Deal, Fund, and Company details; mobile Filters sheet; loading, error, retry, close, and browser-history behavior |
| Administration | `/admin`, list pages, create forms, sources, dashboard signals, audit, and users |
| Authenticated workflows | Login, import preview, validation/error report, explicit commit confirmation, publish/archive/delete confirmation, and export authorization |

Responsive and zoom review must include:

- 320, 390, 640, 768, 1280, and 1440 CSS-pixel viewport widths;
- the 640 CSS-pixel viewport as an automated 200%-equivalent reflow check for a 1280-pixel layout;
- 200% browser zoom for general usability;
- 400% zoom or an equivalent 320 CSS-pixel reflow check for content that must reflow;
- increased text spacing using the WCAG text-spacing values;
- portrait mobile orientation and at least one desktop viewport.

## Keyboard-only procedure

Do not use a mouse, trackpad, touchscreen, or browser accessibility tree to complete this section.

1. Start at the browser chrome and press `Tab` into the page.
2. Verify any skip mechanism appears on focus, works, and lands at the intended main content.
3. Traverse the page in both directions using `Tab` and `Shift+Tab`.
4. Confirm every interactive control is reachable, focus order matches the task sequence, and no focusable content is hidden or inert.
5. Confirm every focus indicator remains visible and is not fully obscured by sticky headers, drawers, sheets, or cookie/tool overlays.
6. Operate links and buttons with `Enter`; operate native selections, checkboxes, and expected composite controls with their documented keyboard keys.
7. Open the mobile navigation, Filters sheet, and each record drawer. Confirm:
   - focus moves into the overlay;
   - focus remains trapped while the modal overlay is open;
   - background content cannot be operated;
   - `Escape` closes the overlay;
   - focus returns to the exact trigger;
   - closing updates URL state and browser Back/Forward restores the expected state.
8. Exercise search, filter, chip removal, sort, pagination, and direct drawer links. Confirm URL-addressable state does not strand focus.
9. Submit each public or administrative form empty and with invalid data. Confirm errors are associated with fields, summarized or focused appropriately, understandable, and do not rely on color alone.
10. Exercise import preview without committing. Confirm creates, updates, unchanged rows, warnings, and errors can be understood before the explicit confirmation step.
11. Exercise a safe draft mutation in the isolated environment. Confirm confirmation controls, completion status, and audit link are keyboard reachable and understandable.
12. Repeat representative journeys with reduced motion enabled.

Stop and record a blocker if keyboard focus disappears, becomes trapped outside an intended modal, reaches background content behind a modal, or cannot operate a required action.

## WCAG 2.2 AA manual checks

Use the following prompts in addition to the keyboard procedure:

- Structure: one descriptive page-level heading, coherent heading order, appropriate landmarks, meaningful link text, and correct table headers.
- Names and instructions: visible labels match accessible names; required formats and constraints appear before submission; status and error content is programmatically exposed.
- Contrast: normal text at least 4.5:1, large text at least 3:1, and meaningful controls, focus indicators, states, and graphics at least 3:1 against adjacent colors.
- Reflow and spacing: no loss of information or operation at required zoom/reflow; author styles tolerate WCAG text spacing; intentional data-table scrolling remains local rather than creating body overflow.
- Focus: visible, logical, not obscured, and sufficiently distinguishable; sticky content does not cover the active control.
- Pointer alternatives: controls do not depend on dragging or multipoint gestures; targets meet the WCAG 2.2 minimum target-size requirement or a documented exception.
- Authentication: password managers and paste remain usable; the flow does not require an unsupported cognitive-function test.
- Motion and timing: reduced-motion preference is respected; time limits and auto-updates can be understood and controlled where applicable.
- Dynamic content: loading, success, empty, failure, retry, and validation states are announced without unexpected focus movement.
- Color and charts: meaning is available without color alone; ranking bars, availability states, tags, and status indicators retain readable labels.

## Representative screen-reader smoke test

At minimum, use VoiceOver with Safari on macOS or NVDA with Firefox/Chrome on Windows and record the combination used.

1. Navigate by landmarks and headings.
2. Review the primary and secondary navigation names and current-page state.
3. Operate one public database search/filter/pagination journey.
4. Open and close each drawer type; verify dialog name, reading order, loading/error announcement, and focus return.
5. Submit the login form with an error.
6. As an isolated administrator, review one create form and one import preview.
7. Confirm tables expose useful headers and row actions have unambiguous names.

## Finding severity and release policy

| Severity | Definition | Release treatment |
| --- | --- | --- |
| Blocker | A required task cannot be completed with keyboard or assistive technology; focus is lost/trapped; critical content is unavailable | Must be fixed before release |
| High | WCAG A/AA failure with broad or material impact | Must be fixed before release unless a time-bounded exception is approved by Engineering and the accessibility owner |
| Medium | Localized WCAG failure with a viable workaround | Fix before release when practical; otherwise assign owner, deadline, and approved exception |
| Low | Usability improvement or best-practice issue not known to fail the target | Track with owner and priority |

Every exception must identify the success criterion, affected route/state, user impact, workaround, owner, deadline, approver, and retest date. “axe passed” is not a valid exception rationale.

---

# Review Record

Leave the status as **Not performed** until the named human reviewer completes the procedure.

## Identity

- Status: **Not performed**
- Release Git SHA:
- Preview URL:
- Review date/time (UTC):
- Reviewer:
- Reviewer role/team:
- Independent verifier:
- Browser and version:
- Operating system:
- Keyboard/layout:
- Screen reader and version:
- Automated Release Gate run:
- Playwright/axe/visual artifact names:

## Automated evidence

| Check | Exact-SHA artifact or job | Result | Notes |
| --- | --- | --- | --- |
| Public axe WCAG A/AA scan |  | Not recorded |  |
| Authenticated admin axe WCAG A/AA scan |  | Not recorded |  |
| Public responsive overflow matrix |  | Not recorded |  |
| Authenticated admin responsive overflow matrix |  | Not recorded |  |
| Public/admin WCAG text-spacing stress |  | Not recorded |  |
| Keyboard/focus browser journeys |  | Not recorded |  |
| Loading/empty/error/provider/validation states |  | Not recorded |  |
| Reduced-motion journey |  | Not recorded |  |
| Representative five-width visual snapshots |  | Not recorded |  |

## Human route matrix

Use one row per route and material state. Add rows as needed.

| Route/state | Width/zoom | Keyboard | Focus visible/order | Reflow/spacing | Contrast | Screen reader | Result | Finding IDs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  | Not reviewed | Not reviewed | Not reviewed | Not reviewed | Not reviewed | Not reviewed |  |

## Workflow observations

- Skip link and landmarks:
- Primary/mobile navigation:
- Database search/filter/sort/pagination:
- Mobile Filters sheet:
- Deal/Fund/Company drawers:
- Login and authentication:
- Administrative forms and validation:
- Import preview/confirm/error report:
- Destructive confirmation and audit trail:
- Loading/empty/failure/retry states:
- Zoom, reflow, and text spacing:
- Reduced motion:
- Screen-reader smoke test:

## Findings

Duplicate this block for each finding.

- Finding ID:
- Severity:
- WCAG 2.2 success criterion:
- Route/state:
- Viewport/zoom/assistive technology:
- Reproduction steps:
- Expected result:
- Actual result and user impact:
- Evidence attachment:
- Owner:
- Target date:
- Fix pull request:
- Retest result/date/reviewer:
- Exception approver and expiry, if applicable:

## Human attestation

- Keyboard-only procedure completed: No
- WCAG 2.2 AA manual checks completed: No
- Representative screen-reader smoke test completed: No
- All blocker/high findings resolved: No
- Approved exceptions:
- Overall result: **Not attested**
- Reviewer name/sign-off:
- Independent verifier name/sign-off:
- Sign-off date (UTC):

This record becomes a human accessibility attestation only after all applicable fields are completed, evidence is linked to the exact release SHA, unresolved findings are dispositioned, and both sign-off lines are populated.
