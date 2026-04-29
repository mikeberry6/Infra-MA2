export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { COMPANY_SECTOR_DISPLAY, COMPANY_STATUS_DISPLAY } from "@/modules/shared/enum-maps";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import DeleteButton from "@/components/admin/DeleteButton";
import ImportExportBar from "@/components/admin/ImportExportBar";
import { deleteCompany } from "@/modules/admin/actions";
import { getRecordStatusColor } from "@/lib/colors";

export const metadata = { title: "Admin · Companies" };

export default async function AdminCompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
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
            <span className="mono tabular-nums">{companies.length.toLocaleString()}</span> total
          </p>
        </div>
        <Link
          href="/admin/companies/new"
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium bg-[var(--accent)] text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Plus className="h-3 w-3" /> New company
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
                    <Link
                      href={`/admin/companies/${company.id}/edit`}
                      className="inline-flex h-7 px-2.5 items-center rounded-md text-[11px] font-medium bg-[var(--bg-hover)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteButton deleteAction={deleteCompany} id={company.id} />
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
    </div>
  );
}
