/** Read-only runtime attestation; importing the seed runner does not call seedDatabase. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import type { PortCo, PortCoOwner } from "../../prisma/seed-data/portco-types";
import { buildSeedIdentity, verifySeedIdentity, SEED_IDENTITY_INPUTS, type SeedIdentity } from "./seed-identity";

export function captureSeedIdentity(root: string, selected: { name: string; country: string }[]) {
  // Load only on the opt-in path. Avoid type-checking the enormous legacy data literal
  // through every compiler import; the public PortCo contract remains statically typed.
  const require = createRequire(resolve(root, "package.json"));
  const { companies } = require("./prisma/seed-data/companies.ts") as { companies: PortCo[] };
  const { resolveSeedOwnership } = require("./prisma/seed-runner.ts") as {
    resolveSeedOwnership: (owner: PortCoOwner) => Pick<SeedIdentity["companies"][number]["owners"][number], "vehicleName" | "fundLookupName" | "transactionState"> };
  const { resolveOrgName } = require("./prisma/entity-resolution.ts") as { resolveOrgName: (name: string) => string };
  return buildSeedIdentity({ companies, selected, resolveOwnership: resolveSeedOwnership, resolveOrganization: resolveOrgName,
    dependencies: SEED_IDENTITY_INPUTS.map(path => ({ path,
      sha256: createHash("sha256").update(readFileSync(resolve(root, path))).digest("hex") })) });
}
export function checkActualSeedIdentity(root: string, value: SeedIdentity, files: Map<string, string>) {
  const proof = verifySeedIdentity(value, files);
  const actual = captureSeedIdentity(root, proof.companies);
  if (actual.proofSha256 !== proof.proofSha256) throw Error("Evaluated seed/resolver differs from frozen proof");
}
