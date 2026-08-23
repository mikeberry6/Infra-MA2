import { fireEvent, render, screen, within } from "@testing-library/react";
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
  fundAttribution: "DISCLOSED",
};

const residualOwner: OwnerView = {
  id: "residual",
  firm: "ArcLight Capital Partners",
  fundName: "ArcLight Energy Partners Fund V, L.P.",
  vehicle: "Chief Power Transfer Parent, LLC / Chief Power Finance, LLC residual tranche",
  investmentYear: 2014,
  isActive: true,
  stake: "Approximately 3% interest retained",
  fundAttribution: "DISCLOSED",
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
  fundAttribution: "DISCLOSED",
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
  it("renders the overlay and drawer in their final visible state without relying on an entrance animation", () => {
    const { container } = render(
      <PortCoDrawer
        company={chiefPower([financeIiOwner])}
        funds={funds}
        onClose={vi.fn()}
      />,
    );

    const overlay = container.firstElementChild;
    const dialog = screen.getByRole("dialog", { name: "Chief Power" });

    expect(overlay).toHaveClass("opacity-100");
    expect(overlay).not.toHaveClass("animate-fade-in");
    expect(dialog).toHaveClass("translate-x-0", "opacity-100");
    expect(dialog).not.toHaveClass("animate-slide-in-right");
  });

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

  it("reveals inferred-fund rationale on hover, focus, and tap", async () => {
    const user = userEvent.setup();
    const inferredOwner: OwnerView = {
      ...financeIiOwner,
      fundName: undefined,
      attributedFundName: "ArcLight Energy Partners Fund V, L.P.",
      fundAttribution: "INFERRED",
      attributionConfidence: "MEDIUM",
      attributionRationale: "Estimated from the acquisition year and the manager's active North American fund vintage.",
    };

    render(
      <PortCoDrawer
        company={chiefPower([inferredOwner])}
        funds={funds}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Estimated · Medium confidence")).toBeInTheDocument();
    expect(screen.queryByText(inferredOwner.attributionRationale!)).not.toBeInTheDocument();

    const editorialRationale = "Public sources do not name the exact fund. The displayed fund is an estimate based on the disclosed manager, investment timing, and the fund's investment mandate.";

    const trigger = screen.getByRole("button", {
      name: "Estimated · Medium confidence. Show estimate rationale",
    });

    await user.hover(trigger);
    expect(screen.getByRole("tooltip")).toHaveTextContent(editorialRationale);
    expect(screen.getByRole("tooltip")).not.toHaveTextContent(inferredOwner.attributionRationale!);
    await user.unhover(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    fireEvent.focus(trigger);
    expect(screen.getByRole("tooltip")).toHaveTextContent(editorialRationale);
    fireEvent.blur(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    fireEvent.focus(trigger);
    expect(screen.getByRole("tooltip")).toHaveTextContent(editorialRationale);
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Chief Power" })).toBeInTheDocument();

    await user.click(trigger);
    expect(screen.getByRole("tooltip")).toHaveTextContent(editorialRationale);
    await user.click(screen.getByRole("heading", { name: "Chief Power" }));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("uses the estimate disclosure for inferred prior owners", async () => {
    const user = userEvent.setup();
    const inferredFormerOwner: OwnerView = {
      ...formerOwner,
      fundName: undefined,
      attributedFundName: "ArcLight Energy Partners Fund V, L.P.",
      fundAttribution: "INFERRED",
      attributionConfidence: "LOW",
      attributionRationale: "Estimated from the former owner's acquisition timing and fund sequence.",
    };

    render(
      <PortCoDrawer
        company={chiefPower([financeIiOwner, inferredFormerOwner])}
        funds={funds}
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Show 1 prior owner" }));
    const former = screen.getByRole("group", {
      name: "ArcLight Capital Partners — ArcLight Energy Partners Fund V, L.P. — Chief Power Finance, LLC (pre-restructuring controlling tranche) — Estimated · Low confidence — 2014-2020 ownership period",
    });
    const trigger = within(former).getByRole("button", {
      name: "Estimated · Low confidence. Show estimate rationale",
    });

    expect(screen.queryByText(inferredFormerOwner.attributionRationale!)).not.toBeInTheDocument();
    await user.hover(trigger);
    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "Public sources do not name the exact fund. The displayed fund is an estimate based on the disclosed manager, investment timing, and the fund's investment mandate.",
    );
    expect(screen.getByRole("tooltip")).not.toHaveTextContent(inferredFormerOwner.attributionRationale!);
  });

  it("keeps disclosed ownership understated and editorializes direct-program rationale", () => {
    const directProgramOwner: OwnerView = {
      ...financeIiOwner,
      id: "direct-program",
      fundName: undefined,
      attributedFundName: undefined,
      fundAttribution: "DIRECT_PROGRAM",
      attributionRationale: "Held through the manager's documented direct-investment program.",
    };

    const { rerender } = render(
      <PortCoDrawer
        company={chiefPower([financeIiOwner])}
        funds={funds}
        onClose={vi.fn()}
      />,
    );

    expect(screen.queryByText(/Estimated ·/)).not.toBeInTheDocument();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    rerender(
      <PortCoDrawer
        company={chiefPower([directProgramOwner])}
        funds={funds}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Direct / program investment")).toBeInTheDocument();
    expect(screen.queryByText(directProgramOwner.attributionRationale!)).not.toBeInTheDocument();
    expect(screen.getByText(
      "Public sources support ownership through a direct investment, managed account, or program, but do not identify a specific fund.",
    )).toBeInTheDocument();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
