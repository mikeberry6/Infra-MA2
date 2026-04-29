import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CompanyForm from "@/components/admin/CompanyForm";
import { createCompany } from "@/modules/admin/actions";

export const metadata = { title: "Admin · New Company" };

export default function NewCompanyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6">
        <Link
          href="/admin/companies"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-2"
        >
          <ArrowLeft className="h-3 w-3" /> Companies
        </Link>
        <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
          New company
        </h1>
      </div>

      <CompanyForm action={createCompany} mode="create" />
    </div>
  );
}
