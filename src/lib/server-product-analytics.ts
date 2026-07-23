import { track } from "@vercel/analytics/server";
import {
  sanitizeProductEvent,
  type ProductEventName,
  type ProductEventProperties,
} from "./analytics-contract";

// The Vercel server SDK forwards cookie and x-forwarded-for when they are
// present in the supplied context. Export events need neither. Always pass a
// synthetic, request-independent context so auth cookies, IPs, and arbitrary
// inbound headers can never reach the analytics intake.
const PRIVACY_SAFE_ANALYTICS_HEADERS = Object.freeze({
  "user-agent": "InfraSight-Server-Event/1.0",
  "x-forwarded-for": "",
  cookie: "",
});

export async function trackServerProductEvent<Name extends ProductEventName>(
  name: Name,
  properties: ProductEventProperties[Name],
): Promise<boolean> {
  const event = sanitizeProductEvent(name, properties);
  if (!event) return false;
  try {
    await track(event.name, event.properties, {
      headers: PRIVACY_SAFE_ANALYTICS_HEADERS,
    });
    return true;
  } catch {
    // Analytics must never block or alter the owning product operation.
    return false;
  }
}
