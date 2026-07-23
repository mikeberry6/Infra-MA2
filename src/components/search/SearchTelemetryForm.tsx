"use client";

import type { ReactNode } from "react";
import { trackProductEvent } from "@/lib/product-analytics";

export function SearchTelemetryForm({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <form
      method="get"
      className={className}
      onSubmit={() => trackProductEvent("search_submitted", { surface: "search_page" })}
    >
      {children}
    </form>
  );
}
