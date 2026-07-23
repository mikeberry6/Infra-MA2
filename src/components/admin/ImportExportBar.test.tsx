import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ImportExportBar from "./ImportExportBar";

const analyticsTrack = vi.hoisted(() => vi.fn());
const invalidateDetailCache = vi.hoisted(() => vi.fn());
vi.mock("@vercel/analytics", () => ({ track: analyticsTrack }));
vi.mock("@/lib/detail-cache-events", () => ({ invalidateDetailCache }));

function csvFile(contents: string, name = "deals.csv"): File {
  const file = new File([contents], name, { type: "text/csv" });
  Object.defineProperty(file, "text", {
    configurable: true,
    value: vi.fn().mockResolvedValue(contents),
  });
  return file;
}

function response(payload: unknown, ok = true) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(payload),
  } as unknown as Response;
}

describe("ImportExportBar", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    analyticsTrack.mockReset();
    invalidateDetailCache.mockReset();
  });

  it("shows a detailed preview and only commits after explicit confirmation", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        previewToken: "signed-preview-token",
        items: [
          { id: "DEAL-NEW" },
          { id: "DEAL-PUBLISHED" },
          { id: "DEAL-UPDATE" },
          { id: "DEAL-BAD" },
        ],
        total: 4,
        valid: 3,
        creates: 1,
        updates: 1,
        unchanged: 0,
        quarantined: 1,
        warnings: [{
          row: 3,
          id: "DEAL-PUBLISHED",
          existingStatus: "PUBLISHED",
          code: "PUBLISHED_DEAL_UPDATE_BLOCKED",
          error: "Published deal requires editorial review",
        }],
        errors: [{ row: 5, id: "DEAL-BAD", error: "Buyer is required" }],
      }))
      .mockResolvedValueOnce(response({ imported: 2, auditEventId: "audit-42" }));
    vi.stubGlobal("fetch", fetchMock);

    render(<ImportExportBar entityType="deals" />);
    const file = csvFile([
      "id,title,category,keyHighlights",
      "DEAL-NEW,New deal,Acquisition,First highlight",
      "DEAL-PUBLISHED,Published deal,Sale,Second highlight",
      "DEAL-UPDATE,Update deal,Acquisition,Third highlight",
      "DEAL-BAD,Bad deal,,",
    ].join("\n"));

    fireEvent.change(screen.getByLabelText("Select CSV"), { target: { files: [file] } });

    const preview = await screen.findByRole("region", { name: "Import preview" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const previewRequest = fetchMock.mock.calls[0];
    expect(previewRequest[0]).toBe("/api/imports/deals?preview=1");
    expect(previewRequest[1]).toMatchObject({ method: "POST" });
    expect(previewRequest[1].body).toBeInstanceOf(FormData);
    expect(previewRequest[1].headers).toBeUndefined();

    expect(within(preview).getByText("Creates").nextElementSibling).toHaveTextContent("1");
    expect(within(preview).getByText("Updates").nextElementSibling).toHaveTextContent("1");
    expect(within(preview).getByText("Unchanged").nextElementSibling).toHaveTextContent("0");
    expect(within(preview).getByText("Quarantined").nextElementSibling).toHaveTextContent("1");
    expect(within(preview).getByRole("heading", { name: "Warnings and quarantined rows (1)" })).toBeVisible();
    expect(within(preview).getByText("Row 3 · DEAL-PUBLISHED")).toBeVisible();
    expect(within(preview).getByText("Published deal requires editorial review")).toBeVisible();
    expect(within(preview).getByRole("heading", { name: "Validation errors (1)" })).toBeVisible();
    expect(within(preview).getByText("Row 5 · DEAL-BAD")).toBeVisible();
    expect(within(preview).getByText("Buyer is required")).toBeVisible();
    expect(within(preview).getByRole("button", { name: "Download error CSV" })).toBeVisible();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    await userEvent.click(within(preview).getByRole("button", { name: "Confirm import" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const commitRequest = fetchMock.mock.calls[1];
    expect(commitRequest[0]).toBe("/api/imports/deals");
    expect(commitRequest[1]).toMatchObject({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Import-Preview-Token": "signed-preview-token",
      },
    });
    expect(JSON.parse(commitRequest[1].body as string).deals).toHaveLength(4);
    expect(await screen.findByText("2 deals committed as drafts.")).toBeVisible();
    expect(invalidateDetailCache).toHaveBeenCalledWith("deal");
    expect(screen.getByRole("link", { name: "View audit event" })).toHaveAttribute(
      "href",
      "/admin/audit?focus=audit-42",
    );
  });

  it("does not invalidate detail caches when a confirmed import writes no rows", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        previewToken: "signed-preview-token",
        items: [{ id: "DEAL-UPDATE" }],
        total: 1,
        valid: 1,
        creates: 0,
        updates: 1,
        unchanged: 0,
        quarantined: 0,
        warnings: [],
        errors: [],
      }))
      .mockResolvedValueOnce(response({ imported: 0, unchanged: 1, auditEventId: null }));
    vi.stubGlobal("fetch", fetchMock);

    render(<ImportExportBar entityType="deals" />);
    fireEvent.change(screen.getByLabelText("Select CSV"), {
      target: { files: [csvFile("id,title\nDEAL-UPDATE,Already current")] },
    });
    const preview = await screen.findByRole("region", { name: "Import preview" });
    await userEvent.click(within(preview).getByRole("button", { name: "Confirm import" }));
    await screen.findByText("No deals required changes. 1 unchanged.");

    expect(invalidateDetailCache).not.toHaveBeenCalled();
  });

  it("does not offer a write when every valid row is quarantined", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({
      previewToken: "signed-fund-preview-token",
      items: [{ id: "FUND-1", fundName: "Fund I" }],
      total: 1,
      valid: 1,
      creates: 0,
      updates: 0,
      quarantined: 1,
      warnings: [{ row: 2, fundId: "FUND-1", error: "Published fund is immutable" }],
      errors: [],
    })));

    render(<ImportExportBar entityType="funds" />);
    fireEvent.change(screen.getByLabelText("Select CSV"), {
      target: { files: [csvFile("id,fundName\nFUND-1,Fund I", "funds.csv")] },
    });

    expect(await screen.findByRole("button", { name: "Confirm import" })).toBeDisabled();
    expect(screen.getByText(/Confirming will write 0 creates and 0 updates/)).toBeVisible();
  });

  it("shows identical rows as unchanged and does not offer a no-op write", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      previewToken: "signed-replay-preview-token",
      items: [{ id: "DEAL-1" }],
      total: 1,
      valid: 1,
      creates: 0,
      updates: 0,
      unchanged: 1,
      quarantined: 0,
      warnings: [],
      errors: [],
    }));
    vi.stubGlobal("fetch", fetchMock);

    render(<ImportExportBar entityType="deals" />);
    fireEvent.change(screen.getByLabelText("Select CSV"), {
      target: { files: [csvFile("id,title\nDEAL-1,Existing deal")] },
    });

    const preview = await screen.findByRole("region", { name: "Import preview" });
    expect(within(preview).getByText("Unchanged").nextElementSibling).toHaveTextContent("1");
    expect(within(preview).getByText(/1 unchanged row, plus any errors and quarantined rows, will be skipped/)).toBeVisible();
    expect(within(preview).getByRole("button", { name: "Confirm import" })).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("shows portfolio ownership replacements as atomic preview changes", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({
      previewToken: "signed-portfolio-preview-token",
      items: [{ name: "Portfolio Company", country: "United States" }],
      total: 1,
      valid: 1,
      creates: 0,
      updates: 1,
      quarantined: 0,
      warnings: [],
      errors: [],
      ownershipChanges: [{
        row: 2,
        name: "Portfolio Company",
        country: "United States",
        action: "replace",
        from: ["Old Manager · Old Fund"],
        to: "New Manager · New Fund",
        code: "OWNERSHIP_REPLACE",
        message: "The current ownership will be retired before the replacement is activated.",
      }],
    })));

    render(<ImportExportBar entityType="portfolio" />);
    fireEvent.change(screen.getByLabelText("Select CSV"), {
      target: {
        files: [csvFile(
          "name,country,investmentFirm,ownershipVehicle\nPortfolio Company,United States,New Manager,New Fund",
          "portfolio.csv",
        )],
      },
    });

    const preview = await screen.findByRole("region", { name: "Import preview" });
    expect(within(preview).getByRole("heading", { name: "Ownership changes (1)" })).toBeVisible();
    expect(within(preview).getByText("Row 2 · Portfolio Company · replace")).toBeVisible();
    expect(within(preview).getByText(/From: Old Manager · Old Fund · To: New Manager · New Fund/)).toBeVisible();
  });
});
