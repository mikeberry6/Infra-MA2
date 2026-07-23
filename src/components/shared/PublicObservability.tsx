"use client";

import { Analytics, type BeforeSendEvent as AnalyticsBeforeSendEvent } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { usePathname } from "next/navigation";

type SpeedInsightsBeforeSendEvent = {
  type: "vital";
  url: string;
  route?: string;
};

function normalizedBasePath(basePath: string): string {
  const trimmed = basePath.trim().replace(/\/+$/, "");
  return trimmed && trimmed.startsWith("/") ? trimmed : "";
}

function applicationPath(pathname: string, basePath: string): string {
  const normalized = normalizedBasePath(basePath);
  if (!normalized) return pathname;
  if (pathname === normalized) return "/";
  if (pathname.startsWith(`${normalized}/`)) return pathname.slice(normalized.length);
  return pathname;
}

export function isPrivateObservabilityPath(pathname: string, basePath = ""): boolean {
  const path = applicationPath(pathname, basePath);
  return path === "/admin"
    || path.startsWith("/admin/")
    || path === "/login"
    || path.startsWith("/login/");
}

function sanitizeLocation(
  value: string,
  origin: string,
  basePath: string,
): { url: string; pathname: string } | null {
  if (!value || value.includes("\\") || /[\u0000-\u001F\u007F]/.test(value)) return null;

  try {
    const applicationOrigin = new URL(origin).origin;
    const parsed = new URL(value, applicationOrigin);
    if (
      (parsed.protocol !== "http:" && parsed.protocol !== "https:")
      || parsed.origin !== applicationOrigin
      || isPrivateObservabilityPath(parsed.pathname, basePath)
    ) {
      return null;
    }
    return {
      url: `${applicationOrigin}${parsed.pathname}`,
      pathname: parsed.pathname,
    };
  } catch {
    return null;
  }
}

export function sanitizeAnalyticsEvent(
  event: AnalyticsBeforeSendEvent,
  origin: string,
  basePath = "",
): AnalyticsBeforeSendEvent | null {
  const location = sanitizeLocation(event.url, origin, basePath);
  return location ? { ...event, url: location.url } : null;
}

export function sanitizeSpeedInsightsEvent(
  event: SpeedInsightsBeforeSendEvent,
  origin: string,
  basePath = "",
): SpeedInsightsBeforeSendEvent | null {
  const location = sanitizeLocation(event.url, origin, basePath);
  if (!location) return null;

  if (!event.route) return { ...event, url: location.url };
  const route = sanitizeLocation(event.route, origin, basePath);
  if (!route) return null;
  return { ...event, url: location.url, route: route.pathname };
}

function currentOrigin(): string {
  return window.location.origin;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/Infra-MA2";

/**
 * Public-only, query-free automatic telemetry. Fixed custom events continue
 * through the same boundary, while login/admin navigation and route labels
 * are discarded before Vercel receives them.
 */
export function PublicObservability() {
  const pathname = usePathname();
  if (!pathname || isPrivateObservabilityPath(pathname, basePath)) return null;

  return (
    <>
      <Analytics
        beforeSend={(event) => sanitizeAnalyticsEvent(event, currentOrigin(), basePath)}
      />
      <SpeedInsights
        beforeSend={(event) => sanitizeSpeedInsightsEvent(event, currentOrigin(), basePath)}
      />
    </>
  );
}
