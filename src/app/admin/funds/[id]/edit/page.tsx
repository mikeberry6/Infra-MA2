export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import FundForm from "@/components/admin/FundForm";
import { updateFund } from "@/modules/admin/actions";
import {
  FUND_STRATEGY_DISPLAY,
  FUND_STRUCTURE_DISPLAY,
  FUND_STATUS_DISPLAY,
  FUND_SECTOR_DISPLAY,
  FUND_REGION_DISPLAY,
} from "@/modules/shared/enum-maps";
import type { FundView } from "@/modules/shared/types";

export const metadata = { title: "Admin · Edit Fund" };

export default async function EditFundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const fund = await prisma.fund.findUnique({
    where: { id },
    include: {
      manager: { select: { name: true } },
    },
  });

  if (!fund) return notFound();

  const initialData: Partial<FundView> = {
    id: fund.id,
    legacyId: fund.legacyId,
    managerName: fund.manager.name,
    fundName: fund.fundName,
    ticker: fund.ticker,
    investmentStrategy: fund.investmentStrategy,
    sourceUrls: fund.sourceUrls,
    primarySourceUrl: fund.primarySourceUrl,
    size: fund.size,
    sizeUsdMm: fund.sizeUsdMm,
    vintage: fund.vintage,
    strategies: fund.strategies.map((s) => FUND_STRATEGY_DISPLAY[s]),
    structure: FUND_STRUCTURE_DISPLAY[fund.structure],
    status: FUND_STATUS_DISPLAY[fund.fundStatus],
    sectors: fund.sectors.map((s) => FUND_SECTOR_DISPLAY[s]),
    regions: fund.regions.map((r) => FUND_REGION_DISPLAY[r]),
    strategyUrl: fund.strategyUrl,
  };

  const boundUpdate = updateFund.bind(null, id);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6">
        <Link
          href="/admin/funds"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-2"
        >
          <ArrowLeft className="h-3 w-3" /> Funds
        </Link>
        <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
          Edit fund
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          {fund.fundName} <span className="text-[var(--text-tertiary)]">·</span> <span className="mono tabular-nums">{fund.legacyId}</span>
        </p>
      </div>

      <FundForm initialData={initialData} action={boundUpdate} mode="edit" />
    </div>
  );
}
