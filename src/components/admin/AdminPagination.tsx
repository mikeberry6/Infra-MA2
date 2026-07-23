import Link from "next/link";

type AdminPaginationProps = {
  pathname: string;
  page: number;
  totalPages: number;
  totalItems: number;
};

export function AdminPagination({
  pathname,
  page,
  totalPages,
  totalItems,
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const href = (nextPage: number) => `${pathname}?page=${nextPage}`;

  return (
    <nav
      aria-label="Admin result pages"
      className="mt-4 flex items-center justify-between gap-4 type-meta"
    >
      {page > 1
        ? <Link href={href(page - 1)}>← Previous</Link>
        : <span aria-hidden />}
      <span className="mono tabular-nums text-[var(--text-tertiary)]">
        Page {page} of {totalPages} · {totalItems.toLocaleString()} records
      </span>
      {page < totalPages
        ? <Link href={href(page + 1)}>Next →</Link>
        : <span aria-hidden />}
    </nav>
  );
}
