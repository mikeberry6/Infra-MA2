export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { adminPagination } from "@/lib/admin-pagination";

export const metadata = { title: "Admin · Sources" };

export default async function AdminSourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;
  const total = await prisma.source.count();
  const { page, totalPages, skip, take } = adminPagination(rawPage, total);
  const sources = await prisma.source.findMany({
    orderBy: { createdAt: "desc" },
    skip,
    take,
    include: {
      _count: { select: { citations: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-2"
        >
          <ArrowLeft className="h-3 w-3" /> Admin
        </Link>
        <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
          Sources
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          <span className="mono tabular-nums">{total.toLocaleString()}</span> total
        </p>
      </div>

      <div
        className="surface overflow-x-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
        role="region"
        aria-label="Sources table"
        tabIndex={0}
      >
        <table className="w-full min-w-[720px] text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-[var(--bg-app)] border-b border-[var(--border)]">
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Label</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Type</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Citations</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">URL</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-subtle)] transition-colors">
                <td className="px-3 py-2.5 text-[13px] font-medium text-[var(--text-primary)] max-w-xs truncate">{source.label || "—"}</td>
                <td className="px-3 py-2.5 text-[12px] text-[var(--text-secondary)]">{source.type}</td>
                <td className="px-3 py-2.5 text-[12px] mono tabular-nums text-[var(--text-secondary)]">{source._count.citations}</td>
                <td className="px-3 py-2.5 text-[12px] text-[var(--text-secondary)] max-w-sm truncate">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors"
                  >
                    <span className="truncate">{source.url}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sources.length === 0 && (
          <div className="py-12 text-center text-sm text-[var(--text-tertiary)]">No sources yet.</div>
        )}
      </div>
      <AdminPagination pathname="/admin/sources" page={page} totalPages={totalPages} totalItems={total} />
    </div>
  );
}
