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
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] border text-xs-dense font-medium transition-colors whitespace-nowrap ${
          selected.size > 0
            ? "border-[rgba(0,122,77,0.3)] bg-[rgba(0,122,77,0.06)] text-[#007a4d]"
            : "border-[#d7d7d7] bg-white text-[#6b6b6b] hover:border-[#999999] hover:text-[#111111] hover:bg-[#fafaf9]"
        }`}
      >
        <span>{label}</span>
        {selected.size > 0 && (
          <span className="font-mono text-micro">{selected.size}</span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
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
            className="absolute top-full left-0 mt-1 w-64 max-h-64 overflow-y-auto rounded-[4px] border border-[#d7d7d7] bg-white shadow-lg"
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
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm-dense text-left transition-colors ${
                    isSelected ? "bg-[#f5f5f3]" : "hover:bg-[#f5f5f3]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-[3px] border flex items-center justify-center shrink-0 ${
                      isSelected ? "border-[#007a4d] bg-[#007a4d]" : "border-[#c4c4c4]"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span
                    className="truncate"
                    style={{ color: isSelected ? color : "#6b6b6b" }}
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
