import { createElement } from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  pathname: "/Infra-MA2/tracker",
  analytics: vi.fn(),
  speedInsights: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
}));
vi.mock("@vercel/analytics/next", () => ({
  Analytics: (props: unknown) => {
    mocks.analytics(props);
    return null;
  },
}));
vi.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: (props: unknown) => {
    mocks.speedInsights(props);
    return null;
  },
}));

import {
  PublicObservability,
  isPrivateObservabilityPath,
  sanitizeAnalyticsEvent,
  sanitizeSpeedInsightsEvent,
} from "./PublicObservability";

const ORIGIN = "https://research.example";

describe("PublicObservability privacy boundary", () => {
  beforeEach(() => {
    mocks.pathname = "/Infra-MA2/tracker";
    mocks.analytics.mockReset();
    mocks.speedInsights.mockReset();
  });

  it.each([
    "/Infra-MA2/admin/deals/private-record",
    "/Infra-MA2/login",
  ])("does not inject either telemetry SDK on direct private route %s", (pathname) => {
    mocks.pathname = pathname;
    render(createElement(PublicObservability));

    expect(mocks.analytics).not.toHaveBeenCalled();
    expect(mocks.speedInsights).not.toHaveBeenCalled();
  });

  it("mounts both SDKs with event filters on a public route", () => {
    render(createElement(PublicObservability));

    expect(mocks.analytics).toHaveBeenCalledWith(expect.objectContaining({
      beforeSend: expect.any(Function),
    }));
    expect(mocks.speedInsights).toHaveBeenCalledWith(expect.objectContaining({
      beforeSend: expect.any(Function),
    }));
  });

  it("recognizes privileged and authentication routes with or without the application base path", () => {
    expect(isPrivateObservabilityPath("/admin")).toBe(true);
    expect(isPrivateObservabilityPath("/admin/deals")).toBe(true);
    expect(isPrivateObservabilityPath("/login")).toBe(true);
    expect(isPrivateObservabilityPath("/Infra-MA2/admin/funds", "/Infra-MA2")).toBe(true);
    expect(isPrivateObservabilityPath("/Infra-MA2/login", "/Infra-MA2")).toBe(true);
    expect(isPrivateObservabilityPath("/Infra-MA2/tracker", "/Infra-MA2")).toBe(false);
  });

  it("drops analytics events on admin and login routes", () => {
    expect(sanitizeAnalyticsEvent(
      { type: "pageview", url: `${ORIGIN}/Infra-MA2/admin?record=secret#panel` },
      ORIGIN,
      "/Infra-MA2",
    )).toBeNull();
    expect(sanitizeAnalyticsEvent(
      { type: "event", url: `${ORIGIN}/Infra-MA2/login?callbackUrl=%2Fadmin` },
      ORIGIN,
      "/Infra-MA2",
    )).toBeNull();
  });

  it("retains public events while removing queries and fragments", () => {
    expect(sanitizeAnalyticsEvent(
      { type: "pageview", url: `${ORIGIN}/Infra-MA2/tracker?q=private-search#drawer` },
      ORIGIN,
      "/Infra-MA2",
    )).toEqual({
      type: "pageview",
      url: `${ORIGIN}/Infra-MA2/tracker`,
    });
  });

  it("sanitizes public vital URLs and route labels and drops private route identifiers", () => {
    expect(sanitizeSpeedInsightsEvent(
      {
        type: "vital",
        url: `${ORIGIN}/Infra-MA2/funds?q=private`,
        route: "/Infra-MA2/funds?focus=private#drawer",
      },
      ORIGIN,
      "/Infra-MA2",
    )).toEqual({
      type: "vital",
      url: `${ORIGIN}/Infra-MA2/funds`,
      route: "/Infra-MA2/funds",
    });
    expect(sanitizeSpeedInsightsEvent(
      {
        type: "vital",
        url: `${ORIGIN}/Infra-MA2/tracker`,
        route: "/Infra-MA2/admin/[id]?record=private",
      },
      ORIGIN,
      "/Infra-MA2",
    )).toBeNull();
  });

  it("fails closed for malformed and cross-origin telemetry locations", () => {
    expect(sanitizeAnalyticsEvent(
      { type: "pageview", url: "https://outside.example/tracker?q=private" },
      ORIGIN,
      "/Infra-MA2",
    )).toBeNull();
    expect(sanitizeAnalyticsEvent(
      { type: "pageview", url: "/Infra-MA2/tracker\\private" },
      ORIGIN,
      "/Infra-MA2",
    )).toBeNull();
  });
});
