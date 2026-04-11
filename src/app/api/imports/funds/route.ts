import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  FUND_STRATEGY_MAP,
  FUND_STRUCTURE_MAP,
  FUND_STATUS_MAP,
  FUND_SECTOR_MAP,
  FUND_REGION_MAP,
} from "@/modules/shared/enum-maps";
import type {
  FundStrategy,
  FundStructure,
  FundStatusEnum,
  FundSectorEnum,
  FundRegionEnum,
} from "@/generated/prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { funds } = body;

    if (!Array.isArray(funds)) {
      return NextResponse.json(
        { error: "Request body must contain a 'funds' array" },
        { status: 400 },
      );
    }

    const results = [];
    for (const fund of funds) {
      const structure = FUND_STRUCTURE_MAP[fund.structure] as FundStructure;
      const fundStatus = FUND_STATUS_MAP[fund.status] as FundStatusEnum;

      if (!structure || !fundStatus) {
        results.push({ fundName: fund.fundName, error: "Invalid structure or status" });
        continue;
      }

      const strategies = (fund.strategies || [])
        .map((s: string) => FUND_STRATEGY_MAP[s])
        .filter(Boolean) as FundStrategy[];

      const sectors = (fund.sectors || [])
        .map((s: string) => FUND_SECTOR_MAP[s])
        .filter(Boolean) as FundSectorEnum[];

      const regions = (fund.regions || [])
        .map((r: string) => FUND_REGION_MAP[r])
        .filter(Boolean) as FundRegionEnum[];

      // Find or create the manager organization
      let manager = await prisma.organization.findFirst({
        where: { name: fund.managerName },
      });
      if (!manager) {
        manager = await prisma.organization.create({
          data: {
            name: fund.managerName,
            types: ["FUND_MANAGER"],
            status: "PUBLISHED",
          },
        });
      }

      try {
        const created = await prisma.fund.upsert({
          where: { legacyId: fund.id },
          update: {
            fundName: fund.fundName,
            strategies,
            structure,
            fundStatus,
            sectors,
            regions,
          },
          create: {
            legacyId: fund.id,
            managerId: manager.id,
            fundName: fund.fundName,
            ticker: fund.ticker,
            investmentStrategy: fund.investmentStrategy || "",
            size: fund.size,
            sizeUsdMm: fund.sizeUsdMm,
            vintage: fund.vintage,
            strategies,
            structure,
            fundStatus,
            sectors,
            regions,
            sourceUrls: fund.sourceUrls || [],
            strategyUrl: fund.strategyUrl || "",
            status: "DRAFT",
          },
        });
        results.push({ fundName: fund.fundName, dbId: created.id, status: "ok" });
      } catch (err: any) {
        results.push({ fundName: fund.fundName, error: err.message });
      }
    }

    return NextResponse.json({
      imported: results.filter((r) => r.status === "ok").length,
      errors: results.filter((r) => r.error),
      results,
    });
  } catch (error) {
    console.error("Fund import failed:", error);
    return NextResponse.json(
      { error: "Failed to import funds" },
      { status: 500 },
    );
  }
}
