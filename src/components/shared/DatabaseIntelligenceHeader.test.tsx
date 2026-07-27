import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DatabaseIntelligenceHeader } from "./DatabaseIntelligenceHeader";

describe("DatabaseIntelligenceHeader", () => {
  it("renders all supplied summary metrics", () => {
    render(
      <DatabaseIntelligenceHeader
        eyebrow="Transaction intelligence"
        title="Deal tape"
        summary="Research summary"
        metrics={[
          { label: "Visible deals", value: "25", detail: "One active filter" },
          { label: "Top sector", value: "Digital" },
          { label: "Top region", value: "North America" },
          { label: "Latest disclosure", value: "Jul 24, 2026" },
        ]}
      />,
    );

    expect(screen.getByText("Visible deals")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("Digital")).toBeInTheDocument();
    expect(screen.getByText("North America")).toBeInTheDocument();
    expect(screen.getByText("Jul 24, 2026")).toBeInTheDocument();
  });
});
