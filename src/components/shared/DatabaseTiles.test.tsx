import type { AnchorHTMLAttributes, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  pathname: "/tracker",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { DatabaseTiles } from "./DatabaseTiles";

const counts = { deals: 1_234, funds: 56, portfolio: 789 };

describe("DatabaseTiles", () => {
  beforeEach(() => {
    navigation.pathname = "/tracker";
  });

  it("uses navigation semantics and identifies only the current database page", () => {
    render(<DatabaseTiles counts={counts} />);

    const databaseNavigation = screen.getByRole("navigation", { name: "Database" });
    expect(databaseNavigation).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Deals\s*1,234/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Funds" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });

  it("does not treat the permanently redirected root as an active tab", () => {
    navigation.pathname = "/";
    render(<DatabaseTiles counts={counts} />);

    expect(screen.getByRole("link", { name: "Deals" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
