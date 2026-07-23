"use client";

import { Button } from "@/components/shared/Button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-[640px] px-4 sm:px-6 py-12">
      <div className="surface px-6 py-7 sm:px-8 sm:py-8">
        <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          Error
        </div>
        <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)] tracking-tight">
          Admin action failed
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
          The requested administration action could not be completed. Retry, or include the error ID below if one is shown.
        </p>
        {error.digest && (
          <p className="mt-3 mono text-[11px] text-[var(--text-tertiary)] tabular-nums">
            ID: {error.digest}
          </p>
        )}
        <div className="mt-5">
          <Button variant="secondary" size="sm" onClick={reset}>
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}
