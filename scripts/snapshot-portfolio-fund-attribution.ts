#!/usr/bin/env npx tsx
import "dotenv/config";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { prisma } from "../src/lib/prisma";

function args(argv: string[]): Map<string, string> {
  const result = new Map<string, string>();
  for (const argument of argv) {
    if (!argument.startsWith("--")) throw new Error(`Unexpected positional argument ${argument}`);
    const index = argument.indexOf("=");
    result.set(index < 0 ? argument.slice(2) : argument.slice(2, index), index < 0 ? "true" : argument.slice(index + 1));
  }
  return result;
}

function required(values: Map<string, string>, name: string): string {
  const value = values.get(name)?.trim();
  if (!value) throw new Error(`--${name}=... is required`);
  return value;
}

function hash(value: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

async function main(): Promise<void> {
  const values = args(process.argv.slice(2));
  const asOfDate = required(values, "as-of");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOfDate)) throw new Error("--as-of must use YYYY-MM-DD");
  const output = path.resolve(required(values, "output"));
  if (fs.existsSync(output) && values.get("force") !== "true") {
    throw new Error(`Refusing to overwrite ${path.relative(process.cwd(), output)} without --force=true`);
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for the read-only production snapshot");

  const companies = await prisma.company.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      name: true,
      country: true,
      description: true,
      ownershipPeriods: {
        where: { isActive: true },
        select: {
          id: true,
          vehicleName: true,
          stake: true,
          investmentYear: true,
          fund: { select: { fundName: true, manager: { select: { name: true } } } },
          organization: { select: { name: true } },
        },
        orderBy: { id: "asc" },
      },
      milestones: {
        select: { date: true, event: true, category: true },
        orderBy: [{ sortDate: "asc" }, { id: "asc" }],
      },
      citations: {
        select: {
          evidenceLabel: true,
          purpose: true,
          source: { select: { label: true, url: true, type: true } },
        },
        orderBy: { id: "asc" },
      },
    },
    orderBy: [{ name: "asc" }, { country: "asc" }],
  });
  const availableFundNames = (await prisma.fund.findMany({
    where: { status: "PUBLISHED" },
    select: { fundName: true },
    orderBy: { fundName: "asc" },
  })).map((fund) => fund.fundName);

  const records = companies.flatMap((company) => company.ownershipPeriods.map((owner) => ({
    ownershipPeriodId: owner.id,
    companyId: company.id,
    companyName: company.name,
    country: company.country,
    description: company.description ?? "",
    investmentFirm: owner.fund?.manager.name || owner.organization?.name || "",
    vehicleName: owner.vehicleName,
    displayVehicleName: owner.vehicleName || owner.fund?.fundName || owner.organization?.name || "n.a.",
    currentLinkedFundName: owner.fund?.fundName ?? null,
    investmentYear: owner.investmentYear,
    stake: owner.stake,
    milestones: company.milestones.map((milestone) => ({
      date: milestone.date,
      event: milestone.event,
      category: milestone.category,
    })),
    sources: company.citations.map((citation) => ({
      label: citation.source.label,
      url: citation.source.url,
      type: citation.source.type,
      purpose: citation.purpose,
      evidenceLabel: citation.evidenceLabel,
    })),
  })));
  const content = {
    schemaVersion: 1,
    artifactType: "PORTFOLIO_FUND_ATTRIBUTION_PRODUCTION_SNAPSHOT",
    asOfDate,
    companyCount: companies.length,
    activeOwnershipCount: records.length,
    publishedFundCount: availableFundNames.length,
    availableFundNames,
    records,
  };
  const snapshot = { ...content, capturedAt: new Date().toISOString(), snapshotSha256: hash(content) };
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(JSON.stringify({
    output: path.relative(process.cwd(), output),
    companyCount: companies.length,
    activeOwnershipCount: records.length,
    publishedFundCount: availableFundNames.length,
    snapshotSha256: snapshot.snapshotSha256,
  }, null, 2));
}

main()
  .finally(() => process.env.DATABASE_URL ? prisma.$disconnect() : undefined)
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
