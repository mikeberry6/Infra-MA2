"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

export function MultiSelectDropdown({
  label,
  options,
  selected,
  onToggle,
  getColor,
  align = "left",
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  getColor: (value: string) => string;
  align?: "left" | "right";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left?: number; right?: number }>({ top: 0 });

  const calcPos = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const panelW = 224; // w-56 = 14rem = 224px
    if (align === "right") {
      setPos({ top: rect.bottom, right: Math.max(0, window.innerWidth - rect.right) });
    } else {
      const left = Math.min(rect.left, window.innerWidth - panelW - 8);
      setPos({ top: rect.bottom, left: Math.max(0, left) });
    }
  }, [align]);

  useEffect(() => {
    if (!isOpen) return;
    calcPos();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const handleScroll = (e: Event) => {
      // Only close on page-level scrolls, not horizontal filter bar scrolls
      const t = e.target;
      if (t === document || t === document.documentElement || t === window) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, calcPos]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
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

      {isOpen && createPortal(
        <>
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => setIsOpen(false)}
          />
          <div
            role="listbox"
            aria-label={`${label} options`}
            className="fixed w-56 max-h-56 overflow-y-auto border border-black/[0.08] bg-white"
            style={{
              zIndex: 9999,
              top: pos.top,
              ...(pos.left != null ? { left: pos.left } : {}),
              ...(pos.right != null ? { right: pos.right } : {}),
            }}
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
        </>,
        document.body
      )}
    </div>
  );
}
