// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DeleteButton from "@/components/admin/DeleteButton";

describe("DeleteButton", () => {
  it("hides hard deletion for every non-draft state", () => {
    const action = vi.fn();
    const { rerender } = render(<DeleteButton entity="deal" id="1" status="PUBLISHED" deleteAction={action} />);
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    rerender(<DeleteButton entity="deal" id="1" status="IN_REVIEW" deleteAction={action} />);
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    rerender(<DeleteButton entity="deal" id="1" status="ARCHIVED" deleteAction={action} />);
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
  });

  it("requires confirmation for drafts and keeps server dependency errors visible", async () => {
    const action = vi.fn().mockResolvedValue({ success: false, error: "Delete blocked by dependent records" });
    render(<DeleteButton entity="company" id="draft-1" status="DRAFT" deleteAction={action} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await waitFor(() => expect(action).toHaveBeenCalledWith("draft-1"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Delete blocked by dependent records");
  });
});
