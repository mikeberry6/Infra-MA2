export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { ADMIN_PAGE_SIZE, adminPagination } from "@/lib/admin-pagination";

export const metadata = { title: "Admin · Audit log" };

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{
    focus?: string | string[];
    page?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const focus = Array.isArray(params.focus) ? params.focus[0] : params.focus;
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const [total, focusedEvent] = await Promise.all([
    prisma.auditEvent.count(),
    focus
      ? prisma.auditEvent.findUnique({
          where: { id: focus },
          select: { id: true, createdAt: true },
        })
      : Promise.resolve(null),
  ]);
  const eventsBeforeFocus = focusedEvent
    ? await prisma.auditEvent.count({
        where: {
          OR: [
            { createdAt: { gt: focusedEvent.createdAt } },
            {
              createdAt: focusedEvent.createdAt,
              id: { gt: focusedEvent.id },
            },
          ],
        },
      })
    : null;
  const requestedPage = eventsBeforeFocus == null
    ? rawPage
    : String(Math.floor(eventsBeforeFocus / ADMIN_PAGE_SIZE) + 1);
  const { page, totalPages, skip, take } = adminPagination(requestedPage, total);
  const events = await prisma.auditEvent.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip,
    take,
    include: { actor: { select: { email: true, name: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <Link href="/admin" className="mb-2 inline-flex items-center gap-1.5 type-meta text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="h-3 w-3" /> Admin
        </Link>
        <h1 className="type-page-title">Audit log</h1>
        <p className="mt-1 type-meta">Authenticated mutations, imports, publication, and archival events. <span className="mono tabular-nums">{total.toLocaleString()}</span> total.</p>
      </div>

      <div
        className="surface overflow-x-auto"
        role="region"
        aria-label="Audit log table"
        tabIndex={0}
      >
        <table className="w-full min-w-[800px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg-app)]">
              <th className="px-3 py-2 type-table-header">Time</th>
              <th className="px-3 py-2 type-table-header">Actor</th>
              <th className="px-3 py-2 type-table-header">Action</th>
              <th className="px-3 py-2 type-table-header">Entity</th>
              <th className="px-3 py-2 type-table-header">Changed fields</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const changes = event.changes && typeof event.changes === "object" && !Array.isArray(event.changes)
                ? event.changes as Record<string, unknown>
                : null;
              const fields = Array.isArray(changes?.changedFields)
                ? changes.changedFields.join(", ")
                : changes
                  ? Object.keys(changes).join(", ")
                  : "—";
              return (
                <tr key={event.id} className={`border-b border-[var(--border)] last:border-b-0 ${focus === event.id ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--bg-subtle)]"}`}>
                  <td className="px-3 py-2.5 type-micro mono tabular-nums">{formatDate(event.createdAt)}</td>
                  <td className="px-3 py-2.5 type-meta">{event.actor?.email ?? "System"}</td>
                  <td className="px-3 py-2.5 type-meta font-semibold text-[var(--text-primary)]">{event.action}</td>
                  <td className="px-3 py-2.5 type-meta">{event.entityType}{event.entityId ? <span className="block type-micro mono">{event.entityId}</span> : null}</td>
                  <td className="max-w-sm px-3 py-2.5 type-micro">{fields}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {events.length === 0 && <div className="px-4 py-12 text-center type-meta">No audit events have been recorded.</div>}
      </div>
      <AdminPagination pathname="/admin/audit" page={page} totalPages={totalPages} totalItems={total} />
    </div>
  );
}
