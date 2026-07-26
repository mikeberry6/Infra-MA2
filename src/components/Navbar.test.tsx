import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "./Navbar";

const mocks = vi.hoisted(() => ({
  track: vi.fn(),
  pathname: "/tracker",
}));

vi.mock("@vercel/analytics", () => ({ track: mocks.track }));
vi.mock("next/navigation", () => ({ usePathname: () => mocks.pathname }));

describe("Navbar analytics", () => {
  beforeEach(() => {
    mocks.track.mockReset();
  });

  it("records a desktop search without sending the query text", () => {
    render(<Navbar />);
    const searchForm = screen.getAllByRole("search")[0];
    const input = within(searchForm).getByRole("searchbox");
    fireEvent.change(input, { target: { value: "confidential acquisition target" } });

    fireEvent.submit(searchForm);

    expect(mocks.track).toHaveBeenCalledWith("search_submitted", {
      surface: "navbar",
      has_query: true,
    });
    expect(JSON.stringify(mocks.track.mock.calls)).not.toContain("confidential acquisition target");
  });

  it("records whether a submitted search is empty", () => {
    render(<Navbar />);
    fireEvent.submit(screen.getAllByRole("search")[0]);

    expect(mocks.track).toHaveBeenCalledWith("search_submitted", {
      surface: "navbar",
      has_query: false,
    });
  });
});
