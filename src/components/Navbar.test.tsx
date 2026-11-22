import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "./Navbar";

const mocks = vi.hoisted(() => ({
  pathname: "/tracker",
  user: null as { name: string; email: string; role: string } | null,
  authPath: vi.fn(),
}));

vi.mock("next/navigation", () => ({ usePathname: () => mocks.pathname }));
vi.mock("next-auth/react", () => ({
  SessionProvider: ({ basePath, children }: { basePath: string; children: ReactNode }) => {
    mocks.authPath(basePath);
    return children;
  },
  useSession: () => ({ data: mocks.user ? { user: mocks.user } : null }),
}));

beforeEach(() => {
  mocks.pathname = "/tracker";
  mocks.user = null;
});

afterEach(() => { vi.unstubAllGlobals(); });

describe("Navbar", () => {
  it("groups research destinations and uses a single height for each link", () => {
    const { container } = render(<Navbar />);
    expect(screen.getByRole("link", { name: "Deals" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Funds" })).toHaveAttribute("href", "/funds");
    expect(screen.getByRole("link", { name: "PortCos" })).toHaveAttribute("href", "/portfolio");

    fireEvent.click(screen.getByText("Research", { selector: "summary" }));
    expect(screen.getByRole("link", { name: "Weekly briefing" })).toHaveAttribute("href", "/weekly-briefing");
    expect(screen.queryByRole("link", { name: "Weekly email" })).toBeNull();
    expect(screen.getByRole("link", { name: "Custom requests" })).toHaveAttribute("href", "/one-off-requests");
    expect(screen.getByRole("link", { name: "Compare deals" })).toHaveAttribute("href", "/compare");
    expect(screen.getByRole("link", { name: "Earnings" })).toHaveAttribute("href", "/earnings/latest");
    expect(screen.getByRole("link", { name: "Methodology" })).toHaveAttribute("href", "/methodology");
    expect(container.querySelector(".min-h-9.min-h-11")).toBeNull();
  });

  it("dismisses Research on Escape, outside pointer, tabbing out, link click and navigation", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Navbar />);
    const trigger = screen.getByText("Research", { selector: "summary" });
    const details = trigger.closest("details")!;
    const lastLink = within(details).getByText("Methodology");

    await user.click(trigger);
    expect(details.open).toBe(true);
    await user.tab();
    expect(within(details).getByText("Weekly briefing")).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(details.open).toBe(false);
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(details.open).toBe(false);

    await user.click(trigger);
    lastLink.focus();
    await user.tab();
    expect(details.open).toBe(false);

    await user.click(trigger);
    lastLink.addEventListener("click", (event) => event.preventDefault(), { once: true });
    await user.click(lastLink);
    expect(details.open).toBe(false);

    await user.click(trigger);
    mocks.pathname = "/earnings/archive/q1-2026";
    rerender(<Navbar />);
    expect(details.open).toBe(false);
    await user.click(trigger);
    expect(within(details).getByRole("link", { name: "Earnings" })).toHaveAttribute("aria-current", "page");
  });

  it("opens the mobile database switcher and closes it on Escape and route changes", () => {
    const { rerender } = render(<Navbar />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    const panel = document.getElementById(toggle.getAttribute("aria-controls")!)!;
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const databases = within(panel).getByRole("group", { name: "Databases" });
    expect(databases).toHaveClass("grid", "grid-cols-3");
    expect([...databases.children].map((link) => link.getAttribute("href"))).toEqual(["/tracker", "/funds", "/portfolio"]);
    for (const link of databases.children) {
      expect(link).toHaveClass("min-h-11", "w-full", "justify-center", "text-center");
    }
    expect(within(databases).getByText("Deals")).toHaveAttribute("aria-current", "page");
    expect(within(panel).getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(panel).not.toBeVisible();
    expect(toggle).toHaveFocus();
    fireEvent.click(toggle);
    mocks.pathname = "/funds";
    rerender(<Navbar />);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(panel).not.toBeVisible();
  });

  it("clears hidden menus when crossing the desktop breakpoint", () => {
    const breakpoint = new EventTarget();
    vi.stubGlobal("matchMedia", () => breakpoint);
    render(<Navbar />);

    const toggle = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(toggle);
    act(() => { breakpoint.dispatchEvent(new Event("change")); });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    const trigger = screen.getByText("Research", { selector: "summary" });
    fireEvent.click(trigger);
    act(() => { breakpoint.dispatchEvent(new Event("change")); });
    expect(trigger.closest("details")).not.toHaveAttribute("open");
  });

  it("shows Sign in for guests and each signed-in user's account identity", () => {
    const { rerender } = render(<Navbar />);
    expect(mocks.authPath).toHaveBeenCalledWith("/api/auth");
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");

    mocks.user = { name: "Morgan", email: "morgan@example.com", role: "ANALYST" };
    rerender(<Navbar />);
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
    expect(screen.getAllByText("Morgan")[0]).toBeVisible();
    expect(screen.queryByRole("link", { name: /Account/ })).toBeNull();
    mocks.user.role = "ADMIN";
    rerender(<Navbar />);
    expect(screen.getByRole("link", { name: "Account for Morgan" })).toHaveAttribute("href", "/admin");
  });
});
