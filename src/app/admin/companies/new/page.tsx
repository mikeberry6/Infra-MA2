import Link from "next/link";
import CompanyForm from "@/components/admin/CompanyForm";
import { createCompany } from "@/modules/admin/actions";

export const metadata = { title: "Admin - New Company" };

export default function NewCompanyPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/companies" className="text-sm text-[#71717A] hover:text-white mb-2 inline-block">
            &larr; Back to Companies
          </Link>
          <h1 className="text-2xl font-bold">New Company</h1>
        </div>

        <CompanyForm action={createCompany} mode="create" />
      </div>
    </div>
  );
}
