import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardSignalReviewButtons } from "@/components/admin/DashboardSignalReviewButtons";

const mocks = vi.hoisted(() => ({
  approve: vi.fn(),
  reject: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));
vi.mock("@/modules/dashboard/admin-actions", () => ({
  approveDashboardSignal: mocks.approve,
  rejectDashboardSignal: mocks.reject,
}));

describe("DashboardSignalReviewButtons", () => {
  beforeEach(() => {
    mocks.approve.mockReset().mockResolvedValue({ success: true });
    mocks.reject.mockReset().mockResolvedValue({ success: true });
    mocks.refresh.mockReset();
  });

  it("submits the exact rendered content hash with the review decision", async () => {
    render(<DashboardSignalReviewButtons id="signal-1" contentHash="rendered-hash" />);

    await userEvent.click(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() => {
      expect(mocks.approve).toHaveBeenCalledWith("signal-1", "rendered-hash");
      expect(mocks.refresh).toHaveBeenCalledTimes(1);
    });
  });

  it("keeps a compare-and-set failure visible instead of reporting success", async () => {
    mocks.reject.mockResolvedValue({
      success: false,
      error: "This signal changed after it was rendered. Refresh the review queue before reviewing it.",
    });
    render(<DashboardSignalReviewButtons id="signal-1" contentHash="rendered-hash" />);

    await userEvent.click(screen.getByRole("button", { name: "Reject" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("changed after it was rendered");
    expect(alert).toHaveClass("border-red-200", "bg-red-50", "text-red-900");
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
});
