export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getUserRoleColor } from "@/lib/colors";
import { formatDate } from "@/lib/format";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { adminPagination } from "@/lib/admin-pagination";

export const metadata = { title: "Admin · Users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;
  const total = await prisma.user.count();
  const { page, totalPages, skip, take } = adminPagination(rawPage, total);
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    skip,
    take,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-2"
        >
          <ArrowLeft className="h-3 w-3" /> Admin
        </Link>
        <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
          Users
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          <span className="mono tabular-nums">{total.toLocaleString()}</span> total
        </p>
      </div>

      <div className="surface overflow-hidden">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-[var(--bg-app)] border-b border-[var(--border)]">
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Email</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Name</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Role</th>
              <th className="text-left px-3 py-2 text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-subtle)] transition-colors">
                <td className="px-3 py-2.5 text-[13px] font-medium text-[var(--text-primary)]">{user.email}</td>
                <td className="px-3 py-2.5 text-[12px] text-[var(--text-secondary)]">{user.name || "—"}</td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                    <span aria-hidden className="h-[5px] w-[5px] rounded-full" style={{ backgroundColor: getUserRoleColor(user.role) }} />
                    {user.role}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-[11px] mono tabular-nums text-[var(--text-tertiary)]">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="py-12 text-center text-sm text-[var(--text-tertiary)]">No users yet.</div>
        )}
      </div>
      <AdminPagination pathname="/admin/users" page={page} totalPages={totalPages} totalItems={total} />
    </div>
  );
}
