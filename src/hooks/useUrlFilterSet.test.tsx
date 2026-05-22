import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/navigation BEFORE importing the hook
const replace = vi.fn((url: string) => {
  // Simulate the router by syncing window.location.search
  const qs = url.includes("?") ? url.split("?")[1] : "";
  window.history.replaceState({}, "", `/${qs ? `?${qs}` : ""}`);
});
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn(), back: vi.fn() }),
  usePathname: () => "/tracker",
}));

import { useUrlFilterSet, useClearUrlFilters } from "./useUrlFilterSet";

function Harness() {
  const [sectors, toggle, clear] = useUrlFilterSet("sector");
  const clearAll = useClearUrlFilters(["sector", "region"]);
  return (
    <div>
      <span data-testid="sectors">{Array.from(sectors).sort().join("|")}</span>
      <button onClick={() => toggle("Digital")}>toggle-digital</button>
      <button onClick={() => toggle("Utilities")}>toggle-utilities</button>
      <button onClick={clear}>clear</button>
      <button onClick={clearAll}>clear-all</button>
    </div>
  );
}

describe("useUrlFilterSet", () => {
  beforeEach(() => {
    replace.mockClear();
    window.history.replaceState({}, "", "/");
  });

  it("reads an empty set when the param is absent", () => {
    render(<Harness />);
    expect(screen.getByTestId("sectors")).toHaveTextContent("");
  });

  it("reads the set from the URL on mount", () => {
    window.history.replaceState({}, "", "/?sector=Digital,Utilities");
    render(<Harness />);
    expect(screen.getByTestId("sectors")).toHaveTextContent("Digital|Utilities");
  });

  it("toggle adds a value and writes it to the URL", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByText("toggle-digital"));
    expect(replace).toHaveBeenCalledWith("/tracker?sector=Digital", { scroll: false });
  });

  it("toggle on an already-present value removes it", async () => {
    window.history.replaceState({}, "", "/?sector=Digital");
    render(<Harness />);
    await userEvent.click(screen.getByText("toggle-digital"));
    // With Digital removed, the param should be gone entirely
    expect(replace).toHaveBeenCalledWith("/tracker", { scroll: false });
  });

  it("clear() wipes only this param, not others", async () => {
    window.history.replaceState({}, "", "/?sector=Digital&region=Europe");
    render(<Harness />);
    await userEvent.click(screen.getByText("clear"));
    expect(replace).toHaveBeenCalledWith("/tracker?region=Europe", { scroll: false });
  });
});

describe("useClearUrlFilters", () => {
  beforeEach(() => {
    replace.mockClear();
    window.history.replaceState({}, "", "/");
  });

  it("removes all named params in one call", async () => {
    window.history.replaceState({}, "", "/?sector=Digital&region=Europe&keep=yes");
    render(<Harness />);
    await userEvent.click(screen.getByText("clear-all"));
    // sector and region are wiped; keep survives
    expect(replace).toHaveBeenCalledWith("/tracker?keep=yes", { scroll: false });
  });

  it("wipes the whole query string when no other params remain", async () => {
    window.history.replaceState({}, "", "/?sector=Digital&region=Europe");
    render(<Harness />);
    await userEvent.click(screen.getByText("clear-all"));
    expect(replace).toHaveBeenCalledWith("/tracker", { scroll: false });
  });
});
