"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/shared/Button";
import { FormMessage } from "@/components/shared/FormControls";
import { invalidateDetailCache, type DetailCacheEntity } from "@/lib/detail-cache-events";

interface RecordWorkflowButtonProps {
  id: string;
  entity: DetailCacheEntity;
  status: string;
  submitForReview: (id: string) => Promise<{ success: boolean; error?: string }>;
  publish: (id: string) => Promise<{ success: boolean; error?: string }>;
  verify: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export default function RecordWorkflowButton({
  id,
  entity,
  status,
  submitForReview,
  publish,
  verify,
}: RecordWorkflowButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (status !== "DRAFT" && status !== "IN_REVIEW" && status !== "PUBLISHED") return null;
  const isReview = status === "IN_REVIEW";
  const isPublished = status === "PUBLISHED";
  const action = isPublished ? verify : isReview ? publish : submitForReview;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button
        variant={isReview ? "primary" : "secondary"}
        size="sm"
        loading={isPending}
        onClick={() => {
          startTransition(async () => {
            setError(null);
            const result = await action(id);
            if (!result.success) setError(result.error || "Workflow update failed");
            else invalidateDetailCache(entity, id);
          });
        }}
      >
        {isPublished ? "Verify" : isReview ? "Publish" : "Submit review"}
      </Button>
      {error && <FormMessage tone="error" className="max-w-64 whitespace-normal">{error}</FormMessage>}
    </div>
  );
}
