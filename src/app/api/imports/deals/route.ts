import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/csv";
import { DEAL_SECTOR_MAP, DEAL_REGION_MAP, DEAL_CATEGORY_MAP, DEAL_STATUS_MAP } from "@/modules/shared/enum-maps";
import type { DealSector, DealRegion, DealCategory, DealStatusEnum } from "@/generated/prisma/client";

/**
 * Parse the incoming request body as either JSON or CSV.
 * Returns an array of deal objects ready for processing.
 */
async function parseRequestBody(request: NextRequest): Promise<Record<string, any>[]> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      throw new Error("No file provided in form data");
    }
    const csvText = await file.text();
    return parseCsv(csvText).map((row) => ({
      ...row,
      // CSV category comes as semicolon-separated string; split into array
      category: row.category ? row.category.split(";").map((s: string) => s.trim()).filter(Boolean) : [],
      keyHighlights: row.keyHighlights ? row.keyHighlights.split(";").map((s: string) => s.trim()).filter(Boolean) : [],
    }));
  }

  // Default: JSON body
  const body = await request.json();
  if (Array.isArray(body)) return body;
  if (body.deals && Array.isArray(body.deals)) return body.deals;
  throw new Error("Request body must contain a 'deals' array or be a JSON array");
}

export async function POST(request: NextRequest) {
  try {
    const deals = await parseRequestBody(request);

    if (deals.length === 0) {
      return NextResponse.json(
        { error: "No deals provided" },
        { status: 400 },
      );
    }

    const results = await prisma.$transaction(async (tx) => {
      const txResults: { id?: string; legacyId?: string; dbId?: string; status?: string; error?: string }[] = [];

      for (const deal of deals) {
        const dealId = deal.id || deal.legacyId;
        const sector = DEAL_SECTOR_MAP[deal.sector] as DealSector;
        const region = DEAL_REGION_MAP[deal.region] as DealRegion;
        const dealStatus = DEAL_STATUS_MAP[deal.status] as DealStatusEnum;
        const categories = (Array.isArray(deal.category) ? deal.category : [])
          .map((c: string) => DEAL_CATEGORY_MAP[c])
          .filter(Boolean) as DealCategory[];

        if (!sector || !region || !dealStatus) {
          txResults.push({ id: dealId, error: "Invalid sector, region, or status" });
          continue;
        }

        const created = await tx.deal.upsert({
          where: { legacyId: dealId },
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
            legacyId: dealId,
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
            enterpriseValue: deal.enterpriseValue || null,
            equityValue: deal.equityValue || null,
            stake: deal.stake || null,
            dealStatus,
            closingDate: deal.closingDate ? new Date(deal.closingDate) : null,
            assetScale: deal.assetScale || null,
            valuationMultiple: deal.valuationMultiple || null,
            fundVehicle: deal.fundVehicle || null,
            keyHighlights: deal.keyHighlights || [],
            status: "DRAFT",
          },
        });

        txResults.push({ id: dealId, dbId: created.id, status: "ok" });
      }

      return txResults;
    });

    return NextResponse.json({
      imported: results.filter((r) => r.status === "ok").length,
      errors: results.filter((r) => r.error),
      results,
    });
  } catch (error: any) {
    console.error("Deal import failed:", error);
    return NextResponse.json(
      { error: `Failed to import deals: ${error.message}` },
      { status: 500 },
    );
  }
}
