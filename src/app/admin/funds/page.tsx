export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { FUND_STATUS_DISPLAY } from "@/modules/shared/enum-maps";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import ImportExportBar from "@/components/admin/ImportExportBar";
import { deleteFund } from "@/modules/admin/actions";

export const metadata = { title: "Admin - Funds" };

export default async function AdminFundsPage() {
  const funds = await prisma.fund.findMany({
    orderBy: { fundName: "asc" },
    include: {
      manager: { select: { name: true } },
    },
  });

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-sm text-[#71717A] hover:text-white mb-2 inline-block">&larr; Back to Admin</Link>
            <h1 className="text-2xl font-bold">Funds</h1>
          </div>
          <Link
            href="/admin/funds/new"
            className="bg-[#818CF8] text-white px-4 py-2 rounded hover:bg-[#6366F1] text-sm font-medium"
          >
            New Fund
          </Link>
        </div>

        <ImportExportBar entityType="funds" />

        <table className="w-full text-sm mt-4">
          <thead>
            <tr className="border-b border-[#27272A] text-[#71717A] text-left">
              <th className="pb-2 pr-4">ID</th>
              <th className="pb-2 pr-4">Fund Name</th>
              <th className="pb-2 pr-4">Manager</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2 pr-4">Size</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {funds.map((fund) => (
              <tr key={fund.id} className="border-b border-[#1a1a1d] hover:bg-[#111113]">
                <td className="py-2 pr-4 text-[#71717A] font-mono text-xs">{fund.legacyId}</td>
                <td className="py-2 pr-4 font-medium">{fund.fundName}</td>
                <td className="py-2 pr-4 text-[#A1A1AA]">{fund.manager.name}</td>
                <td className="py-2 pr-4 text-[#A1A1AA]">{FUND_STATUS_DISPLAY[fund.fundStatus]}</td>
                <td className="py-2 pr-4 text-[#A1A1AA]">{fund.size}</td>
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/funds/${fund.id}/edit`}
                      className="text-xs px-2 py-1 rounded bg-[#818CF8]/10 text-[#818CF8] hover:bg-[#818CF8]/20"
                    >
                      Edit
                    </Link>
                    <DeleteButton deleteAction={deleteFund} id={fund.id} />
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
