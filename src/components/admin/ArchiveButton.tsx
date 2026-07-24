"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/shared/Button";
import { FormMessage } from "@/components/shared/FormControls";
import { invalidateDetailCache, type DetailCacheEntity } from "@/lib/detail-cache-events";

interface ArchiveButtonProps {
  archiveAction: (id: string) => Promise<{ success: boolean; error?: string }>;
  id: string;
  entity: DetailCacheEntity;
  disabled?: boolean;
}

export default function ArchiveButton({ archiveAction, id, entity, disabled = false }: ArchiveButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (disabled) {
    return <span className="type-micro text-[var(--text-tertiary)]">Archived</span>;
  }

  if (!confirming) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
          Archive
        </Button>
        {error && <FormMessage tone="error" className="max-w-64 whitespace-normal">{error}</FormMessage>}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button
        variant="secondary"
        size="sm"
        loading={isPending}
        onClick={() => {
          startTransition(async () => {
            setError(null);
            const result = await archiveAction(id);
            if (!result.success) {
              setError(result.error || "Archive failed");
              setConfirming(false);
            } else {
              invalidateDetailCache(entity, id);
            }
          });
        }}
      >
        Confirm archive
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Cancel
      </Button>
      {error && <FormMessage tone="error" className="max-w-64 whitespace-normal">{error}</FormMessage>}
    </div>
  );
}
