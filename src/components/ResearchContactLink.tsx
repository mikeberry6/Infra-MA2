"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import type { ProductEventProperties } from "@/lib/analytics-contract";
import { trackProductEvent } from "@/lib/product-analytics";

export function ResearchContactLink({
  surface,
  subject,
  children,
  onClick,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  surface: ProductEventProperties["research_contact_initiated"]["surface"];
  subject?: string;
  children: ReactNode;
}) {
  const href = subject
    ? `mailto:research@infrasight.com?subject=${encodeURIComponent(subject)}`
    : "mailto:research@infrasight.com";
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          trackProductEvent("research_contact_initiated", { surface });
        }
      }}
    >
      {children}
    </a>
  );
}
