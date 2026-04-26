"use client";

import { useTransition, useState } from "react";

interface DeleteButtonProps {
  deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>;
  id: string;
}

export default function DeleteButton({ deleteAction, id }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1">
        <button
          disabled={isPending}
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
          className="text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-[#1a1a1a] disabled:opacity-50"
        >
          {isPending ? "Deleting..." : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-2 py-1 rounded bg-[#27272A] hover:bg-[#3f3f46] text-[#1a1a1a]"
        >
          Cancel
        </button>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs px-2 py-1 rounded bg-red-600/10 text-red-400 hover:bg-red-600/20"
    >
      Delete
    </button>
  );
}
