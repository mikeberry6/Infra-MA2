"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function MarketSnapshotSection({ children }: { children: ReactNode }) {
  const disclosure = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (disclosure.current && window.matchMedia?.("(min-width: 1024px)")?.matches) {
      disclosure.current.open = true;
    }
  }, []);

  return (
    <section className="mt-5 scroll-mt-20" id="market-snapshot" aria-labelledby="market-snapshot-title">
      <h2 id="market-snapshot-title" className="sr-only">Market snapshot</h2>
      <details ref={disclosure} className="group surface">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-md px-4 py-2 [&::-webkit-details-marker]:hidden">
          <span className="type-section-title">Market snapshot</span>
          <ChevronDown aria-hidden className="h-4 w-4 shrink-0 text-[var(--text-secondary)] transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t border-[var(--border)] px-4 py-5 sm:px-5">{children}</div>
      </details>
    </section>
  );
}
