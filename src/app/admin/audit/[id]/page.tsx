import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Audit event" };

function formatJson(value: unknown): string {
  return JSON.stringify(value ?? {}, null, 2);
}
export default async function AuditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.auditEvent.findUnique({
    where: { id },
    select: {
      id: true,
      entityType: true,
      entityId: true,
      action: true,
      changes: true,
      metadata: true,
      createdAt: true,
      actor: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });
  if (!event) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/admin"
        className="mb-3 inline-flex items-center gap-1.5 type-meta text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Admin
      </Link>

      <div className="mb-6">
        <p className="type-label">Immutable activity record</p>
        <h1 className="mt-1 type-page-title">Audit event</h1>
        <p className="mt-1 break-all mono type-micro">{event.id}</p>
      </div>

      <section className="surface overflow-hidden">
        <dl className="grid gap-px bg-[var(--border)] sm:grid-cols-2">
          {[
            ["Action", event.action],
            ["Entity", event.entityType],
            ["Entity ID", event.entityId || "—"],
            [
              "Actor",
              event.actor?.name || event.actor?.email || "Deleted user",
            ],
            [
              "Recorded",
              new Intl.DateTimeFormat("en-US", {
                dateStyle: "medium",
                timeStyle: "long",
              }).format(event.createdAt),
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="bg-[var(--bg-surface)] px-4 py-3"
            >
              <dt className="type-label">{label}</dt>
              <dd className="mt-1 break-words type-row-title">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="grid border-t border-[var(--border)] lg:grid-cols-2">
          <section className="border-b border-[var(--border)] p-4 lg:border-b-0 lg:border-r">
            <h2 className="type-section-title">Changed-field summary</h2>
            <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md bg-[var(--bg-app)] p-3 mono type-micro text-[var(--text-secondary)]">
              {formatJson(event.changes)}
            </pre>
          </section>
          <section className="p-4">
            <h2 className="type-section-title">Operational metadata</h2>
            <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md bg-[var(--bg-app)] p-3 mono type-micro text-[var(--text-secondary)]">
              {formatJson(event.metadata)}
            </pre>
          </section>
        </div>
      </section>
    </main>
  );
}
