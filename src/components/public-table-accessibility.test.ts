import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const CONTRACTS = [
  ["DealDatabase.tsx", ["Deal database results table"]],
  ["PortfolioDatabase.tsx", ["Portfolio company results table"]],
  [
    "FundDatabase.tsx",
    ["Funds by manager results table", "Fund vehicles results table"],
  ],
] as const;

describe("public database table accessibility contract", () => {
  it.each(CONTRACTS)(
    "%s labels every horizontal table scroller and includes it in keyboard order",
    (file, labels) => {
      const source = readFileSync(`${process.cwd()}/src/components/${file}`, "utf8");

      for (const label of labels) {
        expect(source).toContain(`aria-label="${label}"`);
      }
      expect(source.match(/role="region"/g)).toHaveLength(labels.length);
      expect(source.match(/tabIndex=\{0\}/g)).toHaveLength(labels.length);
      expect(
        source.match(/overflow-x-auto rounded-sm focus:outline-none focus-visible:ring-2/g),
      ).toHaveLength(labels.length);
    },
  );
});
