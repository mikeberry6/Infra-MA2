import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { DashboardView } from "@/modules/dashboard/types";
import { ACTIVE_DASHBOARD_METRICS } from "@/modules/dashboard/catalog";
import type { NewsFeedView } from "@/modules/shared/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: (href: string) => window.history.pushState({}, "", href),
    replace: (href: string) => window.history.replaceState({}, "", href),
    back: vi.fn(),
  }),
  usePathname: () => "/news",
}));

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { NewsFeed } from "@/components/NewsFeed";

describe("public external-provider failure states", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/news");
  });
  it("distinguishes a failed news scan from a successful empty scan", () => {
    const feed: NewsFeedView = {
      items: [],
      lastUpdated: "2026-07-21T23:00:00.000Z",
      operations: {
        state: "failed",
        lastAttemptAt: "2026-07-22T23:00:00.000Z",
        lastSuccessfulAt: "2026-07-21T23:00:00.000Z",
        nextExpectedAt: "2026-07-22T23:00:00.000Z",
        sourceCoverage: { attempted: 50, succeeded: 42, failed: 8 },
        scanWindow: {
          selectionDateUtc: "2026-07-22",
          fullUniverseCount: 1_434,
          eligibleCount: 1_434,
          selectedCount: 200,
          offset: 1_200,
          windowIndex: 6,
          windowsPerCycle: 8,
        },
        message: "The latest scan failed; the last successful results remain visible.",
      },
    };

    render(<NewsFeed feed={feed} />);

    const pipelineStatus = screen.getByRole("region", { name: "News pipeline status" });
    expect(pipelineStatus).toHaveTextContent("Latest scan failed");
    expect(pipelineStatus).toHaveTextContent("Jul 21, 2026");
    expect(pipelineStatus).toHaveTextContent("42/50 attempts");
    expect(pipelineStatus).toHaveTextContent("200/1,434 entities · window 7/8 · Jul 22, 2026");
    expect(screen.getByRole("heading", { name: "The latest scan failed" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Scan completed with no qualifying signals" })).not.toBeInTheDocument();
  });

  it("surfaces a failed dashboard provider above the data while retaining its health record", () => {
    const view: DashboardView = {
      generatedAt: "2026-07-22T12:00:00.000Z",
      hasDatabaseData: true,
      operations: {
        state: "healthy",
        lastAttemptAt: "2026-07-22T11:30:00.000Z",
        lastSuccessfulAt: "2026-07-22T11:35:00.000Z",
        nextExpectedAt: "2026-07-23T11:30:00.000Z",
        message: "The latest weekday dashboard synchronization completed successfully.",
      },
      scorecard: {
        stance: "Neutral",
        score: 50,
        explanations: ["No strong directional signal.", "Provider failure test fixture."],
        positiveContributors: [],
        negativeContributors: [],
        freshnessWarnings: ["Treasury observations are stale."],
      },
      sections: [],
      allSeries: [],
      sourceHealth: [
        {
          sourceId: "treasury",
          sourceName: "U.S. Treasury",
          status: "FAILED",
          startedAt: "2026-07-22T10:00:00.000Z",
          endedAt: "2026-07-22T10:00:05.000Z",
          observationsFetched: 0,
          observationsUpserted: 0,
          signalsFetched: 0,
          signalsUpserted: 0,
          error: "Provider timed out after bounded retries",
        },
      ],
    };

    render(<DashboardPage view={view} />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Data provider update failed");
    expect(alert).toHaveTextContent("U.S. Treasury did not update successfully");
    expect(screen.getByText("Source coverage").nextElementSibling).toHaveTextContent("0/1");

    const sourceTable = screen.getByRole("table");
    expect(within(sourceTable).getByText("U.S. Treasury")).toBeVisible();
    expect(within(sourceTable).getByText("failed")).toBeVisible();
    expect(within(sourceTable).getByText("Provider timed out after bounded retries")).toBeVisible();
  });

  it("does not count a partial dashboard source as complete and names required-metric gaps", () => {
    const view: DashboardView = {
      generatedAt: "2026-07-22T12:00:00.000Z",
      hasDatabaseData: true,
      operations: {
        state: "healthy",
        lastSuccessfulAt: "2026-07-22T11:35:00.000Z",
        nextExpectedAt: "2026-07-23T11:30:00.000Z",
        message: "The latest weekday dashboard synchronization completed successfully.",
      },
      scorecard: {
        stance: "Neutral",
        score: 50,
        explanations: [],
        positiveContributors: [],
        negativeContributors: [],
        freshnessWarnings: [],
      },
      sections: [],
      allSeries: [{
        metric: ACTIVE_DASHBOARD_METRICS.find((metric) => metric.id === "us_treasury_2y")!,
        observations: [],
        stale: true,
        unavailable: true,
      }],
      sourceHealth: [{
        sourceId: "treasury",
        sourceName: "U.S. Treasury",
        status: "PARTIAL",
        startedAt: "2026-07-22T11:30:00.000Z",
        endedAt: "2026-07-22T11:31:00.000Z",
        observationsFetched: 1,
        observationsUpserted: 1,
        signalsFetched: 0,
        signalsUpserted: 0,
        error: "Latest refresh completed with incomplete or stale source coverage.",
        metadata: {
          missingRequiredMetrics: ["us_treasury_2y"],
          staleRequiredMetrics: ["us_treasury_10y"],
        },
      }],
    };

    render(<DashboardPage view={view} />);

    expect(screen.getByText("Source coverage").nextElementSibling).toHaveTextContent("0/1");
    const sourceTable = screen.getByRole("table");
    expect(within(sourceTable).getByText(/Missing required: 2Y U.S. Treasury CMT/)).toBeVisible();
    expect(within(sourceTable).getByText(/Stale required: us_treasury_10y/)).toBeVisible();
  });

  it.each([
    ["pending", "Dashboard synchronization in progress"],
    ["failed", "Dashboard synchronization failed"],
    ["healthy", "Synchronization completed without public data"],
  ] as const)("renders a meaningful zero-data dashboard when the pipeline is %s", (state, title) => {
    const view: DashboardView = {
      generatedAt: "2026-07-22T12:00:00.000Z",
      hasDatabaseData: false,
      operations: {
        state,
        lastAttemptAt: "2026-07-22T11:30:00.000Z",
        lastSuccessfulAt: state === "healthy" ? "2026-07-22T11:35:00.000Z" : undefined,
        nextExpectedAt: "2026-07-23T11:30:00.000Z",
        message: state === "pending"
          ? "The first dashboard synchronization is running."
          : state === "failed"
            ? "The latest dashboard synchronization failed."
            : "The latest weekday dashboard synchronization completed successfully.",
      },
      scorecard: {
        stance: "Neutral",
        score: 50,
        explanations: ["No strong directional signal.", "No public data."],
        positiveContributors: [],
        negativeContributors: [],
        freshnessWarnings: [],
      },
      sections: [],
      allSeries: [],
      sourceHealth: [],
    };

    render(<DashboardPage view={view} />);

    expect(screen.getByText(title)).toBeVisible();
    expect(screen.getByText(/Production never substitutes sample values/)).toBeVisible();
    expect(screen.queryByText("M&A Risk-On / Risk-Off Scorecard")).not.toBeInTheDocument();
  });

  it("puts every news filter in a focus-contained mobile sheet and exposes active date state", async () => {
    const user = userEvent.setup();
    const feed: NewsFeedView = {
      items: [],
      lastUpdated: "2026-07-22T23:00:00.000Z",
      operations: {
        state: "healthy",
        lastAttemptAt: "2026-07-22T23:00:00.000Z",
        lastSuccessfulAt: "2026-07-22T23:00:00.000Z",
        nextExpectedAt: "2026-07-23T23:00:00.000Z",
        sourceCoverage: { attempted: 50, succeeded: 50, failed: 0 },
        message: "The scan completed with no qualifying signals.",
      },
    };

    render(<NewsFeed feed={feed} />);

    const trigger = screen.getByRole("button", { name: /^Filters/ });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Filters" });
    expect(within(dialog).getByRole("button", { name: "Filter by Category" })).toBeVisible();
    expect(within(dialog).getByRole("button", { name: "Filter by Entity" })).toBeVisible();
    expect(within(dialog).getByRole("button", { name: "Filter by Source" })).toBeVisible();
    expect(within(dialog).getByRole("button", { name: "Filter by Confidence" })).toBeVisible();

    await user.click(within(dialog).getByRole("button", { name: "30D" }));
    expect(trigger).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: "Remove 30D filter" })).toBeVisible();
    expect(window.location.search).toContain("window=30D");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Filters" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });

  it.each([
    ["pending", "A news scan is currently running"],
    ["overdue", "The scheduled news scan is overdue"],
    ["failed", "The latest scan failed"],
    ["healthy", "Scan completed with no qualifying signals"],
  ] as const)("labels an empty %s feed operationally", (state, heading) => {
    render(<NewsFeed feed={{
      items: [],
      lastUpdated: "2026-07-22T23:00:00.000Z",
      operations: { state, message: `Fixture state: ${state}` },
    }} />);

    expect(screen.getByRole("heading", { name: heading })).toBeVisible();
  });

  it("restores the date window from the URL", () => {
    window.history.replaceState({}, "", "/news?window=30D");
    render(<NewsFeed feed={{
      items: [],
      lastUpdated: "2026-07-22T23:00:00.000Z",
      operations: { state: "healthy", message: "No qualifying items." },
    }} />);

    expect(screen.getByRole("button", { name: "30D" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Remove 30D filter" })).toBeVisible();
  });
});
