import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const syncUrl = (url: string) => {
  window.history.replaceState({}, "", url);
};
const push = vi.fn(syncUrl);
const replace = vi.fn(syncUrl);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
  usePathname: () => "/tracker",
}));

import {
  useUrlQueryParamsWriter,
  useUrlQueryState,
  useUrlQueryWriter,
} from "./useUrlFilterSet";

function Harness() {
  const [query, setQuery] = useUrlQueryState("q", "", { resetPage: true });
  const writeOne = useUrlQueryWriter();
  const writeMany = useUrlQueryParamsWriter();

  return (
    <>
      <output>{query}</output>
      <button onClick={() => setQuery("fiber")}>search</button>
      <button onClick={() => writeOne("focus", "deal-1", "push")}>focus</button>
      <button onClick={() => writeOne("focus", null, "replace")}>close</button>
      <button onClick={() => writeMany(
        { sort: "date", direction: "asc" },
        { history: "push", resetPage: true },
      )}>sort</button>
    </>
  );
}

describe("URL query state", () => {
  beforeEach(() => {
    push.mockClear();
    replace.mockClear();
    window.history.replaceState({}, "", "/tracker?page=3");
  });

  it("writes search and resets page", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByText("search"));
    expect(push).toHaveBeenCalledWith("/tracker?q=fiber", { scroll: false });
    expect(screen.getByRole("status")).toHaveTextContent("fiber");
  });

  it("opens and closes a focused drawer with explicit history behavior", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByText("focus"));
    expect(push).toHaveBeenCalledWith("/tracker?page=3&focus=deal-1", { scroll: false });
    await userEvent.click(screen.getByText("close"));
    expect(replace).toHaveBeenCalledWith("/tracker?page=3", { scroll: false });
  });

  it("updates related sort state atomically", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByText("sort"));
    expect(push).toHaveBeenCalledWith("/tracker?sort=date&direction=asc", { scroll: false });
  });
});
