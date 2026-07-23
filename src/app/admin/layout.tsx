import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAuthorizationError, requireAdmin } from "@/modules/auth/guards";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  try {
    await requireAdmin();
  } catch (error) {
    if (isAuthorizationError(error)) redirect("/login");
    throw error;
  }

  return children;
}
