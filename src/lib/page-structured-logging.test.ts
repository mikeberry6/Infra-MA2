import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SERVER_OPERATIONS, SERVER_ROUTES } from "@/lib/server-log";

const LOGGED_ENTRY_POINTS = [
  {
    file: "src/app/tracker/page.tsx",
    routeKey: "trackerPage",
    operationKey: "trackerPageRead",
  },
  {
    file: "src/app/funds/page.tsx",
    routeKey: "fundsPage",
    operationKey: "fundsPageRead",
  },
  {
    file: "src/app/portfolio/page.tsx",
    routeKey: "portfolioPage",
    operationKey: "portfolioPageRead",
  },
  {
    file: "src/app/dashboard/page.tsx",
    routeKey: "dashboardPage",
    operationKey: "dashboardPageRead",
  },
  {
    file: "src/app/news/page.tsx",
    routeKey: "newsPage",
    operationKey: "newsPageRead",
  },
  {
    file: "src/app/email-format/latest/route.ts",
    routeKey: "latestEmail",
    operationKey: "latestEmailResolve",
  },
] as const;

describe("public entry-point structured logging", () => {
  it.each(LOGGED_ENTRY_POINTS)(
    "$file uses static safe labels without raw exception logging",
    ({ file, routeKey, operationKey }) => {
      const source = readFileSync(path.join(process.cwd(), file), "utf8");

      expect(source).toContain("logServerRequest({");
      expect(source).toContain(`SERVER_ROUTES.${routeKey}`);
      expect(source).toContain(`SERVER_OPERATIONS.${operationKey}`);
      expect(source).not.toContain("console.error");
      expect(SERVER_ROUTES[routeKey]).toMatch(/^\//);
      expect(SERVER_OPERATIONS[operationKey]).toMatch(/^[a-z-]+\.[a-z]+$/);
    },
  );
});
