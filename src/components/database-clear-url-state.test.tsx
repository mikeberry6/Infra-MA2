import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const navigation = vi.hoisted(() => ({
  pathname: "/tracker",
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigation.push, replace: navigation.replace, back: vi.fn() }),
  usePathname: () => navigation.pathname,
}));

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));

import { DealDatabase } from "@/components/DealDatabase";
import { FundDatabase } from "@/components/FundDatabase";
import { NewsFeed } from "@/components/NewsFeed";
import { PortfolioDatabase } from "@/components/PortfolioDatabase";

const counts = { deals: 0, funds: 0, portfolio: 0 };

async function expectAtomicClear({
  pathname,
  search,
  component,
}: {
  pathname: string;
  search: string;
  component: ReactElement;
}) {
  navigation.pathname = pathname;
  window.history.replaceState({}, "", `${pathname}${search}`);
  render(component);

  await userEvent.click(await screen.findByRole("button", { name: "Clear all" }));

  expect(navigation.push).toHaveBeenCalledTimes(1);
  expect(navigation.push).toHaveBeenCalledWith(`${pathname}?sort=name`, { scroll: false });
}

describe("database clear-all URL state", () => {
  beforeEach(() => {
    navigation.push.mockReset();
    navigation.replace.mockReset();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ canExport: false }),
    }));
  });

  it("clears deal search and taxonomy filters in one navigation", async () => {
    await expectAtomicClear({
      pathname: "/tracker",
      search: "?q=grid&sector=Digital&region=Europe&page=4&sort=name",
      component: <DealDatabase deals={[]} counts={counts} />,
    });
  });

  it("clears fund search and taxonomy filters in one navigation", async () => {
    await expectAtomicClear({
      pathname: "/funds",
      search: "?q=core&strategy=Core&status=Open&page=4&sort=name",
      component: <FundDatabase funds={[]} counts={counts} />,
    });
  });

  it("clears portfolio search and taxonomy filters in one navigation", async () => {
    await expectAtomicClear({
      pathname: "/portfolio",
      search: "?q=fiber&sector=Digital&country=United+States&page=4&sort=name",
      component: <PortfolioDatabase companies={[]} funds={[]} counts={counts} />,
    });
  });

  it("clears news search, taxonomy filters, and date window in one navigation", async () => {
    await expectAtomicClear({
      pathname: "/news",
      search: "?q=grid&category=Transaction+Activity&confidence=High+Confidence&window=30D&page=4&sort=name",
      component: <NewsFeed feed={{
        items: [],
        lastUpdated: "2026-07-22T23:00:00.000Z",
        operations: { state: "healthy", message: "No qualifying items." },
      }} />,
    });
  });

  it.each([
    ["/tracker", <DealDatabase key="deal" deals={[]} counts={counts} />],
    ["/funds", <FundDatabase key="fund" funds={[]} counts={counts} />],
    ["/portfolio", <PortfolioDatabase key="company" companies={[]} funds={[]} counts={counts} />],
  ] as const)("removes an invalid drawer focus from %s", async (pathname, component) => {
    navigation.pathname = pathname;
    window.history.replaceState({}, "", `${pathname}?focus=missing&sort=name`);

    render(component);

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith(
      `${pathname}?sort=name`,
      { scroll: false },
    ));
  });
});
