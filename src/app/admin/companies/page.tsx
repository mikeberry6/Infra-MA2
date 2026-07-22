export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { COMPANY_SECTOR_DISPLAY, COMPANY_STATUS_DISPLAY } from "@/modules/shared/enum-maps";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import DeleteButton from "@/components/admin/DeleteButton";
import ArchiveButton from "@/components/admin/ArchiveButton";
import RecordWorkflowButton from "@/components/admin/RecordWorkflowButton";
import ImportExportBar from "@/components/admin/ImportExportBar";
import { archiveCompany, deleteCompany, publishCompany, submitCompanyForReview, verifyCompany } from "@/modules/admin/actions";
import { getRecordStatusColor } from "@/lib/colors";
import { Button } from "@/components/shared/Button";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { adminPagination } from "@/lib/admin-pagination";

export const metadata = { title: "Admin · Companies" };

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;
  const total = await prisma.company.count();
  const { page, totalPages, skip, take } = adminPagination(rawPage, total);
  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
    skip,
    take,
    select: {
      id: true,
      name: true,
      sector: true,
      country: true,
      companyStatus: true,
      status: true,
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
            Companies
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            <span className="mono tabular-nums">{total.toLocaleString()}</span> total
          </p>
        </div>
        <Link href="/admin/companies/new">
          <Button variant="primary" size="md" leadingIcon={<Plus className="h-3 w-3" />}>
            New company
          </Button>
        </Link>
      </div>

      <ImportExportBar entityType="portfolio" />

      <div className="surface overflow-hidden mt-4">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-[var(--bg-app)] border-b border-[var(--border)]">
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Name</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Sector</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Country</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Record</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-subtle)] transition-colors">
                <td className="px-3 py-2.5 text-[13px] font-medium text-[var(--text-primary)] truncate max-w-[280px]">{company.name}</td>
                <td className="px-3 py-2.5 text-[12px] text-[var(--text-secondary)]">{COMPANY_SECTOR_DISPLAY[company.sector]}</td>
                <td className="px-3 py-2.5 text-[12px] text-[var(--text-secondary)]">{company.country}</td>
                <td className="px-3 py-2.5 text-[12px] text-[var(--text-secondary)]">{COMPANY_STATUS_DISPLAY[company.companyStatus]}</td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                    <span aria-hidden className="h-[5px] w-[5px] rounded-full" style={{ backgroundColor: getRecordStatusColor(company.status) }} />
                    {company.status}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Link href={`/admin/companies/${company.id}/edit`}>
                      <Button variant="secondary" size="sm">Edit</Button>
                    </Link>
                    <RecordWorkflowButton entity="company" id={company.id} status={company.status} submitForReview={submitCompanyForReview} publish={publishCompany} verify={verifyCompany} />
                    <ArchiveButton entity="company" archiveAction={archiveCompany} id={company.id} disabled={company.status === "ARCHIVED"} />
                    <DeleteButton entity="company" deleteAction={deleteCompany} id={company.id} status={company.status} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {companies.length === 0 && (
          <div className="py-12 text-center text-sm text-[var(--text-tertiary)]">No companies yet.</div>
        )}
      </div>
      <AdminPagination pathname="/admin/companies" page={page} totalPages={totalPages} totalItems={total} />
    </div>
  );
}
