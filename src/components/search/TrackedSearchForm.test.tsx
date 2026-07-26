import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TrackedSearchForm } from "./TrackedSearchForm";

const track = vi.hoisted(() => vi.fn());

vi.mock("@vercel/analytics", () => ({ track }));

describe("TrackedSearchForm analytics", () => {
  beforeEach(() => {
    track.mockReset();
  });

  it("derives has_query from the submitted value without recording its text", () => {
    render(<TrackedSearchForm query="initial private query" />);
    const searchbox = screen.getByRole("searchbox");
    fireEvent.change(searchbox, { target: { value: "" } });
    fireEvent.submit(searchbox.closest("form")!);

    expect(track).toHaveBeenCalledWith("search_submitted", {
      surface: "global_search",
      has_query: false,
    });
    expect(JSON.stringify(track.mock.calls)).not.toContain("initial private query");
  });

  it("records only that a non-empty query was submitted", () => {
    render(<TrackedSearchForm query="" />);
    const searchbox = screen.getByRole("searchbox");
    fireEvent.change(searchbox, { target: { value: "confidential target" } });
    fireEvent.submit(searchbox.closest("form")!);

    expect(track).toHaveBeenCalledWith("search_submitted", {
      surface: "global_search",
      has_query: true,
    });
    expect(JSON.stringify(track.mock.calls)).not.toContain("confidential target");
  });

  it("preserves the labelled responsive Phase 3 search contract", () => {
    render(<TrackedSearchForm query="existing" scope="fund" />);

    const searchbox = screen.getByRole("searchbox", {
      name: "Search InfraSight databases",
    });
    expect(searchbox).toHaveAttribute("minlength", "2");
    expect(searchbox).not.toHaveAttribute("autofocus");
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
    expect(document.querySelector('input[name="scope"]')).toHaveValue("fund");
  });
});
