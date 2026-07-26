import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTrackDrawerOpen } from "./useTrackDrawerOpen";

const track = vi.hoisted(() => vi.fn());
vi.mock("@vercel/analytics", () => ({ track }));

function Harness({ id, renderVersion }: { id: string | null; renderVersion: number }) {
  useTrackDrawerOpen("deal", id);
  return <span>{renderVersion}</span>;
}

describe("useTrackDrawerOpen", () => {
  beforeEach(() => {
    track.mockReset();
  });

  it("does not double-count a selected record when refreshed list objects rerender", () => {
    const view = render(<Harness id="DEAL-1" renderVersion={1} />);
    expect(track).toHaveBeenCalledTimes(1);

    view.rerender(<Harness id="DEAL-1" renderVersion={2} />);
    expect(track).toHaveBeenCalledTimes(1);

    view.rerender(<Harness id={null} renderVersion={3} />);
    view.rerender(<Harness id="DEAL-1" renderVersion={4} />);
    expect(track).toHaveBeenCalledTimes(2);
  });
});
