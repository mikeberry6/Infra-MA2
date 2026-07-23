import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button, ButtonLink } from "./Button";

describe("shared actions", () => {
  it("renders true buttons for actions", () => {
    render(<Button variant="primary">Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });

  it("renders navigation as one anchor without nesting a button", () => {
    render(<ButtonLink href="/tracker" variant="primary">Browse deals</ButtonLink>);
    const link = screen.getByRole("link", { name: "Browse deals" });
    expect(link).toHaveAttribute("href", "/tracker");
    expect(link.querySelector("button")).toBeNull();
  });
});
