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

  it("applies the supplied color as low-opacity background and border", () => {
    render(<FilterChip label="X" color="#3b82f6" onRemove={() => {}} />);
    const button = screen.getByRole("button");
    // jsdom normalizes #RRGGBBAA into rgba(r, g, b, alpha)
    // 0x08/255 ≈ 0.03 background, 0x12/255 ≈ 0.07 border
    expect(button.style.backgroundColor).toBe("rgba(59, 130, 246, 0.03)");
    expect(button.style.borderColor).toBe("rgba(59, 130, 246, 0.07)");
  });
});
