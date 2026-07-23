import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { CompanyView } from "@/modules/shared/types";
import { PortCoDrawer } from "./PortCoDrawer";

const company: CompanyView = {
  id: "company-1",
  focusIds: ["PORTCO-1"],
  name: "GridCo",
  investmentFirm: "Alpha Infrastructure",
  sector: "Utilities",
  subsector: "Electricity Networks",
  region: "North America",
  country: "United States",
  ownershipVehicle: "Alpha Fund I",
  description: "GridCo owns and operates regulated electricity networks.",
  status: "Active",
  countryTags: ["United States"],
  website: "https://gridco.example.com",
  headquarters: "Boston, Massachusetts",
  investmentYear: 2022,
  milestones: [],
  management: [],
  sources: [],
  owners: [],
};

describe("PortCoDrawer detail request states", () => {
  it("opens an aria-live loading shell with an accessible website link", () => {
    render(
      <PortCoDrawer
        company={company}
        funds={[]}
        detailStatus="loading"
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog", { name: "GridCo" })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Loading complete company detail");
    expect(screen.getByRole("link", { name: "Open GridCo website" })).toHaveAttribute(
      "href",
      "https://gridco.example.com",
    );
  });

  it("announces a failed request and exposes retry", async () => {
    const onRetry = vi.fn();
    render(
      <PortCoDrawer
        company={company}
        funds={[]}
        detailStatus="error"
        onRetry={onRetry}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("temporarily unavailable");
    await userEvent.click(screen.getByRole("button", { name: "Retry detail request" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
