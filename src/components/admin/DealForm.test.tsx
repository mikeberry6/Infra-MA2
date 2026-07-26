import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DealForm from "./DealForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("DealForm accessibility", () => {
  it("associates the current seller-disclosure guidance with its input", () => {
    render(<DealForm mode="create" action={vi.fn()} />);

    const reason = screen.getByRole("textbox", { name: "Seller disclosure reason" });
    expect(reason).toHaveAccessibleDescription(
      "Required when no seller is named (10+ characters).",
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Seller (one per line)" }), {
      target: { value: "Named Seller" },
    });
    expect(reason).toHaveAccessibleDescription("Not required when a seller is named.");
  });
});
