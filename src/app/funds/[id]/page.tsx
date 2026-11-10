import { notFound } from "next/navigation";
import { ProfileFacts, ProfileLink, ProfileSection, ProfileSource, RecordProfile } from "@/components/profiles/RecordProfile";
import { researchMetadata } from "@/lib/public-metadata";
import { getPublicFundProfile } from "@/modules/profiles/queries";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const fund = await getPublicFundProfile((await params).id);
  if (!fund) return { title: "Fund unavailable" };
  return researchMetadata(`/funds/${encodeURIComponent(fund.legacyId)}`, fund.fundName, `${fund.managerName} fund profile, reported size and linked portfolio companies.`);
}

export default async function FundProfile({ params }: Props) {
  const fund = await getPublicFundProfile((await params).id);
  if (!fund) notFound();
  return (
    <RecordProfile title={fund.fundName} label="Fund profile" summary={fund.investmentStrategy}
      backHref={`/funds?focus=${encodeURIComponent(fund.legacyId)}`} backLabel="Open in Fund Database"
      compare={{ type: "fund", id: fund.legacyId }}>
      <ProfileFacts facts={[
        ["Manager", fund.managerId ? <ProfileLink key="manager" href={`/sponsors/${fund.managerId}`}>{fund.managerName}</ProfileLink> : fund.managerName],
        ["Status", fund.status], ["Reported size", fund.size], ["Size basis", fund.sizeBasis],
        ["Size as of", fund.sizeAsOf], ["Vintage", fund.vintage], ["Strategy", fund.strategies.join(" · ")],
        ["Structure", fund.structure], ["Regions", fund.regions.join(" · ")],
      ]} />
      {fund.sizeSourceUrl && <ProfileSection title="Reported-size evidence"><ProfileSource href={fund.sizeSourceUrl} /></ProfileSection>}
      <ProfileSection title="Vehicle holdings">
        {fund.portfolioCompanies.length ? (
          <ul className="space-y-2 text-sm">
            {fund.portfolioCompanies.map((company, index) => (
              <li key={`${company.companyId ?? company.name}-${index}`}>
                {company.companyId ? <ProfileLink href={`/portfolio/${company.companyId}`}>{company.name}</ProfileLink> : company.name}
                <span className="ml-2 type-meta">{[company.isActive ? "Active" : "Realized", company.fundAttribution?.toLowerCase().replaceAll("_", " ")].filter(Boolean).join(" · ")}</span>
              </li>
            ))}
          </ul>
        ) : <p className="type-meta">No published holdings are linked to this vehicle.</p>}
      </ProfileSection>
      {!!fund.sourceUrls.length && (
        <ProfileSection title="Sources">
          <ul className="space-y-2 text-sm">{[...new Set(fund.sourceUrls)].map((url) => <li key={url}><ProfileSource href={url} /></li>)}</ul>
        </ProfileSection>
      )}
    </RecordProfile>
  );
}
