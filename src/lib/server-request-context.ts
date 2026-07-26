import { headers } from "next/headers";
import { getRequestIdFromHeaders } from "@/lib/server-log";

/** Returns the middleware request ID when called inside a Next server request. */
export async function currentServerRequestId(): Promise<string | undefined> {
  try {
    return getRequestIdFromHeaders(await headers());
  } catch {
    // Build-time rendering and standalone tasks may not have a request store.
    return undefined;
  }
}
