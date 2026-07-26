export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

export const metadata = { title: "Admin · Edit Deal" };

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
        orderBy: [{ isPrimary: "desc" }, { id: "asc" }],
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
  const firstCitation = deal.citations.find((citation) => citation.isPrimary) ?? deal.citations[0];

  const initialData: Partial<DealView> = {
    id: deal.id,
    legacyId: deal.legacyId,
    title: deal.title,
    target: deal.target,
    buyer: buyers.join(" / ") || "",
    seller: sellers.join(" / ") || "",
    sellerDisclosureStatus: deal.sellerDisclosureStatus,
    sellerDisclosureReason: deal.sellerDisclosureReason,
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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6">
        <Link
          href="/admin/deals"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-2"
        >
          <ArrowLeft className="h-3 w-3" /> Deals
        </Link>
        <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
          Edit deal
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          {deal.target} <span className="text-[var(--text-tertiary)]">·</span> <span className="mono tabular-nums">{deal.legacyId}</span>
        </p>
      </div>

      <DealForm initialData={initialData} action={boundUpdate} mode="edit" />
    </div>
  );
}
