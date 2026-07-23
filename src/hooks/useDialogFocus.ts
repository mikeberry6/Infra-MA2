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

function focusIsOwnedByDialog(dialog: HTMLElement, activeElement: Element | null): boolean {
  if (!activeElement) return false;
  if (dialog.contains(activeElement)) return true;
  if (!dialog.id) return false;
  return Array.from(document.querySelectorAll<HTMLElement>("[data-dialog-focus-owner]"))
    .some((scope) => scope.dataset.dialogFocusOwner === dialog.id && scope.contains(activeElement));
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
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
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
      if (!focusIsOwnedByDialog(dialog, document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
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
      document.body.style.paddingRight = previousPaddingRight;
      if (previousActive?.isConnected) {
        previousActive.focus();
      } else {
        document.querySelector<HTMLElement>("#main-content")?.focus();
      }
    };
  }, [active, ref]);
}
