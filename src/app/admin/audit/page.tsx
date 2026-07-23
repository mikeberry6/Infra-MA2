export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Admin · Audit log" };

export default async function AdminAuditPage() {
  const events = await prisma.auditEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { email: true, name: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <Link href="/admin" className="mb-2 inline-flex items-center gap-1.5 type-meta text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="h-3 w-3" /> Admin
        </Link>
        <h1 className="type-page-title">Audit log</h1>
        <p className="mt-1 type-meta">The 100 most recent authenticated mutations, imports, publication, and archival events.</p>
      </div>
      <div className="surface overflow-x-auto">
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
                : changes ? Object.keys(changes).join(", ") : "—";
              return (
                <tr key={event.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-subtle)]">
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
    </div>
  );
}
