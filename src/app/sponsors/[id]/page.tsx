import { notFound } from "next/navigation";
import { ProfileFacts, ProfileLink, ProfileSection, ProfileSource, RecordProfile } from "@/components/profiles/RecordProfile";
import { researchMetadata } from "@/lib/public-metadata";
import { getPublicSponsorProfile, getSponsorHoldings } from "@/modules/profiles/queries";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const sponsor = await getPublicSponsorProfile((await params).id);
  if (!sponsor) return { title: "Sponsor unavailable" };
  return researchMetadata(`/sponsors/${sponsor.id}`, sponsor.name, `${sponsor.name} infrastructure funds, portfolio holdings, and transaction activity.`);
}

export default async function SponsorProfile({ params }: Props) {
  const sponsor = await getPublicSponsorProfile((await params).id);
  if (!sponsor) notFound();
  const holdings = await getSponsorHoldings(sponsor.id);
  const { news } = sponsor;
  return (
    <RecordProfile title={sponsor.name} label="Infrastructure sponsor" summary={sponsor.description}
      backHref={`/funds?q=${encodeURIComponent(sponsor.name)}`} backLabel="Open Fund Database">
      <ProfileFacts facts={[
        ["Headquarters", sponsor.headquarters], ["Published fund vehicles", sponsor.managedFunds.length.toString()],
        ["Website", sponsor.website ? <ProfileSource key="website" href={sponsor.website} /> : null],
      ]} />
      {!!sponsor.managedFunds.length && <ProfileSection title="Managed funds">
        <ul className="space-y-2 text-sm">{sponsor.managedFunds.map((fund) => (
          <li key={fund.legacyId}><ProfileLink href={`/funds/${fund.legacyId}`}>{fund.fundName}</ProfileLink><span className="ml-2 type-meta">{fund.vintage}</span></li>
        ))}</ul>
      </ProfileSection>}
      {[true, false].map((active) => {
        const periods = holdings.filter((period) => period.isActive === active);
        return periods.length > 0 && (
          <ProfileSection key={String(active)} title={active ? "Current holdings" : "Realized holdings"}>
            <ul className="space-y-2 text-sm">{periods.map(({ id, company, fund, fundAttribution, investmentYear, exitYear, vehicleName }) => (
              <li key={id}>
                <ProfileLink href={`/portfolio/${company.id}`}>{company.name}</ProfileLink>
                {fund?.status === "PUBLISHED" ? <> · <ProfileLink href={`/funds/${fund.legacyId}`}>{fund.fundName}</ProfileLink></> : vehicleName ? ` · ${vehicleName}` : null}
                <span className="ml-2 type-meta">{[investmentYear, exitYear && `Exited ${exitYear}`, fundAttribution.toLowerCase().replaceAll("_", " ")].filter(Boolean).join(" · ")}</span>
              </li>
            ))}</ul>
          </ProfileSection>
        );
      })}
      {!!sponsor.dealParticipations.length && <ProfileSection title="Recent deal activity">
        <ul className="space-y-2 text-sm">{sponsor.dealParticipations.map(({ id, role, deal }) => (
          <li key={id}><ProfileLink href={`/deals/${deal.legacyId}`}>{deal.target}</ProfileLink><span className="ml-2 type-meta">{role === "BUYER" ? "Buyer" : "Seller"} · {deal.date.toISOString().slice(0, 10)}</span></li>
        ))}</ul>
      </ProfileSection>}
      {!!news.length && <ProfileSection title="Recent sourced news">
        <ul className="space-y-2 text-sm">{news.map((item) => (
          <li key={item.id}><ProfileSource href={item.sourceUrl}>{item.title}</ProfileSource><span className="ml-2 type-meta">{item.sourceName} · {item.publishedAt.toISOString().slice(0, 10)}</span></li>
        ))}</ul>
      </ProfileSection>}
    </RecordProfile>
  );
}
