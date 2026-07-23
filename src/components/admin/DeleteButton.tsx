"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/shared/Button";
import { FormMessage } from "@/components/shared/FormControls";
import { invalidateDetailCache, type DetailCacheEntity } from "@/lib/detail-cache-events";

interface DeleteButtonProps {
  deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>;
  id: string;
  entity: DetailCacheEntity;
  status: string;
}

export default function DeleteButton({ deleteAction, id, entity, status }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status !== "DRAFT") return null;

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          variant="danger"
          size="sm"
          loading={isPending}
          onClick={() => {
            startTransition(async () => {
              setError(null);
              const result = await deleteAction(id);
              if (!result.success) {
                setError(result.error || "Delete failed");
                setConfirming(false);
              } else {
                invalidateDetailCache(entity, id);
              }
            });
          }}
        >
          {isPending ? "Deleting…" : "Confirm"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
        {error && <FormMessage tone="error" className="max-w-64 whitespace-normal">{error}</FormMessage>}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button variant="ghost" size="sm" onClick={() => { setError(null); setConfirming(true); }}>
        Delete
      </Button>
      {error && <FormMessage tone="error" className="max-w-64 whitespace-normal">{error}</FormMessage>}
    </div>
  );
}
