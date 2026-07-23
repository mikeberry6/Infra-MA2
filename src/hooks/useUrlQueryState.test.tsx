import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const navigation = vi.hoisted(() => ({
  replace: vi.fn((url: string) => {
    const query = url.includes("?") ? url.slice(url.indexOf("?")) : "";
    window.history.replaceState({}, "", `/tracker${query}`);
  }),
  push: vi.fn((url: string) => {
    const query = url.includes("?") ? url.slice(url.indexOf("?")) : "";
    window.history.pushState({}, "", `/tracker${query}`);
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigation.replace, push: navigation.push }),
  usePathname: () => "/tracker",
}));

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));

import {
  useUrlQueryParam,
  useUrlQueryParamsWriter,
  useUrlQueryState,
  useUrlQueryWriter,
} from "@/hooks/useUrlFilterSet";

function Harness() {
  const [query, setQuery] = useUrlQueryState("q", "", { resetPage: true });
  const [sort, setSort] = useUrlQueryState("sort", "date");
  const focus = useUrlQueryParam("focus");
  const write = useUrlQueryWriter();
  const writeParams = useUrlQueryParamsWriter();
  return (
    <div>
      <span data-testid="query">{query}</span>
      <span data-testid="sort">{sort}</span>
      <span data-testid="focus">{focus ?? "none"}</span>
      <button onClick={() => setQuery("grid assets")}>search</button>
      <button onClick={() => setSort("date")}>default-sort</button>
      <button onClick={() => setSort("target")}>target-sort</button>
      <button onClick={() => write("focus", "DEAL/1", "push")}>open</button>
      <button onClick={() => write("focus", null, "replace")}>close</button>
      <button onClick={() => writeParams({ sort: "target", direction: "asc" }, { resetPage: true })}>target-ascending</button>
    </div>
  );
}

describe("URL query state serialization", () => {
  beforeEach(() => {
    navigation.replace.mockClear();
    navigation.push.mockClear();
    window.history.replaceState({}, "", "/tracker");
  });

  it("restores state from the URL and preserves unrelated parameters", () => {
    window.history.replaceState({}, "", "/tracker?q=water&sort=target&direction=asc&page=3");
    render(<Harness />);

    expect(screen.getByTestId("query")).toHaveTextContent("water");
    expect(screen.getByTestId("sort")).toHaveTextContent("target");
  });

  it("encodes search text and resets page while preserving filter and sort state", async () => {
    window.history.replaceState({}, "", "/tracker?sector=Digital&sort=target&direction=asc&page=4");
    render(<Harness />);

    await userEvent.click(screen.getByText("search"));

    expect(navigation.push).toHaveBeenCalledWith(
      "/tracker?sector=Digital&sort=target&direction=asc&q=grid+assets",
      { scroll: false },
    );
  });

  it("omits default values instead of serializing redundant query parameters", async () => {
    window.history.replaceState({}, "", "/tracker?sort=target&direction=desc");
    render(<Harness />);

    await userEvent.click(screen.getByText("default-sort"));

    expect(navigation.push).toHaveBeenCalledWith(
      "/tracker?direction=desc",
      { scroll: false },
    );
  });

  it("coalesces successive search keystrokes into one navigable history entry", async () => {
    render(<Harness />);

    await userEvent.click(screen.getByText("search"));
    expect(navigation.push).toHaveBeenCalledTimes(1);

    navigation.push.mockClear();
    await userEvent.click(screen.getByText("search"));
    expect(navigation.push).not.toHaveBeenCalled();
    expect(navigation.replace).toHaveBeenCalledWith("/tracker?q=grid+assets", { scroll: false });
  });

  it("pushes drawer focus into history, removes it on close, and reacts to popstate", async () => {
    render(<Harness />);

    await userEvent.click(screen.getByText("open"));
    expect(navigation.push).toHaveBeenCalledWith("/tracker?focus=DEAL%2F1", { scroll: false });
    expect(screen.getByTestId("focus")).toHaveTextContent("DEAL/1");

    await userEvent.click(screen.getByText("close"));
    expect(navigation.replace).toHaveBeenCalledWith("/tracker", { scroll: false });
    expect(screen.getByTestId("focus")).toHaveTextContent("none");

    window.history.replaceState({}, "", "/tracker?focus=BACK-1");
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(await screen.findByText("BACK-1")).toBeInTheDocument();
  });

  it("writes a sort field and direction atomically while resetting pagination", async () => {
    window.history.replaceState({}, "", "/tracker?sector=Digital&page=4");
    render(<Harness />);

    await userEvent.click(screen.getByText("target-ascending"));

    expect(navigation.push).toHaveBeenCalledTimes(1);
    expect(navigation.push).toHaveBeenCalledWith(
      "/tracker?sector=Digital&sort=target&direction=asc",
      { scroll: false },
    );
    expect(screen.getByTestId("sort")).toHaveTextContent("target");
  });
});
