import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clientTrack: vi.fn(),
  serverTrack: vi.fn(),
}));

vi.mock("@vercel/analytics", () => ({ track: mocks.clientTrack }));
vi.mock("@vercel/analytics/server", () => ({ track: mocks.serverTrack }));

import { trackProductEvent } from "./product-analytics";
import { trackServerProductEvent } from "./server-product-analytics";

describe("product analytics facades", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.serverTrack.mockResolvedValue(undefined);
  });

  it("sends only a validated client event", () => {
    expect(trackProductEvent("drawer_opened", { entity: "fund" })).toBe(true);
    expect(mocks.clientTrack).toHaveBeenCalledWith("drawer_opened", { entity: "fund" });
  });

  it("never interrupts a browser action when telemetry is unavailable", () => {
    mocks.clientTrack.mockImplementationOnce(() => {
      throw new Error("telemetry unavailable");
    });
    expect(trackProductEvent("drawer_opened", { entity: "deal" })).toBe(false);
  });

  it("uses only synthetic privacy-safe context for authoritative server events", async () => {
    await expect(trackServerProductEvent("export_started", { entity: "deals" })).resolves.toBe(true);
    expect(mocks.serverTrack).toHaveBeenCalledWith(
      "export_started",
      { entity: "deals" },
      {
        headers: {
          "user-agent": "InfraSight-Server-Event/1.0",
          "x-forwarded-for": "",
          cookie: "",
        },
      },
    );
  });

  it("never breaks the owning operation when telemetry is unavailable", async () => {
    mocks.serverTrack.mockRejectedValueOnce(new Error("telemetry unavailable"));
    await expect(
      trackServerProductEvent("export_started", { entity: "portfolio" }),
    ).resolves.toBe(false);
  });
});
