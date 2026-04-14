export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DealForm from "@/components/admin/DealForm";
import { updateDeal } from "@/modules/admin/actions";
import {
  DEAL_SECTOR_DISPLAY,
  DEAL_REGION_DISPLAY,
  DEAL_CATEGORY_DISPLAY,
  DEAL_STATUS_DISPLAY,
} from "@/modules/shared/enum-maps";
import type { DealView } from "@/modules/shared/types";

export const metadata = { title: "Admin - Edit Deal" };

export default async function EditDealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      participants: {
        include: { organization: { select: { name: true } } },
      },
      citations: {
        include: { source: { select: { label: true, url: true } } },
      },
    },
  });

  if (!deal) return notFound();

  // Map Prisma record to form-friendly DealView shape
  const buyers = deal.participants
    .filter((p) => p.role === "BUYER")
    .map((p) => p.displayName || p.organization.name);
  const sellers = deal.participants
    .filter((p) => p.role === "SELLER")
    .map((p) => p.displayName || p.organization.name);
  const firstCitation = deal.citations[0];

  const initialData: Partial<DealView> = {
    id: deal.id,
    legacyId: deal.legacyId,
    title: deal.title,
    target: deal.target,
    buyer: buyers.join(" / ") || "",
    seller: sellers.join(" / ") || "",
    sector: DEAL_SECTOR_DISPLAY[deal.sector],
    subsector: deal.subsector,
    region: DEAL_REGION_DISPLAY[deal.region],
    category: deal.categories.map((c) => DEAL_CATEGORY_DISPLAY[c]),
    date: deal.date.toISOString(),
    description: deal.description,
    targetDescription: deal.targetDescription,
    country: deal.country,
    status: DEAL_STATUS_DISPLAY[deal.dealStatus],
    enterpriseValue: deal.enterpriseValue,
    equityValue: deal.equityValue,
    stake: deal.stake,
    closingDate: deal.closingDate?.toISOString() || null,
    assetScale: deal.assetScale,
    valuationMultiple: deal.valuationMultiple,
    fundVehicle: deal.fundVehicle,
    keyHighlights: deal.keyHighlights.length > 0 ? deal.keyHighlights : null,
    sourceName: firstCitation?.source.label || "",
    sourceUrl: firstCitation?.source.url || "",
  };

  const boundUpdate = updateDeal.bind(null, id);

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/deals" className="text-sm text-[#71717A] hover:text-white mb-2 inline-block">
            &larr; Back to Deals
          </Link>
          <h1 className="text-2xl font-bold">Edit Deal</h1>
          <p className="text-sm text-[#71717A] mt-1">{deal.target} &mdash; {deal.legacyId}</p>
        </div>

        <DealForm initialData={initialData} action={boundUpdate} mode="edit" />
      </div>
    </div>
  );
}
