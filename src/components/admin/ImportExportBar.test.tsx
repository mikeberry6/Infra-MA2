import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ImportExportBar from "./ImportExportBar";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

function response(payload: unknown, ok = true): Response {
  return {
    ok,
    json: vi.fn().mockResolvedValue(payload),
  } as unknown as Response;
}

function file(name = "deals.csv"): File {
  return new File(["legacyId,title\nDEAL-1,Example"], name, {
    type: "text/csv",
  });
}

function previewPayload(overrides: Record<string, unknown> = {}) {
  return {
    preview: true,
    token: "single-use-preview-token",
    expiresAt: "2099-01-01T12:00:00.000Z",
    summary: {
      total: 4,
      valid: 3,
      creates: 1,
      updates: 1,
      unchanged: 0,
      quarantined: 1,
      errors: 1,
      eligible: 2,
    },
    report: [
      {
        row: 2,
        identifier: "DEAL-NEW",
        disposition: "create",
      },
      {
        row: 3,
        identifier: "DEAL-UPDATE",
        disposition: "update",
      },
      {
        row: 4,
        identifier: "DEAL-PUBLISHED",
        disposition: "quarantined",
        code: "PUBLISHED_UPDATE_BLOCKED",
        message: "Published records require editorial review.",
      },
      {
        row: 5,
        identifier: "DEAL-BAD",
        disposition: "error",
        code: "INVALID_ROW",
        message: "Buyer is required.",
      },
    ],
    ...overrides,
  };
}

describe("ImportExportBar", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    mocks.refresh.mockReset();
  });

  it("only requests a preview when a file is selected, then PUTs the token after explicit confirmation", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(previewPayload()))
      .mockResolvedValueOnce(
        response({
          imported: 2,
          created: 1,
          updated: 1,
          unchanged: 0,
          quarantined: 1,
          auditEventId: "audit-42",
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    render(<ImportExportBar entityType="deals" />);

    expect(screen.getByText("Preview first · maximum 500 rows")).toBeVisible();
    fireEvent.change(screen.getByLabelText("Select deals CSV file"), {
      target: { files: [file()] },
    });

    const preview = await screen.findByRole("region", {
      name: "Import preview",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/imports/deals");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "POST",
      body: expect.any(FormData),
    });
    expect(fetchMock.mock.calls[0][1].headers).toBeUndefined();

    expect(
      within(preview).getByText(/No records have been changed/),
    ).toBeVisible();
    const publishedRow = within(preview)
      .getByText("DEAL-PUBLISHED")
      .closest("tr");
    expect(publishedRow).toBeVisible();
    expect(
      publishedRow,
    ).toHaveTextContent("Published records require editorial review.");
    const invalidRow = within(preview).getByText("DEAL-BAD").closest("tr");
    expect(
      invalidRow,
    ).toHaveTextContent("Buyer is required.");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await userEvent.click(
      within(preview).getByRole("button", { name: "Confirm import" }),
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1][0]).toBe("/api/imports/deals");
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "single-use-preview-token" }),
    });
    expect(await screen.findByText(/2 deals imported successfully/)).toBeVisible();
    expect(screen.getByRole("link", { name: "View audit event" })).toHaveAttribute(
      "href",
      "/admin/audit/audit-42",
    );
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });

  it("cancels a preview without issuing a write request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(previewPayload()));
    vi.stubGlobal("fetch", fetchMock);

    render(<ImportExportBar entityType="deals" />);
    fireEvent.change(screen.getByLabelText("Select deals CSV file"), {
      target: { files: [file()] },
    });

    const preview = await screen.findByRole("region", {
      name: "Import preview",
    });
    await userEvent.click(within(preview).getByRole("button", { name: "Cancel" }));

    expect(
      screen.queryByRole("region", { name: "Import preview" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Preview cancelled. No records were changed."),
    ).toBeVisible();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows all preview counts and disables confirmation when no rows are eligible", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response(
          previewPayload({
            summary: {
              total: 2,
              valid: 1,
              creates: 0,
              updates: 0,
              unchanged: 1,
              quarantined: 0,
              errors: 1,
              eligible: 0,
            },
            report: [
              {
                row: 2,
                identifier: "FUND-SAME",
                disposition: "unchanged",
              },
              {
                row: 3,
                identifier: "FUND-BAD",
                disposition: "error",
                code: "INVALID_ROW",
                message: "Manager is required.",
              },
            ],
          }),
        ),
      ),
    );

    render(<ImportExportBar entityType="funds" />);
    fireEvent.change(screen.getByLabelText("Select funds CSV file"), {
      target: { files: [file("funds.csv")] },
    });

    const preview = await screen.findByRole("region", {
      name: "Import preview",
    });
    const count = (label: string) =>
      within(preview).getByText(label).parentElement;

    expect(count("Rows")).toHaveTextContent("2");
    expect(count("Valid")).toHaveTextContent("1");
    expect(count("Eligible")).toHaveTextContent("0");
    expect(count("Unchanged")).toHaveTextContent("1");
    expect(count("Errors")).toHaveTextContent("1");
    expect(
      within(preview).getByRole("button", { name: "Confirm import" }),
    ).toBeDisabled();
  });

  it("keeps a failed commit visible and does not discard its preview token", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(previewPayload()))
      .mockResolvedValueOnce(
        response({ error: "The preview expired. Select the CSV again." }, false),
      );
    vi.stubGlobal("fetch", fetchMock);

    render(<ImportExportBar entityType="portfolio" />);
    fireEvent.change(screen.getByLabelText("Select companies CSV file"), {
      target: { files: [file("companies.csv")] },
    });

    const preview = await screen.findByRole("region", {
      name: "Import preview",
    });
    await userEvent.click(
      within(preview).getByRole("button", { name: "Confirm import" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The preview expired",
    );
    expect(
      screen.getByRole("region", { name: "Import preview" }),
    ).toBeVisible();
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
});
