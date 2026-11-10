import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Navbar } from "./Navbar";

vi.mock("next/navigation", () => ({ usePathname: () => "/tracker" }));

describe("Navbar", () => {
  it("links directly to databases and groups research destinations", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Deals" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Funds" })).toHaveAttribute("href", "/funds");
    expect(screen.getByRole("link", { name: "PortCos" })).toHaveAttribute("href", "/portfolio");

    fireEvent.click(screen.getByText("Research", { selector: "summary" }));
    expect(screen.getByRole("link", { name: "Weekly briefing" })).toHaveAttribute("href", "/weekly-briefing");
    expect(screen.getByRole("link", { name: "Weekly email" })).toHaveAttribute("href", "/email-format/latest");
    expect(screen.getByRole("link", { name: "One-offs" })).toHaveAttribute("href", "/one-off-requests");
    expect(screen.getByRole("link", { name: "Compare deals" })).toHaveAttribute("href", "/compare");
    expect(screen.getByRole("link", { name: "Earnings archive" })).toHaveAttribute("href", "/earnings/archive/q4-2025");
    expect(screen.getByRole("link", { name: "Methodology" })).toHaveAttribute("href", "/methodology");
  });
});
