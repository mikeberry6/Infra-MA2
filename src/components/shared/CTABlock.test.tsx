import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { trackProductEvent } = vi.hoisted(() => ({
  trackProductEvent: vi.fn(),
}));

vi.mock("@/lib/product-analytics", () => ({
  trackProductEvent,
}));

import { CTABlock } from "./CTABlock";

describe("CTABlock", () => {
  it("preserves the research subject and emits only the finite database surface", async () => {
    render(<CTABlock surface="fund_database" />);
    const link = screen.getByRole("link", { name: "Contact research" });

    expect(link).toHaveAttribute(
      "href",
      "mailto:research@infrasight.com?subject=InfraSight%20research%20request",
    );
    const preventNavigation = (event: Event) => event.preventDefault();
    document.addEventListener("click", preventNavigation);
    fireEvent.click(link);
    document.removeEventListener("click", preventNavigation);
    expect(trackProductEvent).toHaveBeenCalledWith(
      "research_contact_initiated",
      { surface: "fund_database" },
    );
  });
});
