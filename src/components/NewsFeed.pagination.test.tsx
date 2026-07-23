import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { NewsFeedView, NewsItemView } from "@/modules/shared/types";

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigation.push, replace: navigation.replace }),
  usePathname: () => "/news",
}));

import { NewsFeed } from "./NewsFeed";

function item(index: number): NewsItemView {
  return {
    id: `news-${index}`,
    title: `News item ${index}`,
    summary: "A public infrastructure update.",
    category: "Transaction Activity",
    sourceName: "Source",
    sourceUrl: `https://example.com/${index}`,
    linkedinUrls: [],
    publishedAt: new Date().toISOString(),
    isRumor: false,
    confidence: "High",
    mentions: [],
  };
}

function feed(): NewsFeedView {
  return {
    items: Array.from({ length: 30 }, (_, index) => item(index + 1)),
    lastUpdated: null,
    operations: {
      state: "never-run",
      message: "No completed news scan has been recorded yet.",
    },
  };
}

describe("NewsFeed pagination", () => {
  beforeEach(() => {
    navigation.push.mockReset();
    navigation.replace.mockReset();
    window.history.replaceState({}, "", "/news");
  });

  it("renders no more than 25 signal cards and keeps page state in the URL", async () => {
    const view = render(<NewsFeed feed={feed()} />);

    expect(view.container.querySelectorAll("article")).toHaveLength(25);
    expect(screen.getAllByText("Not recorded")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    expect(navigation.push).toHaveBeenCalledWith("/news?page=2", { scroll: false });
    await waitFor(() => expect(view.container.querySelectorAll("article")).toHaveLength(5));
  });
});
