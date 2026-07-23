"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useId,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

const FILTER_PORTAL_OVERLAY_Z_INDEX = 10_010;
const FILTER_PORTAL_POPUP_Z_INDEX = 10_020;

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
  const [activeIndex, setActiveIndex] = useState(0);
  const [dialogOwnerId, setDialogOwnerId] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listboxId = useId();
  const [pos, setPos] = useState<{ top: number; left?: number; right?: number }>({ top: 0 });

  const focusOption = useCallback((index: number) => {
    if (options.length === 0) return;
    const nextIndex = (index + options.length) % options.length;
    setActiveIndex(nextIndex);
    optionRefs.current[nextIndex]?.focus();
  }, [options.length]);

  const closeMenu = useCallback((restoreFocus = true) => {
    setIsOpen(false);
    if (restoreFocus) buttonRef.current?.focus({ preventScroll: true });
  }, []);

  const openMenu = useCallback((preferredIndex?: number) => {
    const selectedIndex = options.findIndex((option) => selected.has(option));
    const nextIndex = preferredIndex ?? (selectedIndex >= 0 ? selectedIndex : 0);
    const owner = buttonRef.current?.closest<HTMLElement>("[role='dialog'][id]");
    setDialogOwnerId(owner?.id ?? null);
    setActiveIndex(nextIndex);
    setIsOpen(true);
  }, [options, selected]);

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
    optionRefs.current[activeIndex]?.focus();
    const handleScroll = (e: Event) => {
      const target = e.target;
      if (target instanceof Node && listboxRef.current?.contains(target)) return;
      // A fixed popup detaches visually if its trigger's dialog or any other
      // page container scrolls. Close it without pulling focus back to the
      // trigger; scrolling the popup's own option list remains available.
      closeMenu(false);
    };
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", calcPos);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", calcPos);
    };
  }, [activeIndex, calcPos, closeMenu, isOpen]);

  const focusAdjacentToTrigger = useCallback((reverse: boolean) => {
    const trigger = buttonRef.current;
    if (!trigger) return;
    const dialog = trigger.closest<HTMLElement>("[role='dialog']");
    const scope = dialog ?? document.body;
    const candidates = Array.from(scope.querySelectorAll<HTMLElement>(
      "a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])",
    )).filter((element) => (
      !element.closest("[data-multiselect-popup]") && element.getClientRects().length > 0
    ));
    const triggerIndex = candidates.indexOf(trigger);
    const fallback = dialog
      ? candidates[reverse ? candidates.length - 1 : 0]
      : trigger;
    const target = candidates[triggerIndex + (reverse ? -1 : 1)] ?? fallback;
    setIsOpen(false);
    target?.focus();
  }, []);

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (isOpen) focusOption(activeIndex + 1);
      else openMenu();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (isOpen) focusOption(activeIndex - 1);
      else openMenu(Math.max(0, options.length - 1));
    } else if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
    } else if (event.key === "Tab" && isOpen) {
      setIsOpen(false);
    }
  };

  const handleOptionKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusOption(options.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
    } else if (event.key === "Tab") {
      event.preventDefault();
      event.stopPropagation();
      focusAdjacentToTrigger(event.shiftKey);
    }
  };

  const isActive = selected.size > 0;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        ref={buttonRef}
        onClick={() => (isOpen ? closeMenu(false) : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={`Filter by ${label}`}
        className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md type-meta font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 ${
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
            data-multiselect-overlay
            className="fixed inset-0"
            style={{ zIndex: FILTER_PORTAL_OVERLAY_Z_INDEX }}
            onClick={() => closeMenu()}
          />
          <div
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-label={`${label} options`}
            aria-multiselectable="true"
            data-multiselect-popup
            data-dialog-focus-owner={dialogOwnerId ?? undefined}
            className="fixed w-60 max-h-72 overflow-y-auto p-1 surface-overlay animate-fade-in"
            style={{
              zIndex: FILTER_PORTAL_POPUP_Z_INDEX,
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
              options.map((option, index) => {
                const color = getColor(option);
                const isSelected = selected.has(option);
                return (
                  <button
                    key={option}
                    ref={(element) => {
                      optionRefs.current[index] = element;
                    }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={index === activeIndex ? 0 : -1}
                    onFocus={() => setActiveIndex(index)}
                    onKeyDown={(event) => handleOptionKeyDown(event, index)}
                    onClick={() => {
                      setActiveIndex(index);
                      onToggle(option);
                    }}
                    className={`w-full flex items-center gap-2 h-8 px-2 rounded-sm type-meta text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)] ${
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
