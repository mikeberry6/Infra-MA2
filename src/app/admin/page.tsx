export const dynamic = "force-dynamic";

import { getDatabaseCounts } from "@/modules/insights/queries";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboard() {
  const counts = await getDatabaseCounts();
  const userCount = await prisma.user.count();
  const draftDeals = await prisma.deal.count({ where: { status: "DRAFT" } });
  const draftCompanies = await prisma.company.count({ where: { status: "DRAFT" } });

  const sections = [
    { href: "/admin/deals", label: "Deals", count: counts.deals, drafts: draftDeals },
    { href: "/admin/companies", label: "Companies", count: counts.portfolio, drafts: draftCompanies },
    { href: "/admin/funds", label: "Funds", count: counts.funds, drafts: 0 },
    { href: "/admin/sources", label: "Sources", count: 0, drafts: 0 },
    { href: "/admin/users", label: "Users", count: userCount, drafts: 0 },
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-[#71717A] mb-8">Manage deals, companies, funds, sources, and users.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="block p-6 rounded-lg border border-[#27272A] bg-[#111113] hover:border-[#3f3f46] transition-colors"
            >
              <h2 className="text-lg font-semibold mb-1">{s.label}</h2>
              <p className="text-2xl font-bold text-[#818CF8]">{s.count}</p>
              {s.drafts > 0 && (
                <p className="text-xs text-[#f59e0b] mt-1">{s.drafts} drafts</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
