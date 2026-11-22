"use client";

import { useEffect, useState } from "react";

export function useCanExport(): boolean {
  const [canExport, setCanExport] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/export-permission", { credentials: "same-origin" })
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
