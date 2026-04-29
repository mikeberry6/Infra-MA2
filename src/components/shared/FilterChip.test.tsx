import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterChip } from "./FilterChip";

describe("<FilterChip>", () => {
  it("renders the label", () => {
    render(<FilterChip label="Digital" color="#3b82f6" onRemove={() => {}} />);
    expect(screen.getByText("Digital")).toBeInTheDocument();
  });

  it("invokes onRemove when clicked", async () => {
    const onRemove = vi.fn();
    render(<FilterChip label="Digital" color="#3b82f6" onRemove={onRemove} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("has an accessible label naming the filter", () => {
    render(<FilterChip label="Digital" color="#3b82f6" onRemove={() => {}} />);
    expect(
      screen.getByRole("button", { name: /remove digital filter/i })
    ).toBeInTheDocument();
  });

  it("renders a color dot using the supplied color", () => {
    const { container } = render(
      <FilterChip label="X" color="#3b82f6" onRemove={() => {}} />
    );
    // The dot is the first aria-hidden span inside the chip.
    const dot = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(dot).not.toBeNull();
    // jsdom normalizes #3b82f6 to rgb()
    expect(dot.style.backgroundColor).toBe("rgb(59, 130, 246)");
  });
});
