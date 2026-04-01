"use client";

import { X } from "lucide-react";

export function FilterChip({
  label,
  color,
  onRemove,
}: {
  label: string;
  color: string;
  onRemove: () => void;
}) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-0.5 px-1.5 py-0 text-[10px] font-medium transition-colors hover:opacity-70 border"
      style={{
        color: "#555",
        backgroundColor: `${color}06`,
        borderColor: `${color}20`,
      }}
    >
      {label}
      <X className="h-2 w-2 opacity-60" />
    </button>
  );
}
