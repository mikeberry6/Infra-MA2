export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DashboardSignalReviewButtons } from "@/components/admin/DashboardSignalReviewButtons";
import { dashboardSignalContentHash } from "@/modules/dashboard/content-hash";
import {
  dashboardSignalReviewPagination,
  dashboardSignalReviewQueueWhere,
} from "@/modules/dashboard/review-queue";

export const metadata = { title: "Admin · Dashboard signals" };

export default async function AdminDashboardSignalsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;
  const reviewQueueWhere = dashboardSignalReviewQueueWhere(prisma.dashboardSignal.fields.contentHash);
  const total = await prisma.dashboardSignal.count({ where: reviewQueueWhere });
  const { page, totalPages, skip, take } = dashboardSignalReviewPagination(rawPage, total);
  const signals = await prisma.dashboardSignal.findMany({
    where: reviewQueueWhere,
    orderBy: [{ updatedAt: "desc" }, { observedAt: "desc" }, { id: "desc" }],
    skip,
    take,
    include: { reviewedBy: { select: { email: true } } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <Link href="/admin" className="mb-2 inline-flex items-center gap-1.5 type-meta text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="h-3 w-3" /> Admin
        </Link>
        <h1 className="type-page-title">Dashboard signal review</h1>
        <p className="mt-1 type-meta">
          Approve or reject qualitative matches before they can appear on the public dashboard or influence its score.
        </p>
      </div>

      <div className="mb-3 rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 type-meta">
        <span className="mono font-semibold tabular-nums text-[var(--text-primary)]">{total}</span> pending or changed signal{total === 1 ? "" : "s"}
        {totalPages > 1 && <span> · page {page} of {totalPages}</span>}
      </div>

      <div className="surface overflow-x-auto">
        <table className="w-full min-w-[1160px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg-app)]">
              <th className="px-3 py-2 type-table-header">Observed</th>
              <th className="px-3 py-2 type-table-header">Source</th>
              <th className="px-3 py-2 type-table-header">Signal</th>
              <th className="px-3 py-2 type-table-header">Classification</th>
              <th className="px-3 py-2 type-table-header">Review state</th>
              <th className="px-3 py-2 type-table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((signal) => {
              const changedAfterReview = signal.reviewedContentHash !== null
                && signal.contentHash !== signal.reviewedContentHash;
              return (
                <tr key={signal.id} className="border-b border-[var(--border)] align-top last:border-b-0 hover:bg-[var(--bg-subtle)]">
                  <td className="px-3 py-3 type-micro mono tabular-nums">{signal.observedAt.toISOString().slice(0, 10)}</td>
                  <td className="px-3 py-3 type-meta">
                    <div className="font-medium text-[var(--text-primary)]">{signal.sourceName}</div>
                    <div className="type-micro mono">{signal.sourceId}</div>
                  </td>
                  <td className="max-w-xl px-3 py-3">
                    <div className="flex items-start gap-1.5 type-row-title">
                      <span>{signal.title}</span>
                      {signal.sourceUrl && (
                        <a href={signal.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label="Open primary source">
                          <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" />
                        </a>
                      )}
                    </div>
                    <p className="mt-1 whitespace-normal type-micro leading-relaxed">{signal.summary}</p>
                  </td>
                  <td className="px-3 py-3 type-meta">
                    <div className="font-medium capitalize text-[var(--text-primary)]">
                      {signal.section.replaceAll("-", " ")}
                    </div>
                    <div className="mt-1 type-micro">
                      Direction: <span className="font-medium text-[var(--text-secondary)]">{signal.direction.replaceAll("_", " ")}</span>
                    </div>
                    <div className="mt-0.5 type-micro">
                      Severity: <span className="mono font-medium tabular-nums text-[var(--text-secondary)]">{signal.severity}/5</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 type-meta">
                    <div className="font-medium text-[var(--text-primary)]">
                      {changedAfterReview ? "CHANGED · RE-REVIEW" : signal.reviewStatus}
                    </div>
                    {signal.reviewedBy?.email && <div className="mt-1 type-micro">Last reviewed by {signal.reviewedBy.email}</div>}
                  </td>
                  <td className="px-3 py-3">
                    <DashboardSignalReviewButtons
                      id={signal.id}
                      contentHash={dashboardSignalContentHash(signal)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {signals.length === 0 && <div className="px-4 py-12 text-center type-meta">No dashboard signals require review.</div>}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Dashboard signal review pages" className="mt-4 flex items-center justify-between type-meta">
          {page > 1
            ? <Link href={`/admin/dashboard-signals?page=${page - 1}`}>← Previous</Link>
            : <span aria-hidden />}
          {page < totalPages
            ? <Link href={`/admin/dashboard-signals?page=${page + 1}`}>Next →</Link>
            : <span aria-hidden />}
        </nav>
      )}
    </div>
  );
}
