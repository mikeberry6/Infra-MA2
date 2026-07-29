// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  previewImport: vi.fn(),
  commitImport: vi.fn(),
}));

vi.mock("@/modules/imports/service", () => ({
  previewImport: mocks.previewImport,
  commitImport: mocks.commitImport,
}));

import {
  POST as previewDeals,
  PUT as commitDeals,
} from "./deals/route";
import {
  POST as previewFunds,
  PUT as commitFunds,
} from "./funds/route";
import {
  POST as previewPortfolio,
  PUT as commitPortfolio,
} from "./portfolio/route";

describe("import routes", () => {
  beforeEach(() => {
    mocks.previewImport.mockReset();
    mocks.commitImport.mockReset();
  });

  it.each([
    ["deals", previewDeals, commitDeals],
    ["funds", previewFunds, commitFunds],
    ["portfolio", previewPortfolio, commitPortfolio],
  ] as const)(
    "keeps %s POST preview-only and reserves PUT for confirmation",
    async (entityType, preview, commit) => {
      const request = new Request(
        `https://example.test/api/imports/${entityType}`,
      );
      const previewResult = new Response("preview");
      const commitResult = new Response("commit");
      mocks.previewImport.mockResolvedValueOnce(previewResult);
      mocks.commitImport.mockResolvedValueOnce(commitResult);

      await expect(preview(request as never)).resolves.toBe(previewResult);
      expect(mocks.previewImport).toHaveBeenLastCalledWith(
        request,
        entityType,
      );
      expect(mocks.commitImport).not.toHaveBeenCalled();

      await expect(commit(request as never)).resolves.toBe(commitResult);
      expect(mocks.commitImport).toHaveBeenLastCalledWith(
        request,
        entityType,
      );
    },
  );
});
