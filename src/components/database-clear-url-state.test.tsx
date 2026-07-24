import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { CompanyListItem, DealListItem, FundListItem } from "@/modules/shared/types";

const navigation = vi.hoisted(() => ({
  pathname: "/tracker",
  push: vi.fn(),
  replace: vi.fn(),
}));
const analytics = vi.hoisted(() => ({ track: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigation.push, replace: navigation.replace, back: vi.fn() }),
  usePathname: () => navigation.pathname,
}));

vi.mock("@vercel/analytics", () => ({ track: analytics.track }));

import { DealDatabase } from "@/components/DealDatabase";
import { FundDatabase } from "@/components/FundDatabase";
import { NewsFeed } from "@/components/NewsFeed";
import { PortfolioDatabase } from "@/components/PortfolioDatabase";

const counts = { deals: 0, funds: 0, portfolio: 0 };
const deal: DealListItem = {
  id: "deal-db-id",
  legacyId: "DEAL-FOCUS",
  title: "Manager acquires GridCo",
  target: "GridCo",
  buyer: "Manager",
  seller: "Seller",
  sector: "Utilities",
  subsector: "Electric Utility",
  region: "North America",
  category: ["Acquisition"],
  date: "2026-07-01",
  status: "Announced",
  country: "United States",
  sourceName: "Source",
  sourceUrl: "https://example.test/deal",
};
const fund: FundListItem = {
  id: "FUND-FOCUS",
  legacyId: "FUND-FOCUS",
  managerName: "Manager",
  fundName: "Infrastructure Fund I",
  size: "USD 1bn",
  sizeUsdMm: 1_000,
  vintage: "2026",
  strategies: ["Core"],
  status: "Raising",
  sectors: ["Utilities"],
};
const company: CompanyListItem = {
  id: "company-focus",
  focusIds: ["company-focus"],
  name: "GridCo",
  investmentFirm: "Manager",
  sector: "Utilities",
  subsector: "Electric Utility",
  region: "North America",
  country: "United States",
  ownershipVehicle: "Infrastructure Fund I",
  status: "Active",
  countryTags: ["United States"],
  investmentYear: 2026,
  owners: [{
    firm: "Manager",
    vehicle: "Infrastructure Fund I",
    fundName: "Infrastructure Fund I",
    investmentYear: 2026,
    isActive: true,
  }],
};

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
    analytics.track.mockReset();
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

  it("tracks weekly email access without attaching record or query data", async () => {
    navigation.pathname = "/tracker";
    window.history.replaceState({}, "", "/tracker?q=private-query");
    render(<DealDatabase deals={[]} counts={counts} />);

    const weeklyEmailLink = screen.getAllByRole("link", { name: "Weekly email" })[0];
    weeklyEmailLink.addEventListener("click", (event) => event.preventDefault(), { once: true });
    await userEvent.click(weeklyEmailLink);

    expect(analytics.track).toHaveBeenCalledWith("weekly_email_opened");
    expect(analytics.track).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(analytics.track.mock.calls)).not.toContain("private-query");
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

  it.each([
    {
      pathname: "/tracker",
      focus: deal.legacyId,
      entity: "deal",
      renderDatabase: () => <DealDatabase deals={[deal]} counts={counts} />,
    },
    {
      pathname: "/funds",
      focus: fund.legacyId,
      entity: "fund",
      renderDatabase: () => <FundDatabase funds={[fund]} counts={counts} />,
    },
    {
      pathname: "/portfolio",
      focus: company.id,
      entity: "company",
      renderDatabase: () => <PortfolioDatabase companies={[company]} funds={[]} counts={counts} />,
    },
  ])("tracks a direct $entity focus only once", async ({
    pathname,
    focus,
    entity,
    renderDatabase,
  }) => {
    navigation.pathname = pathname;
    window.history.replaceState({}, "", `${pathname}?focus=${focus}`);

    const view = render(renderDatabase());
    await waitFor(() => expect(analytics.track).toHaveBeenCalledWith("drawer_opened", { entity }));

    view.rerender(renderDatabase());
    await waitFor(() => expect(analytics.track.mock.calls.filter(
      ([name]) => name === "drawer_opened",
    )).toHaveLength(1));
  });

  it("does not double-count a manual drawer open when its focus URL synchronizes", async () => {
    navigation.pathname = "/tracker";
    window.history.replaceState({}, "", "/tracker");
    render(<DealDatabase deals={[deal]} counts={counts} />);

    const rowTrigger = document.querySelector<HTMLButtonElement>("[data-deal-row-trigger]");
    expect(rowTrigger).not.toBeNull();
    await userEvent.click(rowTrigger!);

    await waitFor(() => expect(analytics.track.mock.calls.filter(
      ([name]) => name === "drawer_opened",
    )).toEqual([["drawer_opened", { entity: "deal" }]]));
  });

  it("distinguishes offline Fund provenance from a pending Research review", async () => {
    navigation.pathname = "/funds";
    window.history.replaceState({}, "", "/funds");
    const offlineFund = {
      ...fund,
      id: "fund-offline",
      legacyId: "FUND-OFFLINE",
      fundName: "Offline Infrastructure Fund",
    };
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/api/funds/")) {
        return {
          ok: false,
          status: 503,
          json: async () => ({ error: "Detail temporarily unavailable" }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ canExport: false }),
      };
    }));

    render(<FundDatabase funds={[offlineFund]} counts={counts} />);
    const rowTrigger = document.querySelector<HTMLButtonElement>("[data-fund-row-trigger]");
    expect(rowTrigger).not.toBeNull();
    await userEvent.click(rowTrigger!);

    const dialog = await screen.findByRole("dialog");
    await waitFor(() => {
      expect(within(dialog).getByText("Unavailable while verified detail is offline")).toBeVisible();
    });
    expect(within(dialog).queryByText("Pending Research review")).not.toBeInTheDocument();
  });
});
