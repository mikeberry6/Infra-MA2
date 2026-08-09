import { describe, expect, it, vi } from "vitest";
import { captureProductionSnapshotFromClient } from "./sources-production";

describe("read-only production snapshot", () => {
  it("uses an explicit select and maps only published deals through the cutoff", async () => {
    const findMany = vi.fn().mockResolvedValue([{
      id: "database-1",
      legacyId: "INF-2026-001",
      title: "Example",
      target: "Example Target",
      sector: "POWER_ET",
      subsector: "Solar",
      region: "NORTH_AMERICA",
      categories: ["ACQUISITION_BUYOUT"],
      date: new Date("2026-01-02T08:00:00Z"),
      description: "Example description",
      country: "United States",
      dealStatus: "ANNOUNCED",
      fundVehicle: null,
      participants: [
        { role: "BUYER", displayName: null, organization: { name: "Example Fund" } },
        { role: "SELLER", displayName: "Example Seller LLC", organization: { name: "Example Seller" } },
      ],
      citations: [{ source: { label: "Primary", url: "https://example.com/deal?utm_source=test" } }],
    }]);

    const snapshot = await captureProductionSnapshotFromClient({
      client: { deal: { findMany } },
      cutoff: "2026-08-07",
    });

    expect(snapshot.status).toBe("CAPTURED");
    expect(snapshot.recordCount).toBe(1);
    expect(snapshot.records[0]).toMatchObject({
      legacyId: "INF-2026-001",
      buyer: "Example Fund",
      seller: "Example Seller LLC",
      sector: "Power & ET",
      region: "North America",
      sourceUrl: "https://example.com/deal",
    });
    const query = findMany.mock.calls[0][0];
    expect(query).toHaveProperty("select.legacyId", true);
    expect(query).not.toHaveProperty("include");
    expect(query).toHaveProperty("where.status", "PUBLISHED");
  });
});
