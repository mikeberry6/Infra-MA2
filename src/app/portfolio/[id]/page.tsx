import { notFound, permanentRedirect } from "next/navigation";
import { ProfileFacts, ProfileLink, ProfileSection, ProfileSource, RecordProfile } from "@/components/profiles/RecordProfile";
import { withBasePath } from "@/lib/base-path";
import { researchMetadata } from "@/lib/public-metadata";
import { getCompanyLinkedDeals, getPublicCompanyProfile } from "@/modules/profiles/queries";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const company = await getPublicCompanyProfile((await params).id);
  if (!company) return { title: "Portfolio company unavailable" };
  return researchMetadata(`/portfolio/${company.id}`, company.name, `${company.name} infrastructure portfolio company profile, investment history and sources.`);
}

export default async function CompanyProfile({ params }: Props) {
  const { id } = await params;
  const company = await getPublicCompanyProfile(id);
  if (!company) notFound();
  if (id !== company.id) permanentRedirect(withBasePath(`/portfolio/${company.id}`));
  const deals = await getCompanyLinkedDeals(company.id);
  return (
    <RecordProfile title={company.name} label="Portfolio company profile" summary={company.description}
      backHref={`/portfolio?focus=${company.id}`} backLabel="Open in Portfolio Database"
      compare={{ type: "company", id: company.id }}>
      <ProfileFacts facts={[
        ["Status", company.status], ["Location", company.headquarters || company.country],
        ["Sector", [company.sector, company.subsector].filter(Boolean).join(" · ")],
        ["Primary owner", company.investmentFirm], ["Initial investment", company.investmentYear],
      ]} />
      {!!company.owners.length && <ProfileSection title="Ownership periods">
        <ul className="space-y-2 text-sm">{company.owners.map((owner, index) => (
          <li key={owner.id ?? index}>
            {owner.organizationId ? <ProfileLink href={`/sponsors/${owner.organizationId}`}>{owner.firm}</ProfileLink> : owner.firm}
            {owner.vehicle && <> · {owner.fundLegacyId ? <ProfileLink href={`/funds/${owner.fundLegacyId}`}>{owner.vehicle}</ProfileLink> : owner.vehicle}</>}
            <span className="ml-2 type-meta">{[owner.investmentYear, owner.isActive ? "Active" : "Realized", owner.fundAttribution.toLowerCase().replaceAll("_", " ")].filter(Boolean).join(" · ")}</span>
          </li>
        ))}</ul>
      </ProfileSection>}
      {!!company.sources?.length && <ProfileSection title="Sources">
        <ul className="space-y-2 text-sm">{company.sources.map(({ url, label }, index) => (
          <li key={`${url}-${index}`}><ProfileSource href={url}>{label}</ProfileSource></li>
        ))}</ul>
      </ProfileSection>}
      {!!deals.length && <ProfileSection title="Related transactions">
        <ul className="space-y-2 text-sm">{deals.map((deal) => (
          <li key={deal.legacyId}><ProfileLink href={`/deals/${deal.legacyId}`}>{deal.target}</ProfileLink></li>
        ))}</ul>
      </ProfileSection>}
    </RecordProfile>
  );
}
