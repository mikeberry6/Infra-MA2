import { describe, expect, it } from "vitest";
import { dedupeMilestoneViews } from "./milestone-view";

describe("dedupeMilestoneViews", () => {
  it("selects the same informative milestone when same-day relation order changes", () => {
    const launches = [
      {
        date: "May 27, 2021",
        event: "Amber Infrastructure and Circle Power launched Circle Power Renewables.",
        category: "Financing",
      },
      {
        date: "May 27, 2021",
        event: "Amber and Circle Power launched Circle Power Renewables as the platform developing Groveland Mine Solar.",
        category: "Financing",
      },
      {
        date: "May 27, 2021",
        event: "Amber Infrastructure and Circle Power launched Circle Power Renewables as a U.S. renewable development platform covering 7 Mile Pit Solar and other Michigan projects.",
        category: "Financing",
      },
    ];

    const forward = dedupeMilestoneViews([...launches]);
    const reverse = dedupeMilestoneViews([...launches].reverse());

    expect(forward).toEqual(reverse);
    expect(forward).toEqual([launches[2], launches[1]]);
  });
});
