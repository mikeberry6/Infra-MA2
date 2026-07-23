"use client";

import { useLayoutEffect } from "react";
import { measureDrawerShell, type DrawerKind } from "@/lib/drawer-performance";

/** Measures the click-to-committed-shell interval without waiting for detail data. */
export function useDrawerShellTiming(kind: DrawerKind, recordId: string): void {
  useLayoutEffect(() => {
    measureDrawerShell(kind);
  }, [kind, recordId]);
}
