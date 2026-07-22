# InfraSight Governance

## Accountabilities

| Area | Responsible owner | Approval/accountability |
| --- | --- | --- |
| Taxonomy, citations, canonical merges, publication | Research | Research owner |
| Application code, migrations, security, tests, performance | Engineering | Engineering owner |
| Schedules, alerts, backups, releases, recovery exercises | Operations | Operations owner |
| Production release | Engineering + Operations | Required `production` environment reviewer |
| Canonical company merge | Research + Engineering | Research approves survivors; Engineering approves transaction/redirect plan |
| Ownership-to-fund link correction | Research + Engineering | Research confirms vehicle identity; Engineering approves the hash-bound link/unlink plan |
| Credential/access change | Operations + affected account owner | Two-person review for production secrets |

Automation may propose records but may not publish deals or portfolio companies. Every publish, archive, import, merge, or administrator mutation must have an audit event. Historical weekly emails remain unchanged without explicit user authorization.

## Operating cadence

### Weekly

- Review failed/stalled runs, stale providers, rolling success rate, current-week coverage, draft/review queue, missing/broken sources, and weekly-email validation.
- Assign every actionable failure an owner and due date.

### Monthly

- Review production and development dependency advisories, administrator/analyst access, deal/fund/company source coverage, `lastVerifiedAt` backlog, Vercel/database latency and route errors, real-user LCP/INP/CLS, and source/provider coverage.
- Confirm retained artifacts contain no sensitive payloads and allow expired temporary artifacts to purge.

### Quarterly

- Review taxonomy, canonical duplicate clusters, accessibility/keyboard/reduced-motion behavior, the recovery exercise, access inventory, incident themes, and roadmap.
- Reconfirm that public data remains read-only and imports/administration/exports remain role-gated.

## Service objectives

- Dashboard and news pipelines: at least 95% successful completed runs over the rolling 30-day window, with schedule coverage enforced and stalled runs treated as failures.
- Public mobile/desktop Core Web Vitals at p75: LCP below 2.5s, INP below 200ms, CLS below 0.1.
- Public database first-load JavaScript below 150 KB unless a release record documents a reviewed exception.
- Initial list rendering: no more than 25 rows.
- Published deals, funds, and companies: 100% required source presence; primary-source quality confirmed by Research until explicitly modeled.
- Accessibility: WCAG 2.2 AA for public and administrative routes, plus manual keyboard review each quarter.

Objectives that require elapsed telemetry are not declared complete from a one-time test. The monthly review records the actual rolling window and follow-up when an objective is missed.

## Change boundaries

- Keep Vercel, Neon/Postgres, Prisma, NextAuth, GitHub Actions, npm, and `/Infra-MA2` during this program.
- Preserve the restrained research-terminal identity; cleanup is not a brand redesign.
- Do not add subscriptions, client workspaces, CMS, native applications, or bulk unreviewed deal/PortCo publication.
- Use additive migrations, compatible application releases, and reviewed backfills. Defer destructive cleanup until restore points and redirects are verified.
- Preserve unclassified worktree artifacts until ownership and retention are explicit.
- Keep framework modernization separate from schema migrations and major UI work.

## Framework modernization gate

Next.js 16/React 19 work may start only after the stabilized Next 15 release has operated successfully through a complete 30-day reliability and performance window. Use a separate branch and release record; apply the official migration, `middleware` to `proxy` change, React types update, and Turbopack verification. Do not include schema migrations or major UI changes. Tailwind 4 and other nonessential majors wait for a later release.
