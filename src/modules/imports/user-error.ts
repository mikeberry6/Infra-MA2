export class ImportRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportRequestError";
  }
}

export class ImportConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportConflictError";
  }
}

export function importUserErrorDetails(error: unknown): {
  message: string;
  status: 400 | 409;
} | null {
  if (error instanceof ImportRequestError) {
    return { message: error.message, status: 400 };
  }
  if (error instanceof ImportConflictError) {
    return { message: error.message, status: 409 };
  }
  return null;
}
