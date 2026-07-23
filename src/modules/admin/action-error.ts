/**
 * Marks an error message as deliberately safe to show to an authenticated
 * administrator. Arbitrary exceptions must never cross the server-action
 * boundary because Prisma and driver messages can contain database details.
 */
export class AdminActionUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminActionUserError";
  }
}

export function adminActionErrorMessage(error: unknown, fallback: string): string {
  return error instanceof AdminActionUserError ? error.message : fallback;
}
