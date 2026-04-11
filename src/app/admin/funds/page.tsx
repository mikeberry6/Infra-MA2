export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { FUND_STATUS_DISPLAY } from "@/modules/shared/enum-maps";
import Link from "next/link";

export const metadata = { title: "Admin - Funds" };

export default async function AdminFundsPage() {
  const funds = await prisma.fund.findMany({
    orderBy: { fundName: "asc" },
    take: 50,
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
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#27272A] text-[#71717A] text-left">
              <th className="pb-2 pr-4">ID</th>
              <th className="pb-2 pr-4">Fund Name</th>
              <th className="pb-2 pr-4">Manager</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2">Size</th>
            </tr>
          </thead>
          <tbody>
            {funds.map((fund) => (
              <tr key={fund.id} className="border-b border-[#1a1a1d] hover:bg-[#111113]">
                <td className="py-2 pr-4 text-[#71717A] font-mono text-xs">{fund.legacyId}</td>
                <td className="py-2 pr-4 font-medium">{fund.fundName}</td>
                <td className="py-2 pr-4 text-[#A1A1AA]">{fund.manager.name}</td>
                <td className="py-2 pr-4 text-[#A1A1AA]">{FUND_STATUS_DISPLAY[fund.fundStatus]}</td>
                <td className="py-2 text-[#A1A1AA]">{fund.size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
