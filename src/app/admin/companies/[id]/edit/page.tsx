export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CompanyForm from "@/components/admin/CompanyForm";
import { OwnershipPeriodsManager, type OwnershipPeriodRow } from "@/components/admin/OwnershipPeriodsManager";
import { updateCompany } from "@/modules/admin/actions";
import {
  COMPANY_SECTOR_DISPLAY,
  COMPANY_REGION_DISPLAY,
  COMPANY_STATUS_DISPLAY,
} from "@/modules/shared/enum-maps";
import type { CompanyView } from "@/modules/shared/types";

export const metadata = { title: "Admin · Edit Company" };

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      ownershipPeriods: {
        include: {
          organization: { select: { name: true } },
          fund: {
            select: {
              fundName: true,
              manager: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      citations: {
        include: { source: { select: { label: true, url: true } } },
        orderBy: [{ isPrimary: "desc" }, { id: "asc" }],
      },
    },
  });

  if (!company) return notFound();

  // Derive investmentFirm and ownershipVehicle from ownership periods
  const primaryOwnership = company.ownershipPeriods[0];
  const investmentFirm =
    primaryOwnership?.organization?.name ||
    primaryOwnership?.fund?.manager?.name ||
    "";
  const ownershipVehicle =
    primaryOwnership?.vehicleName ||
    primaryOwnership?.fund?.fundName ||
    "";
  const investmentYear = primaryOwnership?.investmentYear || undefined;

  const primaryCitation = company.citations.find((citation) => citation.isPrimary) ?? company.citations[0];
  const initialData: Partial<CompanyView> & { sourceName?: string; sourceUrl?: string } = {
    id: company.id,
    name: company.name,
    investmentFirm,
    sector: COMPANY_SECTOR_DISPLAY[company.sector],
    subsector: company.subsector,
    region: COMPANY_REGION_DISPLAY[company.region],
    country: company.country,
    ownershipVehicle,
    description: company.description,
    status: COMPANY_STATUS_DISPLAY[company.companyStatus],
    website: company.website || undefined,
    yearFounded: company.yearFounded || undefined,
    investmentYear,
    headquarters: company.headquarters || undefined,
    sourceName: primaryCitation?.source.label || "",
    sourceUrl: primaryCitation?.source.url || "",
  };

  const boundUpdate = updateCompany.bind(null, id);

  const ownershipRows: OwnershipPeriodRow[] = company.ownershipPeriods.map((p) => ({
    id: p.id,
    investmentFirm: p.organization?.name || p.fund?.manager?.name || "",
    ownershipVehicle: p.vehicleName || p.fund?.fundName || "",
    investmentYear: p.investmentYear,
    exitYear: p.exitYear,
    isActive: p.isActive,
    stake: p.stake,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6">
        <Link
          href="/admin/companies"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-2"
        >
          <ArrowLeft className="h-3 w-3" /> Companies
        </Link>
        <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
          Edit company
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{company.name}</p>
      </div>

      <CompanyForm initialData={initialData} action={boundUpdate} mode="edit" />

      <OwnershipPeriodsManager companyId={id} initialPeriods={ownershipRows} />
    </div>
  );
}
