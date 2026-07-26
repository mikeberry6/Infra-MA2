import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TrackedAnalyticsLink } from "./TrackedAnalyticsLink";

const track = vi.hoisted(() => vi.fn());

vi.mock("@vercel/analytics", () => ({ track }));

describe("TrackedAnalyticsLink", () => {
  beforeEach(() => {
    track.mockReset();
  });

  it("emits only the allowlisted research-contact placement", () => {
    render(
      <TrackedAnalyticsLink
        href="mailto:research@infrasight.com"
        analyticsEvent={{
          name: "research_contact_initiated",
          properties: { placement: "footer" },
        }}
        onClick={(event) => event.preventDefault()}
      >
        Contact research
      </TrackedAnalyticsLink>,
    );

    fireEvent.click(screen.getByRole("link", { name: "Contact research" }));

    expect(track).toHaveBeenCalledWith("research_contact_initiated", {
      placement: "footer",
    });
  });

  it("tracks unavailable-state contacts without route or error details", () => {
    render(
      <TrackedAnalyticsLink
        href="mailto:research@infrasight.com"
        analyticsEvent={{
          name: "research_contact_initiated",
          properties: { placement: "data_unavailable" },
        }}
        onClick={(event) => event.preventDefault()}
      >
        Contact research after failure
      </TrackedAnalyticsLink>,
    );

    fireEvent.click(screen.getByRole("link", { name: "Contact research after failure" }));
    expect(track).toHaveBeenCalledWith("research_contact_initiated", {
      placement: "data_unavailable",
    });
  });

  it("emits source context without the destination or record label", () => {
    render(
      <TrackedAnalyticsLink
        href="https://private-query.example/sensitive-path"
        analyticsEvent={{
          name: "source_link_clicked",
          properties: { entity: "earnings", placement: "card" },
        }}
        onClick={(event) => event.preventDefault()}
      >
        Confidential manager label
      </TrackedAnalyticsLink>,
    );

    fireEvent.click(screen.getByRole("link", { name: "Confidential manager label" }));

    expect(track).toHaveBeenCalledWith("source_link_clicked", {
      entity: "earnings",
      placement: "card",
    });
    expect(JSON.stringify(track.mock.calls)).not.toContain("sensitive-path");
    expect(JSON.stringify(track.mock.calls)).not.toContain("Confidential manager label");
  });

  it("allowlists dashboard source placement without emitting the URL", () => {
    render(
      <TrackedAnalyticsLink
        href="https://provider.example/private-metric"
        analyticsEvent={{
          name: "source_link_clicked",
          properties: { entity: "dashboard", placement: "metric" },
        }}
        onClick={(event) => event.preventDefault()}
      >
        Provider metric
      </TrackedAnalyticsLink>,
    );

    fireEvent.click(screen.getByRole("link", { name: "Provider metric" }));

    expect(track).toHaveBeenCalledWith("source_link_clicked", {
      entity: "dashboard",
      placement: "metric",
    });
    expect(JSON.stringify(track.mock.calls)).not.toContain("private-metric");
  });
});
