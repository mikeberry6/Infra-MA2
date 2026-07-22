export const dynamic = "force-dynamic";

import { getDatabaseCounts } from "@/modules/insights/queries";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata = { title: "Admin" };

export default async function AdminDashboard() {
  const counts = await getDatabaseCounts();
  const userCount = await prisma.user.count();
  const draftDeals = await prisma.deal.count({ where: { status: "DRAFT" } });
  const draftCompanies = await prisma.company.count({ where: { status: "DRAFT" } });
  const pendingDashboardSignals = await prisma.dashboardSignal.count({
    where: { reviewStatus: "PENDING" },
  });

  const sections = [
    { href: "/admin/deals", label: "Deals", count: counts.deals, drafts: draftDeals },
    { href: "/admin/companies", label: "Companies", count: counts.portfolio, drafts: draftCompanies },
    { href: "/admin/funds", label: "Funds", count: counts.funds, drafts: 0 },
    { href: "/admin/dashboard-signals", label: "Dashboard signals", count: pendingDashboardSignals, drafts: 0 },
    { href: "/admin/sources", label: "Sources", count: 0, drafts: 0 },
    { href: "/admin/users", label: "Users", count: userCount, drafts: 0 },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-10">
      <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight mb-1">
        Admin
      </h1>
      <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-7">
        Manage deals, companies, funds, dashboard signals, sources, and users.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="surface px-4 py-4 hover:bg-[var(--bg-subtle)] transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
                  {s.label}
                </div>
                <div className="text-2xl font-semibold text-[var(--text-primary)] mono tabular-nums leading-none">
                  {s.count.toLocaleString()}
                </div>
                {s.drafts > 0 && (
                  <div className="text-[11px] text-[var(--text-tertiary)] mt-2">
                    <span className="mono tabular-nums text-[var(--text-secondary)]">{s.drafts}</span> draft{s.drafts !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
