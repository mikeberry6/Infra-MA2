"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/shared/Button";

interface RecordWorkflowButtonProps {
  id: string;
  entity: "deal" | "fund" | "company";
  status: string;
  submitForReview: (id: string) => Promise<{ success: boolean; error?: string }>;
  publish: (id: string) => Promise<{ success: boolean; error?: string }>;
  verify: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export default function RecordWorkflowButton({
  id,
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
          });
        }}
      >
        {isPublished ? "Verify" : isReview ? "Publish" : "Submit review"}
      </Button>
      {error && <span className="max-w-64 whitespace-normal text-[11px] text-[#dc2626]">{error}</span>}
    </div>
  );
}
