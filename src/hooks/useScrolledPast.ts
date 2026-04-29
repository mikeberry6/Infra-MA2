"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Tracks whether a scrollable element has been scrolled past a small threshold
 * (default 4px). Used by drawer-style components to add a subtle bottom-shadow
 * to the sticky header once content begins scrolling beneath it — Attio /
 * Linear pattern for visually anchoring the header on long content.
 */
export function useScrolledPast(
  ref: RefObject<HTMLElement | null>,
  threshold = 4
): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      setScrolled(el.scrollTop > threshold);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [ref, threshold]);

  return scrolled;
}
