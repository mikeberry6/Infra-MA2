import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MobileFilterSheet } from "./MobileFilterSheet";

describe("MobileFilterSheet", () => {
  it("announces active filters, traps page scrolling, and restores trigger focus on Escape", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MobileFilterSheet activeCount={2}>
        <button type="button">Sector</button>
      </MobileFilterSheet>,
    );

    const trigger = screen.getByRole("button", { name: "Filters, 2 active filters" });
    const originalInert = container.inert;
    trigger.focus();
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Filters" });
    expect(dialog.closest("[data-mobile-filter-overlay]")?.parentElement).toBe(document.body);
    expect(container.inert).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Filters" })).not.toBeInTheDocument();
    expect(container.inert).toBe(originalInert);
    expect(document.body.style.overflow).toBe("");
    expect(trigger).toHaveFocus();
  });

  it("closes from the explicit result action", async () => {
    const user = userEvent.setup();
    render(
      <MobileFilterSheet activeCount={0} title="News filters">
        <button type="button">Source</button>
      </MobileFilterSheet>,
    );

    await user.click(screen.getByRole("button", { name: "News filters" }));
    expect(screen.getByRole("dialog", { name: "News filters" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "View results" }));
    expect(screen.queryByRole("dialog", { name: "News filters" })).not.toBeInTheDocument();
  });

  it("uses unique labelled-dialog IDs when more than one sheet is rendered", async () => {
    const user = userEvent.setup();
    render(
      <>
        <MobileFilterSheet activeCount={0} title="First filters"><span>First</span></MobileFilterSheet>
        <MobileFilterSheet activeCount={0} title="Second filters"><span>Second</span></MobileFilterSheet>
      </>,
    );

    const first = screen.getByRole("button", { name: "First filters" });
    const second = screen.getByRole("button", { name: "Second filters" });
    expect(first.getAttribute("aria-controls")).not.toBe(second.getAttribute("aria-controls"));

    await user.click(second);
    const dialog = screen.getByRole("dialog", { name: "Second filters" });
    expect(dialog.id).toBe(second.getAttribute("aria-controls"));
  });

  it("keeps focus in the sheet when clearing the last active filter removes the action", async () => {
    const user = userEvent.setup();
    function ClearableSheet() {
      const [active, setActive] = useState(true);
      return (
        <MobileFilterSheet
          activeCount={active ? 1 : 0}
          onClearAll={() => setActive(false)}
        >
          <span>Filter controls</span>
        </MobileFilterSheet>
      );
    }

    render(<ClearableSheet />);
    await user.click(screen.getByRole("button", { name: "Filters, 1 active filter" }));
    await user.click(screen.getByRole("button", { name: "Clear all filters" }));

    expect(screen.queryByRole("button", { name: "Clear all filters" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View results" })).toHaveFocus();
    expect(screen.getByRole("dialog", { name: "Filters" })).toContainElement(
      document.activeElement as HTMLElement,
    );
  });
});
