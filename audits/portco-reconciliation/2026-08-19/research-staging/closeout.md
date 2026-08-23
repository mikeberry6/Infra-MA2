# PortCo research-staging closeout

Completed: 2026-08-22 23:09:46 UTC

## Outcome

The GPT-5.6 Sol Pro research-staging pass now covers the full 496-task execution universe. The 133 tasks already terminal in the execution manifest remain unchanged. The other 363 active or pending source tasks are represented exactly once by 323 canonical company chats and 40 linked identity or duplicate tasks. There are no failed or still-running research chats.

Research outcomes comprise 277 validated tasks and 46 tasks retained in an explicit review-required queue. Thirty-six tasks are application-blocked because current identity, ownership, source, or transaction evidence is not sufficient for a protected mutation. These are visible exceptions, not silent skips.

No database, seed, release, deployment, or website mutation occurred during this staging run.

## Decision counts

- 146 proposed corrections
- 62 proposed merges
- 52 proposed new companies
- 43 exclusions
- 11 deferrals
- 4 verified no-change decisions
- 4 supersessions
- 1 exclusion with a distinct asset-platform follow-up

## Integrity checks

- All 1,747 manifest artifact paths exist.
- All 1,296 JSON artifacts parse successfully.
- All 363 source tasks that were active or pending at the staging boundary are covered exactly once by sequence; no open source task is missing.
- No linked task remains blocked by a failed canonical research chat.

The legacy manifest's transport-hash fields are not consistently byte hashes of the normalized files: 21 prompt rows and 84 response rows differ from their current artifact bytes. The artifacts themselves exist and are protected by Git history, but later proposal generation must compute and bind fresh artifact byte hashes instead of reusing those transport hashes. The affected sequences are preserved in `closeout.json`.

## Next gate

The next work is adjudication and protected proposal generation—not more first-pass company chats. Review-required and application-blocked tasks must be resolved or explicitly deferred before their database changes can be prepared. Every proposal must use a fresh production snapshot, fresh artifact hashes, and the existing evidence and identity guardrails.
