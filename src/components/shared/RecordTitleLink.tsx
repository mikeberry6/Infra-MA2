"use client";

import type { MouseEvent, ReactNode } from "react";
import { withBasePath } from "@/lib/base-path";

export function RecordTitleLink({
  href,
  onOpen,
  children,
  className = "",
}: {
  href: string;
  onOpen?: () => void;
  children: ReactNode;
  className?: string;
}) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!onOpen || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    onOpen();
  }

  return (
    <a
      href={withBasePath(href)}
      onClick={handleClick}
      aria-haspopup={onOpen ? "dialog" : undefined}
      data-research-event={onOpen ? "record_open" : undefined}
      className={`font-semibold transition-colors hover:text-[var(--accent)] hover:underline ${className}`}
    >
      {children}
    </a>
  );
}
