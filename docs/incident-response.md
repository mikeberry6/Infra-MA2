# Incident Response

## Severity

| Severity | Examples | Initial response target |
| --- | --- | --- |
| SEV-1 | Data corruption, credential exposure, unauthorized admin access, production unavailable | 15 minutes |
| SEV-2 | Critical route failures, database latency/error spike, both critical pipelines stale, exports incorrectly authorized | 30 minutes |
| SEV-3 | One provider failed, degraded freshness, broken source links, non-critical visual/accessibility regression | Same business day |

The first responder becomes incident lead until ownership is explicitly transferred. Use one timeline and one decision log. Do not place secrets, credentials, private query data, or imported row contents in tickets or chat.

## Initial actions

1. Record UTC detection time, reporter, affected routes/pipelines, release SHA, deployment ID, and representative request IDs.
2. Check `/api/health`, Vercel error/latency views, GitHub pipeline runs, and Neon status/latency without changing state.
3. Determine whether the incident is application, database, provider, authentication, or data-quality related.
4. Pause imports/publication for any integrity or authorization concern. Disable the affected schedule if repeated writes could amplify damage.
5. For suspected credential exposure, revoke the credential first, then investigate; do not wait for proof of use.

## Containment paths

- **Application regression:** use the recorded known-good Vercel deployment and `rollback-production.yml`. Leave additive migrations in place.
- **Database unavailable:** do not repeatedly migrate. Confirm Neon incident status, connection limits, and endpoint/branch selection. Serve only what fails safely; health should remain 503.
- **Pipeline failure:** preserve the failed `PipelineRun` and artifact, classify provider vs application failure, and manually rerun only after the cause is understood. Idempotency does not authorize blind repeated runs.
- **Stale dashboard/news:** retain last successful public data with explicit stale/failed labels. Never substitute sample data in production.
- **Authorization issue:** disable the affected route or roll back, revoke sessions/secrets, review `AuditEvent`, Vercel access, and administrator accounts.
- **Data corruption:** stop all writes, preserve the current database, and validate recovery on a new Neon branch. Do not patch large populations manually.

## Recovery verification

Use the route and authorization checklist in `release-runbook.md`. Confirm the release version, database branch/host, pipeline freshness, audit creation, and source coverage. Monitor for at least 30 minutes after a SEV-1/2 recovery.

## Communication

Provide concise updates with impact, current containment, next decision, and next update time. Avoid speculation. Research owns statements about data completeness; Engineering owns application/security facts; Operations owns availability and recovery timing.

## Postmortem

Complete a blameless postmortem within five business days for SEV-1/2. Include timeline, customer/data impact, detection gap, technical and process causes, why safeguards did or did not work, recovery time/point, and corrective actions with owners/dates. Review recurring themes at the quarterly roadmap meeting.
