import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { normalizeBasePathCallback } from "@/lib/base-path";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-[420px] items-center px-4 sm:px-6 py-12">
      <div className="surface-elevated w-full px-5 py-6 sm:px-6 sm:py-7">
        <div className="mb-5">
          <p className="type-label">
            InfraSight
          </p>
          <h1 className="mt-1 type-page-title">
            Sign in
          </h1>
          <p className="mt-1 type-meta">
            Use your admin or analyst account to continue.
          </p>
        </div>
        <LoginForm callbackUrl={normalizeBasePathCallback(callbackUrl)} />
      </div>
    </div>
  );
}
