import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEAL_SECTOR_MAP, DEAL_REGION_MAP, DEAL_CATEGORY_MAP, DEAL_STATUS_MAP } from "@/modules/shared/enum-maps";
import type { DealSector, DealRegion, DealCategory, DealStatusEnum } from "@/generated/prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deals } = body;

    if (!Array.isArray(deals)) {
      return NextResponse.json(
        { error: "Request body must contain a 'deals' array" },
        { status: 400 },
      );
    }

    const results = [];
    for (const deal of deals) {
      const sector = DEAL_SECTOR_MAP[deal.sector] as DealSector;
      const region = DEAL_REGION_MAP[deal.region] as DealRegion;
      const dealStatus = DEAL_STATUS_MAP[deal.status] as DealStatusEnum;
      const categories = (deal.category || [])
        .map((c: string) => DEAL_CATEGORY_MAP[c])
        .filter(Boolean) as DealCategory[];

      if (!sector || !region || !dealStatus) {
        results.push({ id: deal.id, error: "Invalid sector, region, or status" });
        continue;
      }

      const created = await prisma.deal.upsert({
        where: { legacyId: deal.id },
        update: {
          title: deal.title,
          target: deal.target,
          sector,
          region,
          categories,
          date: new Date(deal.date),
          description: deal.description || "",
          dealStatus,
        },
        create: {
          legacyId: deal.id,
          title: deal.title,
          target: deal.target,
          sector,
          subsector: deal.subsector || "",
          region,
          categories,
          date: new Date(deal.date),
          description: deal.description || "",
          targetDescription: deal.targetDescription || "",
          country: deal.country || "",
          enterpriseValue: deal.enterpriseValue,
          equityValue: deal.equityValue,
          stake: deal.stake,
          dealStatus,
          closingDate: deal.closingDate ? new Date(deal.closingDate) : null,
          assetScale: deal.assetScale,
          valuationMultiple: deal.valuationMultiple,
          fundVehicle: deal.fundVehicle,
          keyHighlights: deal.keyHighlights || [],
          status: "DRAFT",
        },
      });

      results.push({ id: deal.id, dbId: created.id, status: "ok" });
    }

    return NextResponse.json({
      imported: results.filter((r) => r.status === "ok").length,
      errors: results.filter((r) => r.error),
      results,
    });
  } catch (error) {
    console.error("Deal import failed:", error);
    return NextResponse.json(
      { error: "Failed to import deals" },
      { status: 500 },
    );
  }
}
