"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[720px] px-4 sm:px-6 py-12">
      <div className="border border-black/[0.08] bg-white p-6">
        <h2 className="text-base font-semibold text-[#1a1a1a]">Admin action failed</h2>
        <p className="mt-2 text-sm text-[#555]">{error.message || "Unknown error"}</p>
        <button
          onClick={reset}
          className="mt-4 inline-flex h-8 items-center px-3 text-[11px] font-medium bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
