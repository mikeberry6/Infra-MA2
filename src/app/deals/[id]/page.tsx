import { notFound, permanentRedirect } from "next/navigation";
import { ProfileFacts, ProfileLink, ProfileSection, ProfileSource, RecordProfile } from "@/components/profiles/RecordProfile";
import { withBasePath } from "@/lib/base-path";
import { researchMetadata } from "@/lib/public-metadata";
import { getPublicDealProfile } from "@/modules/profiles/queries";
import type { DealView } from "@/modules/shared/types";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const deal = await getPublicDealProfile((await params).id);
  if (!deal) return { title: "Deal unavailable" };
  return researchMetadata(`/deals/${encodeURIComponent(deal.legacyId)}`, deal.target, deal.title, "article");
}

function Participants({ deal, role }: { deal: DealView; role: "BUYER" | "SELLER" }) {
  const participants = deal.participants?.filter((participant) => participant.role === role);
  if (!participants?.length) return role === "BUYER" ? deal.buyer : deal.seller;
  return participants.map(({ organizationId, name, hasPublicProfile }, index) => (
    <span key={organizationId}>
      {index > 0 && " / "}
      {hasPublicProfile ? <ProfileLink href={`/sponsors/${organizationId}`}>{name}</ProfileLink> : name}
    </span>
  ));
}

export default async function DealProfile({ params }: Props) {
  const { id } = await params;
  const deal = await getPublicDealProfile(id);
  if (!deal) notFound();
  if (id !== deal.legacyId) permanentRedirect(withBasePath(`/deals/${encodeURIComponent(deal.legacyId)}`));
  return (
    <RecordProfile title={deal.target} label="Transaction profile" summary={deal.description || deal.title}
      backHref={`/tracker?focus=${encodeURIComponent(deal.legacyId)}`} backLabel="Open in Deal Tape"
      compare={{ type: "deal", id: deal.legacyId }}>
      <ProfileFacts facts={[
        ["Buyer", <Participants key="buyer" deal={deal} role="BUYER" />],
        ["Seller", <Participants key="seller" deal={deal} role="SELLER" />],
        ["Announcement date", deal.date.slice(0, 10)], ["Status", deal.status],
        ["Sector", [deal.sector, deal.subsector].filter(Boolean).join(" · ")],
        ["Location", deal.country || deal.region], ["Deal type", deal.category.join(" · ")],
        ["Enterprise value", deal.enterpriseValue], ["Equity value", deal.equityValue], ["Asset scale", deal.assetScale],
      ]} />
      {deal.sourceUrl && <ProfileSection title="Evidence"><ProfileSource href={deal.sourceUrl}>{deal.sourceName}</ProfileSource></ProfileSection>}
      {!!deal.briefings?.length && (
        <ProfileSection title="Weekly briefings">
          <ul className="space-y-2">{deal.briefings.map(({ edition }) => (
            <li key={edition}><ProfileLink href={`/weekly-briefing?edition=${edition}`}>{edition}</ProfileLink></li>
          ))}</ul>
        </ProfileSection>
      )}
    </RecordProfile>
  );
}
