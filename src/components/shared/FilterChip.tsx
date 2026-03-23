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
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-micro font-medium transition-colors hover:opacity-80"
      style={{
        color,
        backgroundColor: `${color}1a`,
        border: `1px solid ${color}33`,
      }}
    >
      {label}
      <X className="h-3 w-3" />
    </button>
  );
}
