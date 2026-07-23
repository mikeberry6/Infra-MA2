import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const actions = readFileSync("src/modules/admin/actions.ts", "utf8");

function actionBlock(name: string, nextName: string): string {
  const start = actions.indexOf(`export async function ${name}`);
  const end = actions.indexOf(`export async function ${nextName}`, start + 1);
  expect(start, name).toBeGreaterThanOrEqual(0);
  expect(end, nextName).toBeGreaterThan(start);
  return actions.slice(start, end);
}

describe("admin edit concurrency and audit contracts", () => {
  it.each([
    ["updateDeal", "deleteDeal", "existingDeal"],
    ["updateFund", "deleteFund", "existingFund"],
    ["updateCompany", "deleteCompany", "existingCompany"],
  ])("guards %s with updatedAt and exact field summarization", (name, nextName, existing) => {
    const block = actionBlock(name, nextName);

    expect(block).toContain(`updatedAt: ${existing}.updatedAt`);
    expect(block).toContain("changedFieldSummary(");
    expect(block).toContain("changedFields,");
    expect(block).toContain('isolationLevel: "Serializable"');
    expect(block).not.toContain('["record"');
  });
});
