"use client";

import { useEffect, useState } from "react";
import { withBasePath } from "@/lib/base-path";

export function useCanExport(): boolean {
  const [canExport, setCanExport] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(withBasePath("/api/export-permission"), { credentials: "same-origin" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled) setCanExport(data?.canExport === true);
      })
      .catch(() => {
        if (!cancelled) setCanExport(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return canExport;
}
