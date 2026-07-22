export const ADMIN_PAGE_SIZE = 25;

export type AdminPagination = {
  page: number;
  totalPages: number;
  skip: number;
  take: number;
};

/** Normalizes URL page state and prevents an empty out-of-range admin view. */
export function adminPagination(
  rawPage: string | undefined,
  totalItems: number,
): AdminPagination {
  const requestedPage = positiveInteger(rawPage);
  const safeTotal = Number.isFinite(totalItems) ? Math.max(0, Math.floor(totalItems)) : 0;
  const totalPages = Math.max(1, Math.ceil(safeTotal / ADMIN_PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  return {
    page,
    totalPages,
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
  };
}

function positiveInteger(value?: string): number {
  if (!value || !/^\d+$/.test(value)) return 1;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}
