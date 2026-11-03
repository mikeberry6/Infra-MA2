import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, it, expect, vi } from "vitest";
import type { DatabaseCounts, DealView } from "@/modules/shared/types";
const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router, usePathname: () => "/tracker" }));
vi.mock("@/hooks/useCanExport", () => ({ useCanExport: () => true }));
vi.mock("./DealDatabase/DynamicInsightsHero", () => ({ DynamicInsightsHero: ({ filteredDeals }: { filteredDeals: DealView[] }) => <output data-testid="ranking-deals">{filteredDeals.map(d => d.id).join(",")}</output> }));
vi.mock("./shared/CTABlock", () => ({ CTABlock: () => null }));
vi.mock("./shared/DatabaseTiles", () => ({ DatabaseTiles: () => null }));
import { DealDatabase } from "./DealDatabase";
const base: DealView = { id: "one", legacyId: "one", title: "One acquisition", target: "One", buyer: "Fund", seller: "N/A", sector: "Digital", subsector: "Fiber", region: "Europe", category: ["Acquisition (Buyout)"], date: "2026-10-29", description: "Description", targetDescription: "Target", sourceName: "Source", sourceUrl: "https://example.test/one", enterpriseValue: null, equityValue: null, stake: null, status: "Announced", closingDate: null, financialAdvisorBuyer: null, financialAdvisorSeller: null, legalAdvisorBuyer: null, legalAdvisorSeller: null, country: "UK", assetScale: null, valuationMultiple: null, fundVehicle: null, keyHighlights: [], briefings: [{ edition: "2026-10-30", archivePath: "/email-format/2026-10-30.html" }] };
const deals = [base, { ...base, id: "two", legacyId: "two", target: "Two", sector: "Utilities", briefings: [] }];
function mount() { return render(<DealDatabase deals={deals} counts={{} as DatabaseCounts} briefingIssues={[{ edition: "2026-10-30", archivePath: "/email-format/2026-10-30.html" }]} />); }
beforeEach(() => {
  window.history.replaceState(null, "", "/tracker");
  for (const method of [router.push, router.replace]) method.mockImplementation((href: string) => window.history.pushState(null, "", href));
});
afterEach(cleanup);
it("filters tables, rankings and export links by issue and resets pagination", async () => {
  window.history.replaceState(null, "", "/tracker?page=3"); mount();
  fireEvent.change(screen.getByLabelText("Weekly briefing"), { target: { value: "2026-10-30" } });
  await waitFor(() => expect(screen.getByTestId("ranking-deals")).toHaveTextContent(/^one$/));
  expect(window.location.search).toContain("briefing=2026-10-30");
  expect(window.location.search).not.toContain("page=");
  expect(screen.getByRole("link", { name: "Export" })).toHaveAttribute("href", "/api/exports/deals?briefing=2026-10-30");
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
