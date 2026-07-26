"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

export type TrackedDrawerEntity = "deal" | "fund" | "company";

/** Counts one logical drawer selection, independent of list object identity. */
export function useTrackDrawerOpen(
  entity: TrackedDrawerEntity,
  selectedId: string | null | undefined,
): void {
  useEffect(() => {
    if (selectedId) track("drawer_opened", { entity });
  }, [entity, selectedId]);
}
