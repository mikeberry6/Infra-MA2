# Reviewed data approvals

This directory is reserved for small, human-reviewed JSON decision files used
by protected remediation workflows. Generated candidate reports belong in
workflow artifacts or `tmp/`; they are not approvals.

Before committing an approval file:

1. A Research owner reviews every selected primary citation or company merge.
2. The reviewer fills `reviewedBy` and `reviewedAt` and resolves every included
   decision without changing opaque IDs from the generated template.
3. A second reviewer checks the diff and records the exact SHA-256 of the file.
4. Operations supplies that digest to **Review or Remediate Release Data**.

Never place credentials, imported row payloads, private query data, or tokens
in an approval file. An approval is immutable after it has been applied; a
correction requires a newly generated and reviewed file.
