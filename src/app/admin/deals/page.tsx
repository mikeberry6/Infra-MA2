export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { DEAL_SECTOR_DISPLAY, DEAL_STATUS_DISPLAY } from "@/modules/shared/enum-maps";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import ImportExportBar from "@/components/admin/ImportExportBar";
import { deleteDeal } from "@/modules/admin/actions";

export const metadata = { title: "Admin - Deals" };

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
    <div className="min-h-screen bg-[#09090B] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-sm text-[#71717A] hover:text-white mb-2 inline-block">&larr; Back to Admin</Link>
            <h1 className="text-2xl font-bold">Deals</h1>
          </div>
          <Link
            href="/admin/deals/new"
            className="bg-[#818CF8] text-white px-4 py-2 rounded hover:bg-[#6366F1] text-sm font-medium"
          >
            New Deal
          </Link>
        </div>

        <ImportExportBar entityType="deals" />

        <table className="w-full text-sm mt-4">
          <thead>
            <tr className="border-b border-[#27272A] text-[#71717A] text-left">
              <th className="pb-2 pr-4">ID</th>
              <th className="pb-2 pr-4">Target</th>
              <th className="pb-2 pr-4">Sector</th>
              <th className="pb-2 pr-4">Deal Status</th>
              <th className="pb-2 pr-4">Record Status</th>
              <th className="pb-2 pr-4">Date</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr key={deal.id} className="border-b border-[#1a1a1d] hover:bg-[#111113]">
                <td className="py-2 pr-4 text-[#71717A] font-mono text-xs">{deal.legacyId}</td>
                <td className="py-2 pr-4">{deal.target}</td>
                <td className="py-2 pr-4 text-[#A1A1AA]">{DEAL_SECTOR_DISPLAY[deal.sector]}</td>
                <td className="py-2 pr-4 text-[#A1A1AA]">{DEAL_STATUS_DISPLAY[deal.dealStatus]}</td>
                <td className="py-2 pr-4">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    deal.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-400" :
                    deal.status === "DRAFT" ? "bg-amber-500/10 text-amber-400" :
                    "bg-zinc-500/10 text-zinc-400"
                  }`}>
                    {deal.status}
                  </span>
                </td>
                <td className="py-2 pr-4 text-[#71717A]">{deal.date.toLocaleDateString()}</td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/deals/${deal.id}/edit`}
                      className="text-xs px-2 py-1 rounded bg-[#818CF8]/10 text-[#818CF8] hover:bg-[#818CF8]/20"
                    >
                      Edit
                    </Link>
                    <DeleteButton deleteAction={deleteDeal} id={deal.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
