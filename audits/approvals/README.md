# Reviewed data approvals

This directory is reserved for small, human-reviewed JSON decision files used
by protected remediation workflows. Generated candidate reports belong in
workflow artifacts or `tmp/`; they are not approvals.

Before committing an approval file:

1. A Research owner reviews every selected primary citation, Fund primary
   source, company merge, ownership-to-fund link correction, or deal
   seller-disclosure treatment.
2. The reviewer fills `reviewedBy` and `reviewedAt` and resolves every included
   decision without changing opaque IDs from the generated template.
3. A second reviewer checks the diff and records the exact SHA-256 of the file.
4. Operations supplies that digest to **Review or Remediate Release Data**.

Never place credentials, imported row payloads, private query data, or tokens
in an approval file. An approval is immutable after it has been applied; a
correction requires a newly generated and reviewed file.

The canonical seller-treatment file is
`audits/approvals/deal-seller-disclosures.json`. Its generated template is only
an evidence packet: `decisionStatus` and `decisionReason` remain `null` until
Research reviews each deal. A reviewer may choose only `NOT_DISCLOSED` or
`NOT_APPLICABLE`, with an evidence-based reason of at least 10 characters. If
the evidence names a seller, add that seller through the editorial workflow
and regenerate the template instead of encoding the seller as absent.

The canonical Fund primary-source file is
`audits/approvals/fund-primary-sources.json`. Generate it only with
`npm run db:fund-primary-sources:report`; the template lists credential-free
HTTP(S) candidates from `sourceUrls` and `strategyUrl` in neutral lexical
order and leaves every `selectedPrimarySourceUrl` null. Research selects one
exact listed URL per Fund. Candidate order is not a recommendation, and a
missing candidate must be corrected in the editorial data before regeneration.
