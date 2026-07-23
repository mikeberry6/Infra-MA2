import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/navigation BEFORE importing the hook
const navigation = vi.hoisted(() => ({
  replace: vi.fn((url: string) => {
    const qs = url.includes("?") ? url.split("?")[1] : "";
    window.history.replaceState({}, "", `/${qs ? `?${qs}` : ""}`);
  }),
  push: vi.fn((url: string) => {
    const qs = url.includes("?") ? url.split("?")[1] : "";
    window.history.pushState({}, "", `/${qs ? `?${qs}` : ""}`);
  }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigation.replace, push: navigation.push, back: vi.fn() }),
  usePathname: () => "/tracker",
}));

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));

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
    navigation.replace.mockClear();
    navigation.push.mockClear();
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
    expect(navigation.push).toHaveBeenCalledWith("/tracker?sector=Digital", { scroll: false });
  });

  it("toggle on an already-present value removes it", async () => {
    window.history.replaceState({}, "", "/?sector=Digital");
    render(<Harness />);
    await userEvent.click(screen.getByText("toggle-digital"));
    // With Digital removed, the param should be gone entirely
    expect(navigation.push).toHaveBeenCalledWith("/tracker", { scroll: false });
  });

  it("clear() wipes only this param, not others", async () => {
    window.history.replaceState({}, "", "/?sector=Digital&region=Europe");
    render(<Harness />);
    await userEvent.click(screen.getByText("clear"));
    expect(navigation.push).toHaveBeenCalledWith("/tracker?region=Europe", { scroll: false });
  });

  it("resets pagination when a filter changes", async () => {
    window.history.replaceState({}, "", "/?page=4");
    render(<Harness />);
    await userEvent.click(screen.getByText("toggle-digital"));
    expect(navigation.push).toHaveBeenCalledWith("/tracker?sector=Digital", { scroll: false });
  });
});

describe("useClearUrlFilters", () => {
  beforeEach(() => {
    navigation.replace.mockClear();
    navigation.push.mockClear();
    window.history.replaceState({}, "", "/");
  });

  it("removes all named params in one call", async () => {
    window.history.replaceState({}, "", "/?sector=Digital&region=Europe&keep=yes");
    render(<Harness />);
    await userEvent.click(screen.getByText("clear-all"));
    // sector and region are wiped; keep survives
    expect(navigation.push).toHaveBeenCalledWith("/tracker?keep=yes", { scroll: false });
  });

  it("wipes the whole query string when no other params remain", async () => {
    window.history.replaceState({}, "", "/?sector=Digital&region=Europe");
    render(<Harness />);
    await userEvent.click(screen.getByText("clear-all"));
    expect(navigation.push).toHaveBeenCalledWith("/tracker", { scroll: false });
  });
});
