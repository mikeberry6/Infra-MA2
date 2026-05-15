export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { DEAL_SECTOR_DISPLAY, DEAL_STATUS_DISPLAY } from "@/modules/shared/enum-maps";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import DeleteButton from "@/components/admin/DeleteButton";
import ImportExportBar from "@/components/admin/ImportExportBar";
import { deleteDeal } from "@/modules/admin/actions";
import { getRecordStatusColor } from "@/lib/colors";
import { Button } from "@/components/shared/Button";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Admin · Deals" };

export default async function AdminDealsPage() {
  const deals = await prisma.deal.findMany({
    orderBy: { date: "desc" },
    select: {
      id: true,
      legacyId: true,
      title: true,
      target: true,
      sector: true,
      dealStatus: true,
      status: true,
      date: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Admin
          </Link>
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            Deals
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            <span className="mono tabular-nums">{deals.length.toLocaleString()}</span> total
          </p>
        </div>
        <Link href="/admin/deals/new">
          <Button variant="primary" size="md" leadingIcon={<Plus className="h-3 w-3" />}>
            New deal
          </Button>
        </Link>
      </div>

      <ImportExportBar entityType="deals" />

      <div className="surface overflow-hidden mt-4">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-[var(--bg-app)] border-b border-[var(--border)]">
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">ID</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Target</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Sector</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Deal status</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Record</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Date</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr key={deal.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-subtle)] transition-colors">
                <td className="px-3 py-2.5 text-[11px] mono tabular-nums text-[var(--text-tertiary)]">{deal.legacyId}</td>
                <td className="px-3 py-2.5 text-[13px] text-[var(--text-primary)] font-medium truncate max-w-[280px]">{deal.target}</td>
                <td className="px-3 py-2.5 text-[12px] text-[var(--text-secondary)]">{DEAL_SECTOR_DISPLAY[deal.sector]}</td>
                <td className="px-3 py-2.5 text-[12px] text-[var(--text-secondary)]">{DEAL_STATUS_DISPLAY[deal.dealStatus]}</td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                    <span
                      aria-hidden
                      className="h-[5px] w-[5px] rounded-full"
                      style={{ backgroundColor: getRecordStatusColor(deal.status) }}
                    />
                    {deal.status}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-[11px] mono tabular-nums text-[var(--text-tertiary)]">{formatDate(deal.date)}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Link href={`/admin/deals/${deal.id}/edit`}>
                      <Button variant="secondary" size="sm">Edit</Button>
                    </Link>
                    <DeleteButton deleteAction={deleteDeal} id={deal.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {deals.length === 0 && (
          <div className="py-12 text-center text-sm text-[var(--text-tertiary)]">No deals yet.</div>
        )}
      </div>
    </div>
  );
}
