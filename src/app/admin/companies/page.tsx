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
import { ButtonLink } from "@/components/shared/Button";
import { ACTIVE_COMPANY_WHERE } from "@/modules/companies/retirement";

export const metadata = { title: "Admin · Companies" };

export default async function AdminCompaniesPage() {
  const companies = await prisma.company.findMany({
    where: ACTIVE_COMPANY_WHERE,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      sector: true,
      country: true,
      companyStatus: true,
      status: true,
      _count: { select: { redirects: true } },
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
        <ButtonLink href="/admin/companies/new" variant="primary" size="md" leadingIcon={<Plus className="h-3 w-3" />}>
          New company
        </ButtonLink>
      </div>

      <ImportExportBar entityType="portfolio" />

      <div className="surface overflow-x-auto mt-4">
        <table className="min-w-[880px] w-full text-left border-collapse whitespace-nowrap">
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
            {companies.map((company) => {
              const isMergeSurvivor = company._count.redirects > 0;
              return (
              <tr key={company.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-subtle)] transition-colors">
                <td className="px-3 py-2.5 text-[13px] font-medium text-[var(--text-primary)] max-w-[280px]">
                  <span className="truncate">{company.name}</span>
                  {isMergeSurvivor && (
                    <span className="ml-2 text-[10px] font-medium text-[var(--text-tertiary)]">
                      Merge survivor · compatibility locked
                    </span>
                  )}
                </td>
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
                    {!isMergeSurvivor && (
                      <>
                        <ButtonLink href={`/admin/companies/${company.id}/edit`} variant="secondary" size="sm">Edit</ButtonLink>
                        <RecordWorkflowButton entity="company" id={company.id} status={company.status} submitForReview={submitCompanyForReview} publish={publishCompany} verify={verifyCompany} />
                        <ArchiveButton entity="company" archiveAction={archiveCompany} id={company.id} disabled={company.status === "ARCHIVED"} />
                        <DeleteButton entity="company" deleteAction={deleteCompany} id={company.id} status={company.status} />
                      </>
                    )}
                    {isMergeSurvivor && company.status === "PUBLISHED" && (
                      <RecordWorkflowButton entity="company" id={company.id} status={company.status} submitForReview={submitCompanyForReview} publish={publishCompany} verify={verifyCompany} />
                    )}
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        {companies.length === 0 && (
          <div className="py-12 text-center text-sm text-[var(--text-tertiary)]">No companies yet.</div>
        )}
      </div>
    </div>
  );
}
