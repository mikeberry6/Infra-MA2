import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { requireAdminIdentity } from "@/modules/auth/guards";
import { newsEvidenceEnabled } from "@/modules/news-evidence/feature";
import { getNewsReviewQueue, REVIEW_PAGE_SIZE } from "@/modules/news-evidence/review";

export const metadata = { title: "Admin · News review" };
export const dynamic = "force-dynamic";

export default async function NewsReviewQueuePage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  if (!newsEvidenceEnabled()) notFound();
  await requireAdminIdentity();
  const { page: rawPage } = await searchParams;
  const requested = rawPage && /^\d{1,4}$/.test(rawPage) ? Number(rawPage) : 1;
  const page = Math.max(1, requested);
  const { revisions, count, failures } = await getNewsReviewQueue(page);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/admin" className="mb-2 inline-flex items-center gap-1.5 type-meta">
        <ArrowLeft className="h-3 w-3" /> Admin
      </Link>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="type-page-title">News evidence review</h1>
        <Link href="/admin/news-evidence/digest" className="type-meta text-[var(--accent)]">Digest editions</Link>
      </div>
      <section className="surface divide-y divide-[var(--border)]" aria-label="Drafts awaiting review">
        <h2 className="px-4 py-3 type-meta font-semibold">{count} {count === 1 ? "draft" : "drafts"} awaiting review</h2>
        {revisions.map((revision) => (
          <Link key={revision.id} href={`/admin/news-evidence/${revision.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-[var(--bg-subtle)]">
            <div className="min-w-0">
              <h3 className="type-row-title break-words">{revision.title}</h3>
              <div className="mt-1 flex flex-wrap gap-x-3 type-micro text-[var(--text-secondary)]">
                {revision.sourceName && <span>{revision.sourceName}</span>}
                <span>{label(revision.development.kind)}</span>
                <span>{revision.createdAt.toISOString().slice(0, 10)}</span>
                {revision.publicationEligibility === "BLOCKED" && <span>Publication blocked</span>}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" />
          </Link>
        ))}
        {!revisions.length && <p className="px-4 py-8 type-meta text-[var(--text-secondary)]">No drafts on this page.</p>}
      </section>
      {(page > 1 || count > page * REVIEW_PAGE_SIZE) && (
        <nav aria-label="News review pages" className="mt-3 flex justify-between type-meta">
          {page > 1 ? <Link href={`/admin/news-evidence?page=${page - 1}`}>← Previous</Link> : <span />}
          {count > page * REVIEW_PAGE_SIZE && <Link href={`/admin/news-evidence?page=${page + 1}`}>Next →</Link>}
        </nav>
      )}
      {failures.length > 0 && (
        <section className="surface mt-6 px-4 py-3" aria-labelledby="failure-heading">
          <h2 id="failure-heading" className="type-row-title">Recent processing failures</h2>
          <ul className="mt-2 space-y-2 type-micro text-[var(--text-secondary)]">
            {failures.map((failure) => (
              <li key={failure.id} className="space-y-0.5">
                <p>{failure.sourceName} · {label(failure.stage)} · {failure.attemptCount} attempts</p>
                <p>{failure.errorCode ? label(failure.errorCode) : "Processing could not complete."} · Version <span className="break-all mono">{failure.versionId}</span></p>
              </li>
            ))}
          </ul>
          <p className="mt-3 type-micro text-[var(--text-secondary)]">After resolving the cause, queue a retry from the approved CLI target with <code>npm run news:evidence -- reprocess --version-id=&lt;version-id&gt;</code>.</p>
        </section>
      )}
    </div>
  );
}

function label(value: string) {
  return value.replaceAll("_", " ").toLowerCase();
}
