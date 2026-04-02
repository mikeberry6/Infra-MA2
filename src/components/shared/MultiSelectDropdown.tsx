"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export function MultiSelectDropdown({
  label,
  options,
  selected,
  onToggle,
  getColor,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  getColor: (value: string) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Filter by ${label}`}
        className={`flex items-center gap-1 h-full px-2 text-[11px] font-medium transition-colors whitespace-nowrap ${
          selected.size > 0
            ? "text-[#008253] font-semibold"
            : "text-[#555] hover:text-[#1a1a1a]"
        }`}
      >
        <span>{label}</span>
        {selected.size > 0 && (
          <span className="font-mono text-[10px] bg-[#008253] text-white w-[16px] h-[16px] flex items-center justify-center text-[9px] font-bold">
            {selected.size}
          </span>
        )}
        <ChevronDown className={`h-[10px] w-[10px] opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => setIsOpen(false)}
          />
          <div
            role="listbox"
            aria-label={`${label} options`}
            className="absolute top-full left-0 mt-0 w-56 max-h-56 overflow-y-auto border border-black/[0.08] bg-white"
            style={{ zIndex: 9999 }}
          >
            {options.map((option) => {
              const color = getColor(option);
              const isSelected = selected.has(option);
              return (
                <button
                  key={option}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onToggle(option)}
                  className={`w-full flex items-center gap-2 px-2 py-[5px] text-[11px] text-left transition-colors border-b border-[#f0f0f0] last:border-b-0 ${
                    isSelected ? "bg-[#f5f5f5]" : "hover:bg-[#fafafa]"
                  }`}
                >
                  <div
                    className={`w-3 h-3 border flex items-center justify-center shrink-0 ${
                      isSelected ? "border-[#008253] bg-[#008253]" : "border-[#c4c4c4]"
                    }`}
                  >
                    {isSelected && <Check className="h-2 w-2 text-white" />}
                  </div>
                  <span
                    className="truncate"
                    style={{ color: isSelected ? color : "#555" }}
                  >
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
