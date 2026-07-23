"use client";

import { Button } from "@/components/shared/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-[640px] px-4 sm:px-6 py-16">
      <div className="surface px-6 py-8 sm:px-8 sm:py-10">
        <div className="type-label">
          Error
        </div>
        <h1 className="mt-1 type-page-title">
          Something went wrong
        </h1>
        <p className="mt-2 type-meta">
          An unexpected error occurred while loading this page.
        </p>
        {error.digest && (
          <p className="mt-3 type-micro mono tabular-nums">
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
