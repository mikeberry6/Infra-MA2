import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmailAccessLinks } from "./DealDatabase";

describe("EmailAccessLinks", () => {
  it("keeps the email action and adds the app-native weekly briefing beside it", () => {
    render(<EmailAccessLinks />);

    expect(
      screen.getByRole("link", { name: "Weekly briefing" }),
    ).toHaveAttribute("href", "/weekly-briefing");
    expect(screen.getByRole("link", { name: "Weekly email" })).toHaveAttribute(
      "href",
      "/email-format/latest",
    );
    expect(screen.getByRole("link", { name: "One-offs" })).toHaveAttribute(
      "href",
      "/one-off-requests",
    );
  });
});
