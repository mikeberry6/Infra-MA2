# Task 99 attempt history

- Preliminary proposal v1 was superseded before authorization by the first
  fresh production lock.
- Attempt 1 authorized proposal v2, but its read-only production dry-run
  rejected a shared Source label/type mismatch. No seed or database write
  occurred.
- Attempt 2 authorized proposal v3, but its read-only production dry-run
  rejected omission of three legacy milestone IDs. No seed or database write
  occurred.
- Attempt 3 authorized proposal v4. It preserves the shared Source metadata and
  all four milestone IDs, passed the production dry-run, and is the only staged
  seed after-image in this release.
