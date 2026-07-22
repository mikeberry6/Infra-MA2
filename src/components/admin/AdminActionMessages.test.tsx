import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ArchiveButton from "./ArchiveButton";
import RecordWorkflowButton from "./RecordWorkflowButton";

vi.mock("@/lib/detail-cache-events", () => ({ invalidateDetailCache: vi.fn() }));

describe("admin action messages", () => {
  it("keeps an archive failure visible in the shared alert treatment", async () => {
    const archive = vi.fn().mockResolvedValue({
      success: false,
      error: "Archive blocked by an active ownership period",
    });
    render(<ArchiveButton archiveAction={archive} id="company-1" entity="company" />);

    await userEvent.click(screen.getByRole("button", { name: "Archive" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirm archive" }));

    await waitFor(() => expect(archive).toHaveBeenCalledWith("company-1"));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Archive blocked by an active ownership period",
    );
  });

  it("renders workflow failures through the shared alert treatment", async () => {
    const submitForReview = vi.fn().mockResolvedValue({
      success: false,
      error: "Primary citation is required before review",
    });
    render(
      <RecordWorkflowButton
        id="deal-1"
        entity="deal"
        status="DRAFT"
        submitForReview={submitForReview}
        publish={vi.fn()}
        verify={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Submit review" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Primary citation is required before review",
    );
  });
});
