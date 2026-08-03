import { describe, expect, it } from "vitest";
import {
  assertLedgerCoverage,
  companyMatchCandidateKeys,
  findSnapshotMatchCandidates,
  verifyCanonicalLedger,
} from "./ledger";
import {
  ledgerFixture,
  productionSnapshotFixture,
  recoveredCensusFixture,
} from "./test-fixtures";

describe("two-sided canonical ledger", () => {
  it("covers every census holding, production company, and seed company once", () => {
    const fixture = ledgerFixture();
    expect(verifyCanonicalLedger(fixture.ledger, {
      recoveredInputs: [fixture.recovered],
      productionSnapshot: fixture.production,
      seedSnapshot: fixture.seed,
    })).toEqual(fixture.ledger);

    expect(() => assertLedgerCoverage({
      ...fixture,
      recoveredInputs: [fixture.recovered],
      productionSnapshot: fixture.production,
      seedSnapshot: fixture.seed,
      ledger: { ...fixture.ledger, censusRows: [] },
    })).toThrow(/census holding/i);
  });

  it("uses the existing conservative company keys only to suggest same-country candidates", () => {
    const production = productionSnapshotFixture();
    const holding = recoveredCensusFixture().holdings[0];
    expect(findSnapshotMatchCandidates(holding, production.companies).map((company) => company.id))
      .toEqual(["company_acme"]);
    expect(companyMatchCandidateKeys("Acme Infrastructure, LLC", ["Canada"]))
      .not.toEqual(companyMatchCandidateKeys("Acme Infrastructure", ["United States"]));
  });
});
