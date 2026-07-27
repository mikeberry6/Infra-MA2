import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MobileFilterSheet } from "./MobileFilterSheet";

describe("MobileFilterSheet", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
  });

  it("shows the active count and exposes every filter in a labelled dialog", async () => {
    const user = userEvent.setup();
    render(
      <MobileFilterSheet activeCount={2}>
        <button type="button">Sector options</button>
      </MobileFilterSheet>,
    );

    const trigger = screen.getByRole("button", { name: /filters, 2 active filters/i });
    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "Filters" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sector options" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("clears active filters only through the explicit action", async () => {
    const user = userEvent.setup();
    const onClearAll = vi.fn();
    render(
      <MobileFilterSheet activeCount={1} onClearAll={onClearAll}>
        <div>Filters</div>
      </MobileFilterSheet>,
    );

    await user.click(screen.getByRole("button", { name: /filters, 1 active filter/i }));
    await user.click(screen.getByRole("button", { name: /clear all filters/i }));
    expect(onClearAll).toHaveBeenCalledOnce();
  });
});
