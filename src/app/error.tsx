"use client";

import { useEffect } from "react";
import { Button } from "@/components/shared/Button";

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
    <div className="mx-auto max-w-[640px] px-4 sm:px-6 py-16">
      <div className="surface px-6 py-8 sm:px-8 sm:py-10">
        <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          Error
        </div>
        <h1 className="mt-1 text-xl font-semibold text-[var(--text-primary)] tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
          An unexpected error occurred while loading this page.
        </p>
        {error.digest && (
          <p className="mt-3 mono text-[11px] text-[var(--text-tertiary)] tabular-nums">
            ID: {error.digest}
          </p>
        )}
        <div className="mt-6">
          <Button variant="primary" size="md" onClick={reset}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
