import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const TABLE_PAGES = [
  ["deals", "Deals table"],
  ["funds", "Funds table"],
  ["companies", "Companies table"],
  ["sources", "Sources table"],
  ["users", "Users table"],
  ["audit", "Audit log table"],
  ["dashboard-signals", "Dashboard signal review table"],
] as const;

describe("admin table accessibility contract", () => {
  it.each(TABLE_PAGES)(
    "%s exposes a labelled, keyboard-focusable horizontal scroll region",
    (route, label) => {
      const source = readFileSync(
        `${process.cwd()}/src/app/admin/${route}/page.tsx`,
        "utf8",
      );

      expect(source).toContain("overflow-x-auto");
      expect(source).toContain('role="region"');
      expect(source).toContain(`aria-label="${label}"`);
      expect(source).toContain("tabIndex={0}");
      expect(source).toMatch(/<table className="[^"]*min-w-\[/);
    },
  );
});
