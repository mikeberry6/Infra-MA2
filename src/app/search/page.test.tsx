import type { AnchorHTMLAttributes, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  searchAllWithMeta: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/modules/search/queries", () => ({
  SEARCH_PAGE_SIZE: 20,
  normalizeSearchQuery: (value: string | string[] | undefined) => {
    const first = Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
    return first.trim().slice(0, 200);
  },
  normalizeSearchScope: (value: string | string[] | undefined) => {
    const first = Array.isArray(value) ? value[0] : value;
    return first === "deal" || first === "company" || first === "fund" ? first : "all";
  },
  normalizeSearchPage: (value: string | string[] | undefined) => {
    const first = Array.isArray(value) ? value[0] : value;
    return first && /^\d+$/.test(first) ? Math.max(1, Number(first)) : 1;
  },
  groupSearchPageResults: (
    results: Array<{ type: "deal" | "company" | "fund" }>,
    firstRank = 1,
  ) => (["deal", "company", "fund"] as const)
    .map((type) => ({
      type,
      results: results.flatMap((result, index) => (
        result.type === type ? [{ result, rank: firstRank + index }] : []
      )),
    }))
    .filter((group) => group.results.length > 0),
  searchAllWithMeta: mocks.searchAllWithMeta,
}));

import SearchPage from "./page";

function params(values: {
  q?: string | string[];
  scope?: string | string[];
  page?: string | string[];
} = {}) {
  return Promise.resolve(values);
}

describe("search page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("explains the search universe and offers examples and database shortcuts", async () => {
    render(await SearchPage({ searchParams: params() }));

    expect(
      screen.getByRole("heading", { name: "Search the research universe" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Brookfield" })).toHaveAttribute(
      "href",
      "/search?q=Brookfield",
    );
    expect(screen.getByRole("link", { name: "Browse deals →" })).toHaveAttribute(
      "href",
      "/tracker",
    );
    expect(screen.getByRole("link", { name: "Browse funds →" })).toHaveAttribute(
      "href",
      "/funds",
    );
    expect(screen.getByRole("link", { name: "Browse PortCos →" })).toHaveAttribute(
      "href",
      "/portfolio",
    );
    expect(mocks.searchAllWithMeta).not.toHaveBeenCalled();
  });

  it("groups one globally ranked page while preserving direct drawer links", async () => {
    mocks.searchAllWithMeta.mockResolvedValue({
      results: [
        {
          type: "fund",
          id: "fund-id",
          legacyId: "fund & one",
          title: "Fiber Infrastructure Fund",
          subtitle: "Example Manager",
        },
        {
          type: "deal",
          id: "deal-id",
          legacyId: "deal-one",
          title: "Fiber Transaction",
          subtitle: "A transaction",
          sector: "Digital",
          region: "North America",
        },
        {
          type: "company",
          id: "company & one",
          title: "Fiber Platform",
          subtitle: "United States",
          sector: "Digital",
          region: "North America",
        },
      ],
      total: 3,
      scopeTotal: 3,
      counts: { deal: 1, company: 1, fund: 1 },
      scope: "all",
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });

    render(await SearchPage({ searchParams: params({ q: "  Fiber  " }) }));

    expect(mocks.searchAllWithMeta).toHaveBeenCalledWith("Fiber", {
      scope: "all",
      page: 1,
    });
    expect(
      screen.getByRole("navigation", { name: "Search result scopes" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "All results" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Deals" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Companies" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Funds" })).toBeInTheDocument();
    expect(screen.getByText("· Relevance #1")).toBeInTheDocument();
    expect(screen.getByText("· Relevance #2")).toBeInTheDocument();
    expect(screen.getByText("· Relevance #3")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Fiber Platform/ })).toHaveAttribute(
      "href",
      "/portfolio?focus=company%20%26%20one",
    );
    expect(screen.getByRole("link", { name: /Fiber Infrastructure Fund/ })).toHaveAttribute(
      "href",
      "/funds?focus=fund%20%26%20one",
    );
  });

  it("retains scope and page in result navigation", async () => {
    mocks.searchAllWithMeta.mockResolvedValue({
      results: [{
        type: "fund",
        id: "fund-21",
        legacyId: "fund-21",
        title: "Infrastructure Fund XXI",
        subtitle: "Example Manager",
      }],
      total: 66,
      scopeTotal: 41,
      counts: { deal: 18, company: 7, fund: 41 },
      scope: "fund",
      page: 2,
      pageSize: 20,
      totalPages: 3,
    });

    render(await SearchPage({
      searchParams: params({ q: "infra", scope: "fund", page: "2" }),
    }));

    expect(screen.getByText(/Showing/)).toHaveTextContent(
      "Showing 21-40 of 41 funds for “infra”",
    );
    expect(
      screen.getByRole("link", { name: /Deals\s*18/ }),
    ).toHaveAttribute("href", "/search?q=infra&scope=deal");
    expect(screen.getByRole("link", { name: "← Previous" })).toHaveAttribute(
      "href",
      "/search?q=infra&scope=fund",
    );
    expect(screen.getByRole("link", { name: "Next →" })).toHaveAttribute(
      "href",
      "/search?q=infra&scope=fund&page=3",
    );
  });
});
