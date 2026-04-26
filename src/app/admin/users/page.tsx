export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Admin - Users" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-[#f3f3f3] text-[#1a1a1a] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-sm text-[#71717A] hover:text-[#1a1a1a] mb-2 inline-block">&larr; Back to Admin</Link>
            <h1 className="text-2xl font-bold">Users</h1>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/[0.08] text-[#71717A] text-left">
              <th className="pb-2 pr-4">Email</th>
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Role</th>
              <th className="pb-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-[#1a1a1d] hover:bg-white">
                <td className="py-2 pr-4 font-medium">{user.email}</td>
                <td className="py-2 pr-4 text-[#A1A1AA]">{user.name || "—"}</td>
                <td className="py-2 pr-4">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    user.role === "ADMIN" ? "bg-red-500/10 text-red-400" :
                    user.role === "ANALYST" ? "bg-blue-500/10 text-blue-400" :
                    "bg-zinc-500/10 text-zinc-400"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-2 text-[#71717A]">{user.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
