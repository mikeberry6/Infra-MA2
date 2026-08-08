import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActivitySplitPreview } from "./ActivitySplitPreview";

describe("ActivitySplitPreview", () => {
  it("shows the reviewed totals and non-color labels", () => {
    render(<ActivitySplitPreview />);

    expect(
      screen.getByRole("heading", {
        name: "Direct vs. portfolio-level activity",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Direct").parentElement).toHaveTextContent(
      "Direct14",
    );
    expect(screen.getByText("Portfolio").parentElement).toHaveTextContent(
      "Portfolio6",
    );
    expect(screen.getByText("Direct investment")).toBeInTheDocument();
    expect(screen.getByText("Portfolio-level activity")).toBeInTheDocument();
    expect(screen.getByText("3 direct · 4 portfolio")).toBeInTheDocument();
  });

  it("gives every stacked row a complete accessible summary", () => {
    render(<ActivitySplitPreview />);

    expect(
      screen.getByRole("img", {
        name: "Power & ET: 7 deals, 3 direct investments, 4 portfolio-level activities",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Europe: 8 deals, 6 direct investments, 2 portfolio-level activities",
      }),
    ).toBeInTheDocument();
  });
});
