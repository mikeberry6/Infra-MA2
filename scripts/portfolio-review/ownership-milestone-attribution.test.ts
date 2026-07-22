import { describe, expect, it } from "vitest";
import {
  eventMentionsOwner,
  hasAttributableEntryMilestone,
  hasAttributableExitMilestone,
  milestoneSupportsOwnerEntry,
  milestoneSupportsOwnerExit,
  ownerIdentityPhrases,
  type MilestoneAttributionRow,
  type OwnershipAttributionRow,
} from "./ownership-milestone-attribution";

function owner(
  overrides: Partial<OwnershipAttributionRow>,
): OwnershipAttributionRow {
  return {
    firm: "Example Infrastructure Manager",
    vehicle: "Example Infrastructure Fund",
    investmentYear: 2026,
    exitYear: null,
    ...overrides,
  };
}

function milestone(
  overrides: Partial<MilestoneAttributionRow>,
): MilestoneAttributionRow {
  return {
    date: "2026",
    event: "Example Infrastructure Manager acquired the company.",
    category: "ACQUISITION",
    ...overrides,
  };
}

describe("portfolio ownership milestone attribution", () => {
  it.each([
    ["H.I.G. Capital", "HIG Capital completed the acquisition."],
    ["HIG Capital", "H.I.G. Infrastructure completed the acquisition."],
    ["DigitalBridge", "Digital Bridge acquired DataBank."],
    ["SK Capital Partners", "SK Capital completed its acquisition."],
    ["3i Group", "3i invested in Regional Rail."],
  ])("matches only verified brand variants for %s", (firm, event) => {
    expect(
      eventMentionsOwner(milestone({ event }), owner({ firm, vehicle: null })),
    ).toBe(true);
  });

  it("does not derive loose manager tokens or unrelated short aliases", () => {
    const exampleOwner = owner({
      firm: "North American Infrastructure Partners",
      vehicle: "Infrastructure Fund III",
    });
    expect(ownerIdentityPhrases(exampleOwner)).not.toContain("north");
    expect(ownerIdentityPhrases(exampleOwner)).not.toContain("infrastructure");
    expect(
      eventMentionsOwner(
        milestone({
          event: "Another infrastructure manager acquired the company.",
        }),
        exampleOwner,
      ),
    ).toBe(false);
    expect(
      eventMentionsOwner(
        milestone({ event: "SK Telecom expanded its network." }),
        owner({ firm: "SK Capital Partners" }),
      ),
    ).toBe(false);
  });

  it("accepts a founding milestone only when it names the same-year owner or vehicle", () => {
    const icon = owner({
      firm: "iCON Infrastructure",
      vehicle: "iCON Infrastructure Partners VI",
      investmentYear: 2023,
    });
    const namedFormation = milestone({
      date: "2023",
      category: "FOUNDING",
      event:
        "Cruise Terminals International was formed as a partnership between iCON Infrastructure and Royal Caribbean Group.",
    });
    const genericFormation = milestone({
      date: "2023",
      category: "FOUNDING",
      event:
        "Cruise Terminals International was formed as a new operating platform.",
    });
    expect(hasAttributableEntryMilestone(icon, [namedFormation])).toBe(true);
    expect(hasAttributableEntryMilestone(icon, [genericFormation])).toBe(false);
    expect(
      hasAttributableEntryMilestone(icon, [
        { ...namedFormation, date: "2022" },
      ]),
    ).toBe(false);
  });

  it("attributes a formation milestone to a named corporate owner", () => {
    const comstock = owner({
      firm: "Comstock Resources",
      vehicle: "Direct corporate ownership",
      investmentYear: 2023,
    });
    expect(
      hasAttributableEntryMilestone(comstock, [
        milestone({
          date: "2023",
          category: "FOUNDING",
          event:
            "Comstock Resources and a Quantum affiliate formed Pinnacle Gas Services.",
        }),
      ]),
    ).toBe(true);
  });

  it("uses a divestiture milestone for an incoming owner only when the role is explicit", () => {
    const keyera = owner({
      firm: "Keyera",
      vehicle: "Direct ownership",
      investmentYear: 2026,
    });
    const transaction = milestone({
      date: "June 19, 2026",
      category: "DIVESTITURE",
      event:
        "Keyera completed the C$1.215 billion acquisition of Stonepeak's remaining 50% interest and became the 100% owner.",
    });
    expect(milestoneSupportsOwnerEntry(transaction, keyera)).toBe(true);
    expect(
      milestoneSupportsOwnerEntry(
        transaction,
        owner({
          firm: "Stonepeak",
          vehicle: "50% interest",
          investmentYear: 2026,
        }),
      ),
    ).toBe(false);
  });

  it("uses an acquisition milestone for an outgoing owner only when the seller platform is explicit", () => {
    const ifm = owner({
      firm: "IFM Investors",
      vehicle: "Prior ownership via Swift Current Energy",
      investmentYear: 2024,
      exitYear: 2026,
    });
    const transaction = milestone({
      date: "Jan 15, 2026",
      category: "ACQUISITION",
      event:
        "Elevate Renewables, an ArcLight platform, acquired Prospect Power from Swift Current Energy.",
    });
    expect(milestoneSupportsOwnerExit(transaction, ifm)).toBe(true);
    expect(hasAttributableExitMilestone(ifm, [transaction])).toBe(true);
    expect(
      milestoneSupportsOwnerExit(
        transaction,
        owner({ firm: "Unrelated Manager", exitYear: 2026 }),
      ),
    ).toBe(false);
  });

  it("recognizes an explicitly named platform before a vehicle parenthetical", () => {
    const digitalBridge = owner({
      firm: "DigitalBridge",
      vehicle: "InfraBridge (JV with Northleaf Capital)",
      investmentYear: 2016,
    });
    expect(
      hasAttributableEntryMilestone(digitalBridge, [
        milestone({
          date: "May 19, 2016",
          category: "ACQUISITION",
          event:
            "InfraBridge predecessor AMP Capital and Northleaf reached financial close on the acquisition of Millennium Garages.",
        }),
      ]),
    ).toBe(true);
  });

  it("uses a documented restructuring milestone for a named prior platform exit", () => {
    const ubuntu = owner({
      firm: "Ubuntu Business Holdings",
      vehicle: "Prior SiFi Networks America ownership",
      investmentYear: 2018,
      exitYear: 2026,
    });
    const restructuring = milestone({
      date: "Jun 5, 2026",
      category: "OTHER",
      event:
        "SiFi Networks America, LLC filed Chapter 11, joint administrators were appointed to SiFi Networks America Limited, and the administrators completed a pre-pack sale of the UK company's business and certain assets to ArcLink.",
    });
    expect(hasAttributableExitMilestone(ubuntu, [restructuring])).toBe(true);
    expect(
      hasAttributableExitMilestone(
        owner({
          firm: "Unrelated Former Owner",
          vehicle: "Prior unrelated platform ownership",
          exitYear: 2026,
        }),
        [restructuring],
      ),
    ).toBe(false);
  });

  it("does not confuse a portfolio-company word with the owner's organization identity", () => {
    const mubadala = owner({
      firm: "Mubadala",
      vehicle: "Mubadala Energy strategic investment",
      investmentYear: 2025,
    });
    expect(
      hasAttributableEntryMilestone(mubadala, [
        milestone({
          date: "2025",
          category: "ACQUISITION",
          event: "CPP Investments disclosed a 12% stake in Caturus Energy.",
        }),
      ]),
    ).toBe(false);
  });

  it("does not treat an OTHER portfolio-management narrative as an entry transaction", () => {
    const arclight = owner({
      firm: "ArcLight Capital Partners",
      vehicle: "ArcLight Infrastructure Partners Fund VIII",
      investmentYear: 2024,
    });
    expect(
      hasAttributableEntryMilestone(arclight, [
        milestone({
          date: "Jul 2024",
          category: "OTHER",
          event:
            "ArcLight launched SkyVest Renewables and disclosed Phoenix Renewables as one of the initial Fund VIII portfolios it would manage.",
        }),
      ]),
    ).toBe(false);
  });

  it("preserves financing as an entry category without inferring a missing year", () => {
    expect(
      hasAttributableEntryMilestone(owner({ investmentYear: 2022 }), [
        milestone({
          date: "Jun 2022",
          category: "FINANCING",
          event: "The company completed a financing round.",
        }),
      ]),
    ).toBe(true);
    expect(
      hasAttributableEntryMilestone(owner({ investmentYear: null }), []),
    ).toBe(true);
  });
});
