import { describe, expect, it } from "vitest";
import {
  companyIdentityConflictMessage,
  findCompanyIdentityConflicts,
  type CompanyIdentityRow,
} from "./canonical-identity";

const rows: CompanyIdentityRow[] = [
  { id: "canonical", name: "Example Infrastructure Holdings, LLC", retirement: null },
  { id: "retired", name: "Example Infrastructure", retirement: { companyId: "canonical" } },
  { id: "other", name: "Different Utility", retirement: null },
];

describe("canonical company identity", () => {
  it("finds active and retired aliases using the public canonical-key contract", () => {
    expect(findCompanyIdentityConflicts("Example Infrastructure Inc.", rows).map((row) => row.id))
      .toEqual(["canonical", "retired"]);
  });

  it("can exclude the record being edited while retaining other conflicts", () => {
    expect(findCompanyIdentityConflicts("Example Infrastructure Holdings", rows, "canonical").map((row) => row.id))
      .toEqual(["retired"]);
  });

  it("distinguishes retained retired identities in the operator message", () => {
    expect(companyIdentityConflictMessage([rows[1]])).toContain("retired canonical alias");
    expect(companyIdentityConflictMessage([rows[2]])).toContain("existing company");
  });
});
