const ADMIN_BOOTSTRAP_AUDIT_FIELDS = [
  "email",
  "name",
  "passwordHash",
  "role",
] as const;

export interface AdminBootstrapAuditState {
  email: string;
  name: string | null;
  passwordHash: string;
  role: string;
}

/**
 * Return field names only. Credential values remain transaction-local and
 * must never be copied into AuditEvent changes, metadata, or process output.
 */
export function adminBootstrapChangedFields(
  before: AdminBootstrapAuditState | null,
  after: AdminBootstrapAuditState,
): string[] {
  return ADMIN_BOOTSTRAP_AUDIT_FIELDS.filter(
    (field) => !before || before[field] !== after[field],
  );
}
