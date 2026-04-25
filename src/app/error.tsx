"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[720px] px-4 sm:px-6 py-16">
      <div className="border border-black/[0.08] bg-white p-8">
        <h1 className="text-xl font-semibold text-[#1a1a1a]">Something went wrong</h1>
        <p className="mt-2 text-sm text-[#555]">
          An unexpected error occurred while loading this page.
        </p>
        {error.digest && (
          <p className="mt-2 text-[11px] font-mono text-[#999]">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="mt-6 inline-flex h-9 items-center px-4 text-[12px] font-medium bg-[#008253] text-white hover:bg-[#006e46] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
