# TERRANOVA apply receipt recovery

- Release pull request: #300
- Release commit: `5c444c0f8979a82644363d1226754ba6e077b956`
- Initial protected run: `30861746084`
  - Stopped before any database write because the required push build for the merged commit was still running.
- Protected apply run: `30861851507`
  - Passed release, deployment, artifact, schema, target, fresh-state, and dry-run checks.
  - Committed the exact approved archived after-image and durable audit event.
  - Withheld the normal receipt because the public detail verifier treated TERRANOVA's expected archived `404` as a failure.
- Recovery:
  - Added an explicit archived-company public verification rule: `404` is required, while a retrievable archived company fails verification.
  - Revalidated the exact CompanyRevision, AuditEvent, current database image, committed seed removal, database target, and public `404`.
  - Reconstructed the receipt without any additional database write.
  - Updated the execution manifest from the interrupted `RELEASING` state to `COMPLETED` using the verified durable evidence.

The recovered receipt is bound to the original proposal, automatic approval, proposal-scoped production snapshot, approved after-image, durable audit event, and observed production result.
