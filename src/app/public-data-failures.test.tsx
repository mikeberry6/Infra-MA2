import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

const queryMocks = vi.hoisted(() => ({
  getAllDeals: vi.fn(),
  getAllFunds: vi.fn(),
  getAllCompanyListItems: vi.fn(),
  getFundStrategyIndex: vi.fn(),
  getDatabaseCounts: vi.fn(),
  getNewsFeed: vi.fn(),
  getDashboardView: vi.fn(),
}));

vi.mock("@/modules/deals/queries", () => ({
  getAllDeals: queryMocks.getAllDeals,
}));
vi.mock("@/modules/funds/queries", () => ({
  getAllFunds: queryMocks.getAllFunds,
  getFundStrategyIndex: queryMocks.getFundStrategyIndex,
}));
vi.mock("@/modules/companies/queries", () => ({
  getAllCompanyListItems: queryMocks.getAllCompanyListItems,
}));
vi.mock("@/modules/insights/queries", () => ({
  getDatabaseCounts: queryMocks.getDatabaseCounts,
}));
vi.mock("@/modules/news/queries", () => ({
  getNewsFeed: queryMocks.getNewsFeed,
}));
vi.mock("@/modules/dashboard/queries", () => ({
  getDashboardView: queryMocks.getDashboardView,
}));

import TrackerPage from "@/app/tracker/page";
import FundsPage from "@/app/funds/page";
import PortfolioPage from "@/app/portfolio/page";
import NewsPage from "@/app/news/page";
import DashboardRoute from "@/app/dashboard/page";

describe("public route database failure states", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    for (const query of Object.values(queryMocks)) {
      query.mockRejectedValue(new Error("connection details must never reach the UI"));
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const routes = [
    {
      name: "deal tracker",
      renderPage: TrackerPage,
      title: "Deal data could not be loaded.",
      retryHref: "/tracker",
    },
    {
      name: "fund database",
      renderPage: FundsPage,
      title: "Fund data could not be loaded.",
      retryHref: "/funds",
    },
    {
      name: "portfolio database",
      renderPage: PortfolioPage,
      title: "Portfolio company data could not be loaded.",
      retryHref: "/portfolio",
    },
    {
      name: "news feed",
      renderPage: NewsPage,
      title: "News feed data could not be loaded.",
      retryHref: "/news",
    },
    {
      name: "conditions dashboard",
      renderPage: DashboardRoute,
      title: "Dashboard data could not be loaded.",
      retryHref: "/dashboard",
    },
  ] as const;

  for (const route of routes) {
    it(`shows a safe, route-specific retry state for the ${route.name}`, async () => {
      render(await route.renderPage());

      const alert = screen.getByRole("alert");
      expect(within(alert).getByRole("heading", { name: route.title })).toBeVisible();
      expect(alert).not.toHaveTextContent("connection details");
      expect(within(alert).getByRole("link", { name: "Try again" })).toHaveAttribute(
        "href",
        route.retryHref,
      );
      expect(within(alert).getByRole("link", { name: "Contact research" })).toHaveAttribute(
        "href",
        "mailto:research@infrasight.com",
      );
    });
  }
});
