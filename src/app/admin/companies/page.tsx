export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { COMPANY_SECTOR_DISPLAY, COMPANY_STATUS_DISPLAY } from "@/modules/shared/enum-maps";
import Link from "next/link";

export const metadata = { title: "Admin - Companies" };

export default async function AdminCompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
    take: 50,
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
    <div className="min-h-screen bg-[#09090B] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-sm text-[#71717A] hover:text-white mb-2 inline-block">&larr; Back to Admin</Link>
            <h1 className="text-2xl font-bold">Companies</h1>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#27272A] text-[#71717A] text-left">
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Sector</th>
              <th className="pb-2 pr-4">Country</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2">Record Status</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="border-b border-[#1a1a1d] hover:bg-[#111113]">
                <td className="py-2 pr-4 font-medium">{company.name}</td>
                <td className="py-2 pr-4 text-[#A1A1AA]">{COMPANY_SECTOR_DISPLAY[company.sector]}</td>
                <td className="py-2 pr-4 text-[#A1A1AA]">{company.country}</td>
                <td className="py-2 pr-4 text-[#A1A1AA]">{COMPANY_STATUS_DISPLAY[company.companyStatus]}</td>
                <td className="py-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    company.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-400" :
                    company.status === "DRAFT" ? "bg-amber-500/10 text-amber-400" :
                    "bg-zinc-500/10 text-zinc-400"
                  }`}>
                    {company.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
