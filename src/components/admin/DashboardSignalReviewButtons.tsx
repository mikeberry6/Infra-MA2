"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/shared/Button";
import { FormMessage } from "@/components/shared/FormControls";
import {
  approveDashboardSignal,
  rejectDashboardSignal,
} from "@/modules/dashboard/admin-actions";

export function DashboardSignalReviewButtons({
  id,
  contentHash,
}: {
  id: string;
  contentHash: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: typeof approveDashboardSignal) => {
    startTransition(async () => {
      setError(null);
      const result = await action(id, contentHash);
      if (!result.success) setError(result.error || "Review failed.");
      else router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button
        variant="primary"
        size="sm"
        loading={isPending}
        onClick={() => run(approveDashboardSignal)}
      >
        Approve
      </Button>
      <Button variant="secondary" size="sm" disabled={isPending} onClick={() => run(rejectDashboardSignal)}>
        Reject
      </Button>
      {error && <FormMessage tone="error" className="max-w-64 whitespace-normal">{error}</FormMessage>}
    </div>
  );
}
