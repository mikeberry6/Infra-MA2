import { test } from "@playwright/test";
import { expectDatabasePage } from "./helpers";

const publicDatabases = [
  ["/tracker", "Infrastructure Deal Tape"],
  ["/funds", "Infrastructure Fund Database"],
  ["/portfolio", "Infrastructure Portfolio Company Database"],
  ["/search", "Search InfraSight"],
] as const;

for (const [route, heading] of publicDatabases) {
  test(`${route} renders from the isolated database`, async ({ page }) => {
    await expectDatabasePage(page, route, heading);
  });
}
