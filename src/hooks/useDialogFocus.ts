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

function branchBelongsToDialog(element: HTMLElement, dialogId: string): boolean {
  if (!dialogId) return false;
  if (
    element.dataset.dialogFocusOwner === dialogId
    || element.dataset.dialogBackdropOwner === dialogId
  ) {
    return true;
  }

  return Array.from(
    element.querySelectorAll<HTMLElement>(
      "[data-dialog-focus-owner], [data-dialog-backdrop-owner]",
    ),
  ).some((candidate) => (
    candidate.dataset.dialogFocusOwner === dialogId
    || candidate.dataset.dialogBackdropOwner === dialogId
  ));
}

/**
 * Make every sibling branch outside the active dialog non-interactive without
 * making an ancestor that contains the dialog itself inert. This works for
 * inline drawers as well as portaled sheets and preserves any pre-existing
 * inert state.
 */
function isolateDialogBackground(dialog: HTMLElement): () => void {
  const changed: HTMLElement[] = [];
  let activeBranch: HTMLElement | null = dialog;

  while (activeBranch && activeBranch !== document.body) {
    const parentElement: HTMLElement | null = activeBranch.parentElement;
    if (!parentElement) break;

    for (const sibling of Array.from(parentElement.children)) {
      if (
        !(sibling instanceof HTMLElement)
        || sibling === activeBranch
        || branchBelongsToDialog(sibling, dialog.id)
        || sibling.inert
      ) {
        continue;
      }
      sibling.inert = true;
      changed.push(sibling);
    }

    activeBranch = parentElement;
  }

  return () => {
    for (const element of changed.reverse()) {
      element.inert = false;
    }
  };
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
    const restoreBackground = isolateDialogBackground(dialog);
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
      const activeElement = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      if (!activeElement || !elements.includes(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreBackground();
      if (previousActive?.isConnected) {
        previousActive.focus();
      } else {
        document.querySelector<HTMLElement>("#main-content")?.focus();
      }
    };
  }, [active, ref]);
}
