import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireAdminIdentity } from "@/modules/auth/guards";
import { evidenceSchema } from "@/modules/news-evidence/contracts";
import { newsEvidenceEnabled } from "@/modules/news-evidence/feature";
import { dealLifecycleProposalSchema } from "@/modules/news-evidence/mutations";
import { canPublishVersion, isApprovedEdgarUrl } from "@/modules/news-evidence/policy";
import { getNewsReviewDetail, retainsEvidence, REVIEW_COPY_LIMITS } from "@/modules/news-evidence/review";
import { ApplyDealProposal, ReviewControls } from "./ReviewControls";

export const metadata = { title: "Admin · Review news draft" };
export const dynamic = "force-dynamic";

function label(value: string) {
  return value.replaceAll("_", " ").toLowerCase();
}

function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export default async function NewsReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!newsEvidenceEnabled()) notFound();
  await requireAdminIdentity();
  const { id } = await params;
  const detail = await getNewsReviewDetail(id);
  if (!detail) notFound();

  if (detail.state === "restricted") {
    return <div className="mx-auto max-w-4xl space-y-3 px-4 py-8 sm:px-6"><QueueLink /><h1 className="type-page-title">Source policy unavailable</h1><p className="type-meta">This evidence cannot be displayed under the current source policy.</p></div>;
  }

  const { revision, options } = detail;
  const { development, sourceVersion } = revision;
  const { document } = sourceVersion;
  const decision = object(revision.decisionDetails);
  const qualificationEvidence = evidenceSchema.safeParse(decision.qualificationEvidence);
  const proposal = dealLifecycleProposalSchema.safeParse(revision.proposal);
  const currentApproval = development.approvedRevisionId === revision.id;
  const canApprove = revision.publicationEligibility === "READY_FOR_REVIEW"
    && canPublishVersion(document.sourceKey, sourceVersion.policyVersion);
  const classification = [
    ["News relevance", revision.relevance], ["Evidence status", revision.evidenceStatus],
    ["Infrastructure qualification", revision.qualification], ["Deal eligibility", revision.dealEligibility],
    ["Publication eligibility", revision.publicationEligibility], ["Current status", revision.status],
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-8 sm:px-6 sm:py-10">
      <header className="space-y-2">
        <QueueLink />
        <p className="type-micro capitalize text-[var(--text-secondary)]">{label(development.kind)} · Revision {revision.number}</p>
        <h1 className="type-page-title break-words">{revision.title}</h1>
        <p className="max-w-3xl type-meta text-[var(--text-secondary)]">{revision.summary}</p>
        {development.approvedRevision && !currentApproval && (
          <p className="type-meta"><Link href={`/admin/news-evidence/${development.approvedRevision.id}`} className="text-[var(--accent)]">Open current public revision</Link></p>
        )}
      </header>

      <section className="surface space-y-3 p-4" aria-labelledby="classification-heading">
        <h2 id="classification-heading" className="type-row-title">Classification</h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classification.map(([title, value]) => <div key={title}><dt className="type-micro text-[var(--text-secondary)]">{title}</dt><dd className="type-meta capitalize">{label(value)}</dd></div>)}
          {typeof decision.fundDisclosure === "string" && <div><dt className="type-micro text-[var(--text-secondary)]">Fund disclosure</dt><dd className="type-meta capitalize">{label(decision.fundDisclosure)}</dd></div>}
          {development.thread && <div><dt className="type-micro text-[var(--text-secondary)]">Transaction thread</dt><dd className="type-meta">{development.thread.label}</dd></div>}
          {development.legacyNewsItem && <div><dt className="type-micro text-[var(--text-secondary)]">Replaces legacy item</dt><dd className="type-meta">{development.legacyNewsItem.title}</dd></div>}
        </dl>
        {typeof decision.reason === "string" && <p className="type-meta text-[var(--text-secondary)]">{decision.reason}</p>}
        {typeof decision.qualificationReason === "string" && <p className="type-meta text-[var(--text-secondary)]">{decision.qualificationReason}</p>}
        {qualificationEvidence.success && retainsEvidence(sourceVersion) && (
          <blockquote className="border-l-2 border-[var(--border)] pl-3 type-meta text-[var(--text-secondary)]">
            <p className="break-words">{qualificationEvidence.data.quote}</p>
            <footer className="mt-1 type-micro">{document.sourceName} · Section {qualificationEvidence.data.section}</footer>
          </blockquote>
        )}
      </section>

      <section className="surface space-y-3 p-4" aria-labelledby="claim-heading">
        <div className="space-y-1">
          <h2 id="claim-heading" className="type-row-title">Source evidence and extracted facts</h2>
          <div className="flex flex-wrap items-center gap-x-3 type-meta text-[var(--text-secondary)]">
            <span>{document.sourceName}</span>
            <span>Published <time dateTime={sourceVersion.publishedAt.toISOString()}>{sourceVersion.publishedAt.toISOString().slice(0, 10)}</time></span>
            {isApprovedEdgarUrl(document.canonicalUrl) && <a href={document.canonicalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--accent)]">Open filing <ExternalLink className="h-3.5 w-3.5" /></a>}
          </div>
          <div className="type-micro text-[var(--text-tertiary)]">Policy {sourceVersion.policyVersion} · Source version <span className="mono">{sourceVersion.id}</span></div>
        </div>
        <ul className="space-y-3">
          {revision.claims.map((claim) => {
            const value = object(claim.value);
            return (
              <li key={claim.id} className="space-y-1 border-t border-[var(--border)] pt-3">
                <div className="type-micro capitalize text-[var(--text-secondary)]">{label(claim.kind)} · {label(claim.attribution)} by {claim.attributedTo}</div>
                {typeof value.text === "string" && <p className="type-meta font-medium break-words">{value.text}</p>}
                {typeof value.amount === "string" && typeof value.currency === "string" && <p className="mono type-micro">{value.currency} {value.amount}</p>}
                {claim.evidence.filter(({ version }) => retainsEvidence(version)).map((evidence) => (
                  <blockquote key={evidence.id} className="border-l-2 border-[var(--border)] pl-3 type-meta text-[var(--text-secondary)]">
                    <p className="break-words">{evidence.quote}</p>
                    <footer className="mt-1 type-micro">{evidence.version.document.sourceName} · Section {evidence.section} · <span className="mono">{evidence.versionId}</span></footer>
                  </blockquote>
                ))}
              </li>
            );
          })}
        </ul>
        {!revision.claims.length && <p className="type-meta text-[var(--text-secondary)]">No validated claims.</p>}
      </section>

      <section className="surface space-y-3 p-4" aria-labelledby="match-heading">
        <h2 id="match-heading" className="type-row-title">Entity matches</h2>
        <ul className="divide-y divide-[var(--border)]">
          {revision.matches.map((match) => {
            const matchedName = match.company?.name ?? match.organization?.name ?? match.fund?.fundName ?? match.deal?.target;
            const candidateRecords = object(match.candidateSnapshot).candidates;
            const evidence = object(match.evidence);
            return (
              <li key={match.id} className="space-y-1 py-2">
                <p className="type-meta font-medium break-words">{match.mention} · <span className="capitalize">{label(match.status)}</span></p>
                <p className="type-micro text-[var(--text-secondary)]"><span className="capitalize">{label(match.role)}</span>{matchedName && ` · ${matchedName}`}{match.reason && ` · ${match.reason}`}</p>
                {evidence.sourceVersionId === sourceVersion.id && typeof evidence.quote === "string" && <blockquote className="border-l-2 border-[var(--border)] pl-2 type-micro text-[var(--text-secondary)]">{evidence.quote}</blockquote>}
                {Array.isArray(candidateRecords) && candidateRecords.length > 0 && (
                  <details className="type-micro text-[var(--text-secondary)]"><summary className="cursor-pointer">Candidate records ({candidateRecords.length})</summary><ul className="mt-1 space-y-1 pl-4">{candidateRecords.map((item: unknown, index: number) => { const candidate = object(item); return typeof candidate.label === "string" ? <li key={index}>{candidate.label}{typeof candidate.id === "string" && <span className="ml-2 break-all mono">{candidate.id}</span>}</li> : null; })}</ul></details>
                )}
              </li>
            );
          })}
        </ul>
        {!revision.matches.length && <p className="type-meta text-[var(--text-secondary)]">No entity matches.</p>}
      </section>

      {revision.proposal != null && (
        <section className="surface space-y-3 p-4" aria-labelledby="proposal-heading">
          <h2 id="proposal-heading" className="type-row-title">Proposed database changes</h2>
          {proposal.success ? (
            <dl className="grid gap-2 type-meta sm:grid-cols-2">
              <div><dt className="type-micro text-[var(--text-secondary)]">Existing deal</dt><dd>{development.thread?.deal?.legacyId ?? proposal.data.dealId}</dd></div>
              {proposal.data.status && <div><dt className="type-micro text-[var(--text-secondary)]">Status</dt><dd>Closed</dd></div>}
              {proposal.data.closingDate && <div><dt className="type-micro text-[var(--text-secondary)]">Closing date</dt><dd>{proposal.data.closingDate}</dd></div>}
            </dl>
          ) : <p className="type-meta text-[var(--text-secondary)]">Proposed new deal for editorial review.</p>}
          <details className="type-micro text-[var(--text-secondary)]"><summary className="cursor-pointer">Proposal details</summary><pre className="mt-1 max-w-full overflow-x-auto whitespace-pre-wrap break-all">{JSON.stringify(revision.proposal, null, 2)}</pre></details>
          {revision.dealMutations.length > 0 ? <p className="type-meta">Deal update applied.</p>
            : currentApproval && proposal.success && process.env.NEWS_DEAL_MUTATIONS_ENABLED === "true"
              ? <ApplyDealProposal revisionId={revision.id} />
              : <p className="type-meta text-[var(--text-secondary)]">Preview only.</p>}
        </section>
      )}

      {options && (
        <ReviewControls
          key={revision.id}
          revisionId={revision.id}
          approvedRevisionId={development.approvedRevisionId}
          title={revision.title}
          summary={revision.summary}
          limits={REVIEW_COPY_LIMITS}
          canApprove={canApprove}
          canCreateThread={options.canCreateThread}
          linkedLegacy={Boolean(development.legacyNewsItemId)}
          related={options.related.flatMap((item) => item.approvedRevision ? [{ id: item.id, approvedRevisionId: item.approvedRevision.id, hasThread: Boolean(item.threadId), hasLegacy: Boolean(item.legacyNewsItemId), label: `${item.approvedRevision.title} · ${label(item.kind)}` }] : [])}
          transactions={[
            ...options.threads.map((item) => ({ id: item.id, kind: "thread" as const, label: item.label })),
            ...options.deals.filter((item) => !options.threads.some((thread) => thread.dealId === item.id)).map((item) => ({ id: item.id, kind: "deal" as const, label: `${item.target} · ${item.legacyId}` })),
          ]}
          legacy={options.legacy.map((item) => ({ id: item.id, label: item.title }))}
        />
      )}
    </div>
  );
}

function QueueLink() {
  return <Link href="/admin/news-evidence" className="inline-flex items-center gap-1.5 type-meta"><ArrowLeft className="h-3 w-3" /> News evidence review</Link>;
}
