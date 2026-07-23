import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RootLoading from "@/app/loading";
import AdminLoading from "@/app/admin/loading";
import DashboardLoading from "@/app/dashboard/loading";
import EarningsLoading from "@/app/earnings/loading";
import LoginLoading from "@/app/login/loading";
import NewsLoading from "@/app/news/loading";
import SearchLoading from "@/app/search/loading";
import GlobalError from "@/app/error";
import AdminError from "@/app/admin/error";

describe("route boundary accessibility", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["database", RootLoading, "Loading database"],
    ["administration", AdminLoading, "Loading administration"],
    ["dashboard", DashboardLoading, "Loading dashboard"],
    ["earnings", EarningsLoading, "Loading earnings"],
    ["sign in", LoginLoading, "Loading sign-in form"],
    ["news", NewsLoading, "Loading news"],
    ["search", SearchLoading, "Loading search"],
  ] as const)("announces the %s loading fallback and hides its skeleton", (_, Component, label) => {
    render(<Component />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(status).toHaveTextContent(label);
    expect(status.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it("announces the public error fallback and exposes retry", () => {
    render(<GlobalError error={Object.assign(new Error("failure"), { digest: "safe-id" })} reset={vi.fn()} />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(screen.getByRole("heading", { name: "Something went wrong", level: 1 })).toBeVisible();
    expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled();
    expect(alert).toHaveTextContent("ID: safe-id");
  });

  it("announces the admin error fallback with a page-level heading and retry", () => {
    render(<AdminError error={new Error("failure")} reset={vi.fn()} />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(screen.getByRole("heading", { name: "Admin action failed", level: 1 })).toBeVisible();
    expect(screen.getByRole("button", { name: "Retry" })).toBeEnabled();
  });
});
