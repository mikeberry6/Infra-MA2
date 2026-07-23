"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/shared/Button";

interface DeleteButtonProps {
  deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>;
  id: string;
  entity: "deal" | "fund" | "company";
  status: string;
}

export default function DeleteButton({ deleteAction, id, status }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status !== "DRAFT") return null;

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5">
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
              }
            });
          }}
        >
          {isPending ? "Deleting…" : "Confirm"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
        {error && (
          <span className="text-[11px] text-[#dc2626]">{error}</span>
        )}
      </span>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
      Delete
    </Button>
  );
}
