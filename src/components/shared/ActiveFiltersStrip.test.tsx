import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActiveFiltersStrip } from "./ActiveFiltersStrip";

const constColor = () => "#000000";

describe("<ActiveFiltersStrip>", () => {
  it("renders nothing when no groups have items", () => {
    const { container } = render(
      <ActiveFiltersStrip
        groups={[
          { keyPrefix: "a", items: new Set(), getColor: constColor, onRemove: () => {} },
        ]}
        onClearAll={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders 'Active:' label and one chip when a single filter is active", () => {
    render(
      <ActiveFiltersStrip
        groups={[
          { keyPrefix: "sec", items: new Set(["Digital"]), getColor: constColor, onRemove: () => {} },
        ]}
        onClearAll={() => {}}
      />
    );
    expect(screen.getByText("Active:")).toBeInTheDocument();
    expect(screen.getByText("Digital")).toBeInTheDocument();
  });

  it("does NOT render 'Clear all' when only one filter is active", () => {
    render(
      <ActiveFiltersStrip
        groups={[
          { keyPrefix: "sec", items: new Set(["Digital"]), getColor: constColor, onRemove: () => {} },
        ]}
        onClearAll={() => {}}
      />
    );
    expect(screen.queryByText("Clear all")).not.toBeInTheDocument();
  });

  it("renders 'Clear all' when 2+ filters are active across any groups", () => {
    render(
      <ActiveFiltersStrip
        groups={[
          { keyPrefix: "sec", items: new Set(["Digital"]), getColor: constColor, onRemove: () => {} },
          { keyPrefix: "reg", items: new Set(["Europe"]), getColor: constColor, onRemove: () => {} },
        ]}
        onClearAll={() => {}}
      />
    );
    expect(screen.getByText("Clear all")).toBeInTheDocument();
  });

  it("invokes onClearAll when 'Clear all' is clicked", async () => {
    const onClearAll = vi.fn();
    render(
      <ActiveFiltersStrip
        groups={[
          { keyPrefix: "sec", items: new Set(["A"]), getColor: constColor, onRemove: () => {} },
          { keyPrefix: "reg", items: new Set(["B"]), getColor: constColor, onRemove: () => {} },
        ]}
        onClearAll={onClearAll}
      />
    );
    await userEvent.click(screen.getByText("Clear all"));
    expect(onClearAll).toHaveBeenCalledOnce();
  });

  it("invokes the per-group onRemove when a chip's remove button is clicked", async () => {
    const onRemoveSec = vi.fn();
    const onRemoveReg = vi.fn();
    render(
      <ActiveFiltersStrip
        groups={[
          { keyPrefix: "sec", items: new Set(["Digital"]), getColor: constColor, onRemove: onRemoveSec },
          { keyPrefix: "reg", items: new Set(["Europe"]), getColor: constColor, onRemove: onRemoveReg },
        ]}
        onClearAll={() => {}}
      />
    );
    // FilterChip renders the label and a button — find the remove button by aria-label
    const removeButtons = screen.getAllByRole("button");
    // Click the first chip's remove (Digital), should call onRemoveSec("Digital")
    await userEvent.click(removeButtons[0]);
    expect(onRemoveSec).toHaveBeenCalledWith("Digital");
    expect(onRemoveReg).not.toHaveBeenCalled();
  });

  it("renders chips from multiple groups in order", () => {
    render(
      <ActiveFiltersStrip
        groups={[
          { keyPrefix: "sec", items: new Set(["Digital", "Utilities"]), getColor: constColor, onRemove: () => {} },
          { keyPrefix: "reg", items: new Set(["Europe"]), getColor: constColor, onRemove: () => {} },
        ]}
        onClearAll={() => {}}
      />
    );
    expect(screen.getByText("Digital")).toBeInTheDocument();
    expect(screen.getByText("Utilities")).toBeInTheDocument();
    expect(screen.getByText("Europe")).toBeInTheDocument();
  });
});
