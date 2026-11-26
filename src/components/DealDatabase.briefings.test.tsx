import { render, screen, fireEvent, waitFor, cleanup, within } from "@testing-library/react";
import { afterEach, beforeEach, it, expect, vi } from "vitest";
import type { DealView } from "@/modules/shared/types";
const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router, usePathname: () => "/tracker" }));
vi.mock("@/hooks/useCanExport", () => ({ useCanExport: () => true }));
vi.mock("./DealDatabase/DynamicInsightsHero", () => ({ DynamicInsightsHero: ({ filteredDeals }: { filteredDeals: DealView[] }) => <output data-testid="ranking-deals">{filteredDeals.map(d => d.id).join(",")}</output> }));
vi.mock("./shared/CTABlock", () => ({ CTABlock: () => null }));
import { DealDatabase } from "./DealDatabase";
const base: DealView = { id: "one", legacyId: "one", title: "One acquisition", target: "One", buyer: "Fund", seller: "N/A", sector: "Digital", subsector: "Fiber", region: "Europe", category: ["Acquisition (Buyout)"], date: "2026-10-29", description: "Description", targetDescription: "Target", sourceName: "Source", sourceUrl: "https://example.test/one", enterpriseValue: null, equityValue: null, stake: null, status: "Announced", closingDate: null, financialAdvisorBuyer: null, financialAdvisorSeller: null, legalAdvisorBuyer: null, legalAdvisorSeller: null, country: "UK", assetScale: null, valuationMultiple: null, fundVehicle: null, keyHighlights: [], briefings: [{ edition: "2026-10-30", archivePath: "/email-format/2026-10-30.html" }] };
const deals = [base, { ...base, id: "two", legacyId: "two", target: "Two", date: "2026-11-02", sector: "Utilities", briefings: [] }];
function mount() { return render(<DealDatabase deals={deals} briefingIssues={[{ edition: "2026-10-30", archivePath: "/email-format/2026-10-30.html" }]} />); }
beforeEach(() => {
  window.history.replaceState(null, "", "/tracker");
  for (const method of [router.push, router.replace]) method.mockImplementation((href: string) => window.history.pushState(null, "", href));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("shows one deal count and the latest disclosure for the current filters", async () => {
  window.history.replaceState(null, "", "/tracker?page=3&direction=asc");
  mount();
  const resultCount = screen.getByRole("status", { name: "Deal count" });
  const heading = screen.getByRole("heading", { name: "Infrastructure Deal Tape", level: 1 });
  const disclosure = heading.nextElementSibling;
  expect(resultCount).toHaveTextContent(/^2 deals$/);
  expect(disclosure).toHaveTextContent("Latest disclosure Nov 2, 2026");
  expect(disclosure?.querySelector("time")).toHaveAttribute("datetime", "2026-11-02");
  expect(heading.closest("header")).not.toHaveTextContent(/matching deals|\d+ deals/i);
  const tabs = screen.getByRole("navigation", { name: "Databases" });
  expect(within(tabs).getByRole("link", { name: "Deals" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("region", { name: "Deal results" })).not.toHaveTextContent(/Showing \d+ of \d+ matching deals/);

  function changeScreen(query: string) {
    window.history.pushState(null, "", `/tracker${query}`);
    fireEvent.popState(window);
  }

  changeScreen("?briefing=2026-10-30");
  await waitFor(() => expect(resultCount).toHaveTextContent(/^1 of 2 deals$/));
  expect(disclosure).toHaveTextContent("Latest matching disclosure Oct 29, 2026");
  expect(disclosure?.querySelector("time")).toHaveAttribute("datetime", "2026-10-29");

  changeScreen("?briefing=2026-10-30&sector=Utilities");
  await waitFor(() => expect(resultCount).toHaveTextContent(/^0 of 2 deals$/));
  expect(disclosure).toHaveTextContent("No matching disclosures");
  expect(disclosure?.querySelector("time")).toBeNull();

  changeScreen("?q=Fund");
  await waitFor(() => expect(resultCount).toHaveTextContent(/^2 of 2 deals$/));
  expect(disclosure).toHaveTextContent("Latest matching disclosure Nov 2, 2026");

  changeScreen("");
  await waitFor(() => expect(resultCount).toHaveTextContent(/^2 deals$/));
  expect(disclosure).toHaveTextContent("Latest disclosure Nov 2, 2026");
});

it("filters tables, rankings and export links by issue and resets pagination", async () => {
  window.history.replaceState(null, "", "/tracker?page=3"); mount();
  fireEvent.change(screen.getByLabelText("Weekly briefing"), { target: { value: "2026-10-30" } });
  await waitFor(() => expect(screen.getByTestId("ranking-deals")).toHaveTextContent(/^one$/));
  expect(window.location.search).toContain("briefing=2026-10-30");
  expect(window.location.search).not.toContain("page=");
  expect(screen.getByRole("link", { name: "Export filtered results" })).toHaveAttribute("href", "/api/exports/deals?briefing=2026-10-30&scope=filtered");
  fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
  await waitFor(() => expect(screen.getByTestId("ranking-deals")).toHaveTextContent("one,two"));
});
it("combines issue and sector URL filters and follows browser navigation", async () => {
  mount();
  window.history.pushState(null, "", "/tracker?briefing=2026-10-30&sector=Utilities"); fireEvent.popState(window);
  await waitFor(() => expect(screen.getByTestId("ranking-deals")).toBeEmptyDOMElement());
  window.history.pushState(null, "", "/tracker?briefing=2026-10-30&sector=Digital"); fireEvent.popState(window);
  await waitFor(() => expect(screen.getByTestId("ranking-deals")).toHaveTextContent(/^one$/));
  window.history.pushState(null, "", "/tracker"); fireEvent.popState(window);
  await waitFor(() => expect(screen.getByTestId("ranking-deals")).toHaveTextContent("one,two"));
});
it("keeps an unknown edition scoped to an empty result", async () => {
  window.history.replaceState(null, "", "/tracker?briefing=2025-01-01"); mount();
  await waitFor(() => expect(screen.getByTestId("ranking-deals")).toBeEmptyDOMElement());
  expect(screen.getByRole("option", { name: "Unavailable issue: 2025-01-01" })).toBeInTheDocument();
});

it("loads deal details on demand and retries a failed drawer request", async () => {
  const fetch = vi.fn()
    .mockResolvedValueOnce({ ok: false })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ deal: base }) });
  vi.stubGlobal("fetch", fetch);
  mount();
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.click(within(screen.getByRole("table")).getByRole("link", { name: "One" }));

  const drawer = within(screen.getByRole("dialog"));
  await expect(drawer.findByRole("alert")).resolves.toHaveTextContent("Deal details could not be loaded.");
  expect(drawer.getByRole("link", { name: "Open full deal profile" })).toHaveAttribute("href", "/deals/one");
  expect(drawer.getByRole("link", { name: "Source" })).toBeVisible();

  fireEvent.click(drawer.getByRole("button", { name: "Try again" }));
  await expect(drawer.findByText("Target", { exact: true })).resolves.toBeVisible();
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch).toHaveBeenLastCalledWith("/api/deals/one", { signal: expect.any(AbortSignal) });
});
