"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function visibleFocusableElements(container: HTMLElement): HTMLElement[] {
  const scopes = [container];
  if (container.id) {
    const ownedScopes = Array.from(document.querySelectorAll<HTMLElement>("[data-dialog-focus-owner]"))
      .filter((scope) => scope.dataset.dialogFocusOwner === container.id);
    scopes.push(...ownedScopes);
  }

  return Array.from(new Set(
    scopes.flatMap((scope) => Array.from(scope.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))),
  ))
    .filter((element) => !element.hasAttribute("disabled") && element.getClientRects().length > 0);
}

export function useDialogFocus(ref: RefObject<HTMLElement | null>, active = true) {
  useEffect(() => {
    if (!active) return;
    const dialog = ref.current;
    if (!dialog) return;

    const previousActive = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusables = visibleFocusableElements(dialog);
    (focusables[0] ?? dialog).focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const elements = visibleFocusableElements(dialog);
      if (elements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousActive?.isConnected) {
        previousActive.focus();
      } else {
        document.querySelector<HTMLElement>("#main-content")?.focus();
      }
    };
  }, [active, ref]);
}
