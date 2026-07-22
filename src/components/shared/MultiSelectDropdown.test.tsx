import { useState } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MobileFilterSheet } from "./MobileFilterSheet";
import { MultiSelectDropdown } from "./MultiSelectDropdown";

const OPTIONS = ["Power & ET", "Digital", "Transportation"];

afterEach(() => {
  vi.unstubAllGlobals();
});

function ControlledDropdown() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  return (
    <MultiSelectDropdown
      label="Sector"
      options={OPTIONS}
      selected={selected}
      onToggle={(value) => {
        setSelected((current) => {
          const next = new Set(current);
          if (next.has(value)) next.delete(value);
          else next.add(value);
          return next;
        });
      }}
      getColor={() => "#3b82f6"}
    />
  );
}

describe("MultiSelectDropdown", () => {
  it("supports arrow-key navigation, selection, and focus restoration", async () => {
    const user = userEvent.setup();
    render(<ControlledDropdown />);

    const trigger = screen.getByRole("button", { name: "Filter by Sector" });
    expect(trigger.className).toContain("focus-visible:ring-[var(--accent)]");
    trigger.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("option", { name: "Power & ET" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "Digital" })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(trigger).toHaveTextContent("1");
    expect(screen.getByRole("option", { name: "Digital" })).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox", { name: "Sector options" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("keeps Escape scoped to the portaled popup before closing its parent sheet", async () => {
    const user = userEvent.setup();
    render(
      <MobileFilterSheet activeCount={0}>
        <ControlledDropdown />
      </MobileFilterSheet>,
    );

    await user.click(screen.getByRole("button", { name: /^Filters/ }));
    const dialog = screen.getByRole("dialog", { name: "Filters" });
    await user.click(screen.getByRole("button", { name: "Filter by Sector" }));

    const listbox = screen.getByRole("listbox", { name: "Sector options" });
    expect(listbox).toHaveAttribute("data-dialog-focus-owner", "mobile-filter-dialog");
    expect(screen.getByRole("option", { name: "Power & ET" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox", { name: "Sector options" })).not.toBeInTheDocument();
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filter by Sector" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Filters" })).not.toBeInTheDocument();
  });

  it("stacks above the mobile sheet and closes only for non-popup scrolling", async () => {
    const user = userEvent.setup();
    render(
      <MobileFilterSheet activeCount={0}>
        <ControlledDropdown />
      </MobileFilterSheet>,
    );

    await user.click(screen.getByRole("button", { name: /^Filters/ }));
    const dialog = screen.getByRole("dialog", { name: "Filters" });
    const trigger = screen.getByRole("button", { name: "Filter by Sector" });
    await user.click(trigger);

    const listbox = screen.getByRole("listbox", { name: "Sector options" });
    const overlay = document.querySelector<HTMLElement>("[data-multiselect-overlay]");
    expect(dialog.parentElement).toHaveClass("z-[10000]");
    expect(overlay).toHaveStyle("z-index: 10010");
    expect(listbox).toHaveStyle("z-index: 10020");

    fireEvent.scroll(listbox);
    expect(screen.getByRole("listbox", { name: "Sector options" })).toBeInTheDocument();

    fireEvent.scroll(dialog);
    expect(screen.queryByRole("listbox", { name: "Sector options" })).not.toBeInTheDocument();
    expect(dialog).toBeInTheDocument();
    expect(trigger).not.toHaveFocus();
  });

  it("closes and releases the focus lock when the viewport enters desktop", async () => {
    let onChange: ((event: Pick<MediaQueryListEvent, "matches">) => void) | undefined;
    const mediaQuery = {
      matches: false,
      addEventListener: vi.fn((_type: string, listener: typeof onChange) => { onChange = listener; }),
      removeEventListener: vi.fn(),
    };
    const matchMedia = vi.fn().mockReturnValue(mediaQuery);
    vi.stubGlobal("matchMedia", matchMedia);
    const user = userEvent.setup();
    render(
      <MobileFilterSheet activeCount={0}>
        <ControlledDropdown />
      </MobileFilterSheet>,
    );

    await user.click(screen.getByRole("button", { name: /^Filters/ }));
    expect(screen.getByRole("dialog", { name: "Filters" })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
    expect(matchMedia).toHaveBeenCalledWith("(min-width: 768px)");

    act(() => onChange?.({ matches: true }));

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Filters" })).not.toBeInTheDocument());
    expect(document.body.style.overflow).toBe("");
  });
});
