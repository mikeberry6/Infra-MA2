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
    const panelW = 240;
    if (align === "right") {
      setPos({ top: rect.bottom + 4, right: Math.max(0, window.innerWidth - rect.right) });
    } else {
      const left = Math.min(rect.left, window.innerWidth - panelW - 8);
      setPos({ top: rect.bottom + 4, left: Math.max(0, left) });
    }
  }, [align]);

  useEffect(() => {
    if (!isOpen) return;
    calcPos();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const handleScroll = (e: Event) => {
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

  const isActive = selected.size > 0;

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Filter by ${label}`}
        className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md type-meta font-medium transition-colors whitespace-nowrap focus:outline-none ${
          isOpen
            ? "bg-[var(--bg-surface)] border border-[var(--accent)] text-[var(--text-primary)] shadow-[0_0_0_2px_var(--accent-soft)]"
            : isActive
              ? "bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-[var(--text-primary)] hover:border-[var(--accent)]"
              : "bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        }`}
      >
        <span>{label}</span>
        {isActive && (
          <span className="inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded type-label normal-case bg-[var(--accent)] text-[var(--text-on-accent)] tabular-nums">
            {selected.size}
          </span>
        )}
        <ChevronDown
          className={`h-3 w-3 text-[var(--text-tertiary)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
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
            className="fixed w-60 max-h-72 overflow-y-auto p-1 surface-overlay animate-fade-in"
            style={{
              zIndex: 9999,
              top: pos.top,
              ...(pos.left != null ? { left: pos.left } : {}),
              ...(pos.right != null ? { right: pos.right } : {}),
            }}
          >
            {options.length === 0 ? (
              <div className="px-2 py-2 type-meta text-[var(--text-tertiary)]">
                No options
              </div>
            ) : (
              options.map((option) => {
                const color = getColor(option);
                const isSelected = selected.has(option);
                return (
                  <button
                    key={option}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => onToggle(option)}
                    className={`w-full flex items-center gap-2 h-8 px-2 rounded-sm type-meta text-left transition-colors ${
                      isSelected
                        ? "bg-[var(--bg-hover)] text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="h-[5px] w-[5px] rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="truncate flex-1">{option}</span>
                    {isSelected && (
                      <Check className="h-3 w-3 text-[var(--accent)] shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
