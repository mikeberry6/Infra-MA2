import type { AnchorHTMLAttributes, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  searchAll: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/modules/search/queries", () => ({
  MIN_SEARCH_QUERY_LENGTH: 2,
  SEARCH_PAGE_SIZE: 20,
  normalizeSearchQuery: (query: string) => query.trim().replace(/\s+/g, " "),
  coerceSearchScope: (scope: string) => (
    scope === "deals" || scope === "companies" || scope === "funds" ? scope : "all"
  ),
  searchResultHref: (result: { type: string; id: string; legacyId?: string }) => {
    const focus = encodeURIComponent(result.legacyId ?? result.id);
    if (result.type === "deal") return `/tracker?focus=${focus}`;
    if (result.type === "company") return `/portfolio?focus=${focus}`;
    return `/funds?focus=${focus}`;
  },
  searchAll: mocks.searchAll,
}));

import SearchPage from "./page";

function params(values: { q?: string; scope?: string; page?: string } = {}) {
  return Promise.resolve(values);
}

describe("search page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("explains scope and offers examples and database shortcuts before a query", async () => {
    render(await SearchPage({ searchParams: params() }));

    expect(screen.getByRole("heading", { name: "Search the full research universe" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Brookfield" })).toHaveAttribute("href", "/search?q=Brookfield");
    expect(screen.getByRole("link", { name: /Deal Database/ })).toHaveAttribute("href", "/tracker");
    expect(screen.getByRole("link", { name: /Fund Database/ })).toHaveAttribute("href", "/funds");
    expect(screen.getByRole("link", { name: /PortCo Database/ })).toHaveAttribute("href", "/portfolio");
    expect(mocks.searchAll).not.toHaveBeenCalled();
  });

  it("shows distinct minimum-length guidance without querying", async () => {
    render(await SearchPage({ searchParams: params({ q: "x" }) }));

    expect(screen.getByRole("heading", { name: "Keep typing" })).toBeInTheDocument();
    expect(screen.getAllByText(/at least two characters/i)).toHaveLength(2);
    expect(mocks.searchAll).not.toHaveBeenCalled();
  });

  it("renders accurate scope counts, relevance guidance, and encoded drawer links", async () => {
    mocks.searchAll.mockResolvedValue({
      query: "Fiber",
      scope: "all",
      results: [
        {
          type: "deal",
          id: "deal-one",
          legacyId: "deal-one",
          title: "Fiber Transaction",
          subtitle: "Fiber transaction",
          sector: "Digital",
          region: "North America",
          match: "exact",
        },
        {
          type: "company",
          id: "company & one",
          title: "Fiber Platform",
          subtitle: "United States",
          sector: "Digital",
          region: "North America",
          match: "prefix",
        },
      ],
      counts: { deals: 3, companies: 1, funds: 2 },
      total: 6,
      scopedTotal: 6,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });

    render(await SearchPage({ searchParams: params({ q: "  Fiber  " }) }));

    expect(mocks.searchAll).toHaveBeenCalledWith("Fiber", { scope: "all", page: 1 });
    expect(screen.getByRole("navigation", { name: "Search result scope" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "All, 6 results" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Deals, 3 results" })).toHaveAttribute("href", "/search?q=Fiber&scope=deals");
    expect(screen.getByRole("link", { name: "PortCos, 1 result" })).toHaveAttribute("href", "/search?q=Fiber&scope=companies");
    expect(screen.getByText(/ranked by exact name, name prefix, then descriptive match/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Deals" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "PortCos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Fiber Platform/ })).toHaveAttribute(
      "href",
      "/portfolio?focus=company%20%26%20one",
    );
  });

  it("paginates within the selected entity scope while retaining total counts", async () => {
    mocks.searchAll.mockResolvedValue({
      query: "infra",
      scope: "funds",
      results: [{
        type: "fund",
        id: "fund-21",
        legacyId: "fund-21",
        title: "Infrastructure Fund XXI",
        subtitle: "Example Manager",
        match: "body",
      }],
      counts: { deals: 18, companies: 7, funds: 41 },
      total: 66,
      scopedTotal: 41,
      page: 2,
      pageSize: 20,
      totalPages: 3,
    });

    render(await SearchPage({ searchParams: params({ q: "infra", scope: "funds", page: "2" }) }));

    expect(screen.getByText(/showing/i)).toHaveTextContent("21–40 of 41 funds results");
    expect(screen.getByRole("navigation", { name: "Search result pages" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Previous/ })).toHaveAttribute("href", "/search?q=infra&scope=funds");
    expect(screen.getByRole("link", { name: /Next/ })).toHaveAttribute("href", "/search?q=infra&scope=funds&page=3");
  });

  it("distinguishes a scoped empty view from a query with no matches anywhere", async () => {
    mocks.searchAll.mockResolvedValueOnce({
      query: "grid",
      scope: "funds",
      results: [],
      counts: { deals: 2, companies: 1, funds: 0 },
      total: 3,
      scopedTotal: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    });

    const scoped = render(await SearchPage({ searchParams: params({ q: "grid", scope: "funds" }) }));
    expect(screen.getByRole("heading", { name: "No funds matched" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View all results" })).toHaveAttribute("href", "/search?q=grid");
    scoped.unmount();

    mocks.searchAll.mockResolvedValueOnce({
      query: "zzzz",
      scope: "all",
      results: [],
      counts: { deals: 0, companies: 0, funds: 0 },
      total: 0,
      scopedTotal: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    });
    render(await SearchPage({ searchParams: params({ q: "zzzz" }) }));
    expect(screen.getByRole("heading", { name: "No results matched" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Brookfield" })).toBeInTheDocument();
  });
});
