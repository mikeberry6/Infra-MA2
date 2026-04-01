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
      className="inline-flex items-center gap-1 px-1 py-0 text-[10px] font-medium transition-colors hover:opacity-80"
      style={{
        color: "#444444",
        backgroundColor: `${color}08`,
        border: `1px solid ${color}15`,
      }}
    >
      {label}
      <X className="h-2.5 w-2.5" />
    </button>
  );
}
