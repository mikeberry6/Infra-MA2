export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { FUND_STATUS_DISPLAY } from "@/modules/shared/enum-maps";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import DeleteButton from "@/components/admin/DeleteButton";
import ArchiveButton from "@/components/admin/ArchiveButton";
import RecordWorkflowButton from "@/components/admin/RecordWorkflowButton";
import ImportExportBar from "@/components/admin/ImportExportBar";
import { archiveFund, deleteFund, publishFund, submitFundForReview, verifyFund } from "@/modules/admin/actions";
import { ButtonLink } from "@/components/shared/Button";
import { getRecordStatusColor } from "@/lib/colors";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { adminPagination } from "@/lib/admin-pagination";

export const metadata = { title: "Admin · Funds" };

export default async function AdminFundsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;
  const total = await prisma.fund.count();
  const { page, totalPages, skip, take } = adminPagination(rawPage, total);
  const funds = await prisma.fund.findMany({
    orderBy: { fundName: "asc" },
    skip,
    take,
    include: {
      manager: { select: { name: true } },
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
            Funds
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            <span className="mono tabular-nums">{total.toLocaleString()}</span> total
          </p>
        </div>
        <ButtonLink href="/admin/funds/new" variant="primary" size="md" leadingIcon={<Plus className="h-3 w-3" />}>
          New fund
        </ButtonLink>
      </div>

      <ImportExportBar entityType="funds" />

      <div
        className="surface overflow-x-auto mt-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
        role="region"
        aria-label="Funds table"
        tabIndex={0}
      >
        <table className="w-full min-w-[760px] text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-[var(--bg-app)] border-b border-[var(--border)]">
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">ID</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Fund name</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Manager</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Record</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Size</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {funds.map((fund) => (
              <tr key={fund.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-subtle)] transition-colors">
                <td className="px-3 py-2.5 text-[11px] mono tabular-nums text-[var(--text-tertiary)]">{fund.legacyId}</td>
                <td className="px-3 py-2.5 text-[13px] font-medium text-[var(--text-primary)] truncate max-w-[280px]">{fund.fundName}</td>
                <td className="px-3 py-2.5 text-[12px] text-[var(--text-secondary)]">{fund.manager.name}</td>
                <td className="px-3 py-2.5 text-[12px] text-[var(--text-secondary)]">{FUND_STATUS_DISPLAY[fund.fundStatus]}</td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                    <span aria-hidden className="h-[5px] w-[5px] rounded-full" style={{ backgroundColor: getRecordStatusColor(fund.status) }} />
                    {fund.status}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-[12px] mono tabular-nums text-[var(--text-secondary)]">{fund.size}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <ButtonLink href={`/admin/funds/${fund.id}/edit`} variant="secondary" size="sm">
                      Edit
                    </ButtonLink>
                    <RecordWorkflowButton entity="fund" id={fund.id} status={fund.status} submitForReview={submitFundForReview} publish={publishFund} verify={verifyFund} />
                    <ArchiveButton entity="fund" archiveAction={archiveFund} id={fund.id} disabled={fund.status === "ARCHIVED"} />
                    <DeleteButton entity="fund" deleteAction={deleteFund} id={fund.id} status={fund.status} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {funds.length === 0 && (
          <div className="py-12 text-center text-sm text-[var(--text-tertiary)]">No funds yet.</div>
        )}
      </div>
      <AdminPagination pathname="/admin/funds" page={page} totalPages={totalPages} totalItems={total} />
    </div>
  );
}
