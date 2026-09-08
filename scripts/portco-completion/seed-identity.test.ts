import { describe, expect, it } from "vitest";
import type { PortCo, PortCoOwner } from "../../prisma/seed-data/portco-types";
import { buildSeedIdentity, SEED_IDENTITY_INPUTS, verifySeedIdentity } from "./seed-identity";
import { sha256Canonical } from "../portco-reconciliation/hash";
import { execFileSync } from "node:child_process";

const H = "a".repeat(64), dependencies = SEED_IDENTITY_INPUTS.map(path => ({ path, sha256: H }));
const owner: PortCoOwner = { investmentFirm: "Manager", ownershipVehicle: "Holding company", investmentYear: 2010, exitYear: 2020,
  stake: "Majority; exact percentage undisclosed", status: "Realized" };
const company: PortCo = { name: "Company", country: "United States", countryTags: ["United States"], investmentFirm: "Manager",
  ownershipVehicle: "Holding company", status: "Active", sector: "Digital", subsector: "Fiber", region: "North America", description: "Company", owners: [owner] };
const resolver = (o: PortCoOwner) => ({ fundLookupName: o.fundName || o.ownershipVehicle, vehicleName: o.vehicleName || o.ownershipVehicle || o.investmentFirm,
  transactionState: o.transactionState || (o.status === "Active" ? "CLOSED_ACTIVE" as const : "REALIZED" as const) });
const make = (companies: PortCo[] = [company], selected = [company]) => buildSeedIdentity({ companies, selected, dependencies,
  resolveOrganization: name => name === "Alias" ? "Manager" : name, resolveOwnership: resolver });
describe("full evaluated seed proof", () => {
  it("binds complete evaluated content, selected company and resolver inputs", () => {
    const proof = make();
    expect(proof.evaluatedCompaniesSha256).toBe(sha256Canonical([company]));
    expect(proof.companies[0].companySha256).toBe(sha256Canonical(company));
    expect(proof.companies[0].owners[0].raw).toEqual(owner);
    expect(proof.dependencies).toEqual(dependencies);
    expect(make([{ ...company, description: "Changed" }]).proofSha256).not.toBe(proof.proofSha256);
  });
  it("models the seed runner's top-level fallback without adding a stake it does not seed", () => {
    const proof = make([{ ...company, owners: [] }]);
    expect(proof.companies[0].owners[0].raw).toEqual({ investmentFirm: "Manager", ownershipVehicle: "Holding company", status: "Active" });
  });
  it.each([
    [owner, { ...owner }],
    [owner, { ...owner, stake: "Different stake" }],
    [owner, { ...owner, status: "Active" as const }],
    [owner, { ...owner, investmentFirm: "Alias", stake: "Different" }],
  ])("rejects full-key and actual dedupe-key collisions", (...owners) => {
    expect(() => make([{ ...company, owners }])).toThrow(/collision/);
  });
  it("rejects missing/duplicate/case-variant company matches instead of choosing one", () => {
    expect(() => make([])).toThrow(/unique/);
    expect(() => make([company, { ...company }])).toThrow(/unique/);
    expect(() => make([company, { ...company, name: "COMPANY" }])).toThrow(/unique/);
    expect(() => make([{ ...company, name: "COMPANY" }])).toThrow(/unique/);
    expect(() => make([company], [company, company])).toThrow(/Ambiguous/);
  });
  it("rejects missing and stale complete input bindings", () => {
    const proof = make(), files = new Map(dependencies.map(d => [d.path, d.sha256]));
    files.delete(SEED_IDENTITY_INPUTS[0]);
    expect(() => verifySeedIdentity(proof, files)).toThrow(/Stale/);
    files.set(SEED_IDENTITY_INPUTS[0], "f".repeat(64));
    expect(() => verifySeedIdentity(proof, files)).toThrow(/Stale/);
    const { proofSha256: _hash, ...content } = proof;
    content.dependencies = content.dependencies.slice(1);
    expect(() => verifySeedIdentity({ ...content, proofSha256: sha256Canonical(content) }, files)).toThrow(/Complete seed input/);
  });
  it("rejects fabricated raw owners without recomputing their proof hash", () => {
    const proof = make(); proof.companies[0].owners[0].raw.investmentFirm = "Invented";
    expect(() => verifySeedIdentity(proof, new Map(dependencies.map(d => [d.path, d.sha256])))).toThrow(/proof hash/);
  });
  it("re-evaluates real seed inputs at the filesystem gate and rejects a resealed invented proof", () => {
    // tsx loads the repository's existing TypeScript seed modules; no seedDatabase call.
    const output = execFileSync(process.execPath, ["--import", "tsx", "--input-type=module", "-e", `
      import assert from 'node:assert/strict';
      import {captureSeedIdentity,checkActualSeedIdentity} from './scripts/portco-completion/seed-identity-files.ts';
      import {sha256Canonical} from './scripts/portco-reconciliation/hash.ts';
      const p=captureSeedIdentity(process.cwd(),[{name:'EdgeConneX',country:'United States'}]);
      const files=new Map(p.dependencies.map(d=>[d.path,d.sha256]));
      checkActualSeedIdentity(process.cwd(),p,files);
      const bad=structuredClone(p);bad.companies[0].owners[0].raw.investmentFirm='Invented';
      const {proofSha256,...content}=bad;bad.proofSha256=sha256Canonical(content);
      assert.throws(()=>checkActualSeedIdentity(process.cwd(),bad,files),/differs from frozen proof/);
      console.log('Actual evaluation verified; fabricated proof rejected; zero database calls');
    `], { cwd: process.cwd(), encoding: "utf8", timeout: 30000 });
    expect(output).toContain("fabricated proof rejected; zero database calls");
  }, 30000);
});
