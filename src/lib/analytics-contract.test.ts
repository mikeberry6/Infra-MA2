import { describe, expect, it } from "vitest";
import {
  redactTelemetryEvent,
  redactTelemetryUrl,
  sanitizeProductEvent,
} from "./analytics-contract";

describe("product analytics contract", () => {
  it("accepts only the approved finite event properties", () => {
    expect(sanitizeProductEvent("drawer_opened", { entity: "deal" })).toEqual({
      name: "drawer_opened",
      properties: { entity: "deal" },
    });
    expect(sanitizeProductEvent("filter_applied", { entity: "deals", filter: "sector" })).not.toBeNull();
    expect(sanitizeProductEvent("filter_applied", { entity: "funds", filter: "size" })).not.toBeNull();
  });

  it("rejects free text, unknown properties, and unknown events", () => {
    expect(sanitizeProductEvent("drawer_opened", { entity: "deal", id: "private-id" })).toBeNull();
    expect(sanitizeProductEvent("search_submitted", { surface: "Brookfield" })).toBeNull();
    expect(sanitizeProductEvent("record_viewed", { entity: "deal" })).toBeNull();
  });
});

describe("telemetry URL redaction", () => {
  it("removes all query and hash data", () => {
    expect(redactTelemetryUrl("/Infra-MA2/search?q=Brookfield#results")).toBe("/Infra-MA2/search");
    expect(redactTelemetryUrl("https://example.com/Infra-MA2/tracker?focus=private-id")).toBe(
      "https://example.com/Infra-MA2/tracker",
    );
  });

  it("collapses dynamic admin paths while retaining the configured base path", () => {
    expect(redactTelemetryUrl("/Infra-MA2/admin/companies/private-id/edit?focus=audit-id")).toBe(
      "/Infra-MA2/admin",
    );
    expect(redactTelemetryEvent({ type: "pageview", url: "/admin/users/private-id" })).toEqual({
      type: "pageview",
      url: "/admin",
    });
  });

  it("fails closed for malformed URLs", () => {
    expect(redactTelemetryUrl("https://[invalid")).toBe("/");
  });
});
