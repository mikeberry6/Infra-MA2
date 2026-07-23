"use client";

import { track } from "@vercel/analytics";
import {
  sanitizeProductEvent,
  type ProductEventName,
  type ProductEventProperties,
} from "./analytics-contract";

export function trackProductEvent<Name extends ProductEventName>(
  name: Name,
  properties: ProductEventProperties[Name],
): boolean {
  const event = sanitizeProductEvent(name, properties);
  if (!event) return false;
  try {
    track(event.name, event.properties);
    return true;
  } catch {
    // Analytics must never interrupt navigation or an owning user action.
    return false;
  }
}
