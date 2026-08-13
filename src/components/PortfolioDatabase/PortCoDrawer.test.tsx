import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CompanyView, FundStrategyView, OwnerView } from "@/modules/shared/types";
import { PortCoDrawer } from "./PortCoDrawer";

const funds: FundStrategyView[] = [{
  fundName: "ArcLight Energy Partners Fund V, L.P.",
  strategies: ["Value-Add"],
}];

const financeIiOwner: OwnerView = {
  id: "finance-ii",
  firm: "ArcLight Capital Partners",
  fundName: "ArcLight Energy Partners Fund V, L.P.",
  vehicle: "Chief Power Finance II, LLC",
  investmentYear: 2019,
  isActive: true,
  stake: "Greater than 10% voting interest",
};

const residualOwner: OwnerView = {
  id: "residual",
  firm: "ArcLight Capital Partners",
  fundName: "ArcLight Energy Partners Fund V, L.P.",
  vehicle: "Chief Power Transfer Parent, LLC / Chief Power Finance, LLC residual tranche",
  investmentYear: 2014,
  isActive: true,
  stake: "Approximately 3% interest retained",
};

const formerOwner: OwnerView = {
  id: "former",
  firm: "ArcLight Capital Partners",
  fundName: "ArcLight Energy Partners Fund V, L.P.",
  vehicle: "Chief Power Finance, LLC (pre-restructuring controlling tranche)",
  investmentYear: 2014,
  exitYear: 2020,
  isActive: false,
  stake: "96.4% voting interest",
};

function chiefPower(owners: OwnerView[]): CompanyView {
  return {
    id: "chief-power",
    focusIds: ["chief-power"],
    name: "Chief Power",
    investmentFirm: "ArcLight Capital Partners",
    sector: "Power & ET",
    subsector: "Coal-fired power generation",
    region: "North America",
    country: "United States",
    ownershipVehicle: "Chief Power Finance II, LLC",
    description: "Merchant-generation platform holding interests in the Keystone and Conemaugh generating stations.",
    status: "Active",
    countryTags: ["United States"],
    investmentYear: 2019,
    owners,
  };
}

describe("PortCoDrawer ownership periods", () => {
  it("keeps same-manager active vehicles separate and binds each stake and date to its period", async () => {
    const user = userEvent.setup();
    render(
      <PortCoDrawer
        company={chiefPower([financeIiOwner, residualOwner, formerOwner])}
        funds={funds}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Active since 2014")).toBeInTheDocument();

    const financeIi = screen.getByRole("group", {
      name: "ArcLight Capital Partners — ArcLight Energy Partners Fund V, L.P. — Chief Power Finance II, LLC — 2019-Present ownership period",
    });
    expect(within(financeIi).getByText("ArcLight Energy Partners Fund V, L.P.")).toBeInTheDocument();
    expect(within(financeIi).getByText("Chief Power Finance II, LLC")).toBeInTheDocument();
    expect(within(financeIi).getByText("2019-Present")).toBeInTheDocument();
    expect(financeIi).toHaveTextContent("Stake: Greater than 10% voting interest");

    const residual = screen.getByRole("group", {
      name: "ArcLight Capital Partners — ArcLight Energy Partners Fund V, L.P. — Chief Power Transfer Parent, LLC / Chief Power Finance, LLC residual tranche — 2014-Present ownership period",
    });
    expect(within(residual).getByText("2014-Present")).toBeInTheDocument();
    expect(within(residual).getByText("Chief Power Transfer Parent, LLC / Chief Power Finance, LLC residual tranche")).toBeInTheDocument();
    expect(residual).toHaveTextContent("Stake: Approximately 3% interest retained");

    await user.click(screen.getByRole("button", { name: "Show 1 prior owner" }));
    const former = screen.getByRole("group", {
      name: "ArcLight Capital Partners — ArcLight Energy Partners Fund V, L.P. — Chief Power Finance, LLC (pre-restructuring controlling tranche) — 2014-2020 ownership period",
    });
    expect(within(former).getByText("ArcLight Energy Partners Fund V, L.P.")).toBeInTheDocument();
    expect(within(former).getByText("2014-2020")).toBeInTheDocument();
    expect(former).toHaveTextContent("Stake: 96.4% voting interest");
  });

  it("preserves every ownership period even when the display fields match", () => {
    render(
      <PortCoDrawer
        company={chiefPower([financeIiOwner, { ...financeIiOwner, id: "finance-ii-second-period" }])}
        funds={funds}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getAllByText("Chief Power Finance II, LLC")).toHaveLength(2);
    expect(screen.getAllByRole("group", {
      name: "ArcLight Capital Partners — ArcLight Energy Partners Fund V, L.P. — Chief Power Finance II, LLC — 2019-Present ownership period",
    })).toHaveLength(2);
  });
});
