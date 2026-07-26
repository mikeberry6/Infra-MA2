import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminAuditPage from "./page";

const auditEvent = vi.hoisted(() => ({
  count: vi.fn(),
  findUnique: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { auditEvent },
}));

describe("Admin audit focus pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("locates and highlights a focused event outside the first page", async () => {
    const focused = {
      id: "audit-focused",
      createdAt: new Date("2026-07-20T12:00:00.000Z"),
      action: "IMPORT",
      entityType: "Deal",
      entityId: "DEAL-1",
      changes: { changedFields: ["title"] },
      actor: { email: "admin@example.com", name: "Admin" },
    };
    auditEvent.count
      .mockResolvedValueOnce(76)
      .mockResolvedValueOnce(50);
    auditEvent.findUnique.mockResolvedValue({
      id: focused.id,
      createdAt: focused.createdAt,
    });
    auditEvent.findMany.mockResolvedValue([focused]);

    render(await AdminAuditPage({
      searchParams: Promise.resolve({ focus: focused.id }),
    }));

    expect(auditEvent.count).toHaveBeenNthCalledWith(2, {
      where: {
        OR: [
          { createdAt: { gt: focused.createdAt } },
          { createdAt: focused.createdAt, id: { gt: focused.id } },
        ],
      },
    });
    expect(auditEvent.findMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: 50,
      take: 25,
    }));
    expect(screen.getByText("Page 3 of 4 · 76 records")).toBeVisible();
    expect(screen.getByText("DEAL-1").closest("tr")).toHaveClass("bg-[var(--accent-soft)]");
  });

  it("uses ordinary normalized pagination when focus does not resolve", async () => {
    auditEvent.count.mockResolvedValue(60);
    auditEvent.findUnique.mockResolvedValue(null);
    auditEvent.findMany.mockResolvedValue([]);

    render(await AdminAuditPage({
      searchParams: Promise.resolve({ focus: "missing", page: "2" }),
    }));

    expect(auditEvent.count).toHaveBeenCalledTimes(1);
    expect(auditEvent.findMany).toHaveBeenCalledWith(expect.objectContaining({
      skip: 25,
      take: 25,
    }));
    expect(screen.getByText("Page 2 of 3 · 60 records")).toBeVisible();
  });

  it("uses the first scalar value from repeated focus and page parameters", async () => {
    auditEvent.count.mockResolvedValue(1);
    auditEvent.findUnique.mockResolvedValue(null);
    auditEvent.findMany.mockResolvedValue([]);

    render(await AdminAuditPage({
      searchParams: Promise.resolve({
        focus: ["audit-first", "audit-second"],
        page: ["1", "2"],
      }),
    }));

    expect(auditEvent.findUnique).toHaveBeenCalledWith({
      where: { id: "audit-first" },
      select: { id: true, createdAt: true },
    });
    expect(auditEvent.findMany).toHaveBeenCalledWith(expect.objectContaining({
      skip: 0,
      take: 25,
    }));
  });
});
