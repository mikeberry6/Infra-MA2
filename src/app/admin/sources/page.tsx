export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Admin - Sources" };

export default async function AdminSourcesPage() {
  const sources = await prisma.source.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      _count: { select: { citations: true } },
    },
  });

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-sm text-[#71717A] hover:text-white mb-2 inline-block">&larr; Back to Admin</Link>
            <h1 className="text-2xl font-bold">Sources</h1>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#27272A] text-[#71717A] text-left">
              <th className="pb-2 pr-4">Label</th>
              <th className="pb-2 pr-4">Type</th>
              <th className="pb-2 pr-4">Citations</th>
              <th className="pb-2">URL</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.id} className="border-b border-[#1a1a1d] hover:bg-[#111113]">
                <td className="py-2 pr-4 font-medium max-w-xs truncate">{source.label || "—"}</td>
                <td className="py-2 pr-4 text-[#A1A1AA]">{source.type}</td>
                <td className="py-2 pr-4 text-[#A1A1AA]">{source._count.citations}</td>
                <td className="py-2 text-[#71717A] text-xs max-w-sm truncate">
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#818CF8]">
                    {source.url}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
