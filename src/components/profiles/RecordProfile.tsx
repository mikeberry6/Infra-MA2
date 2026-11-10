import Link from "next/link";
import type { ReactNode } from "react";
import { getSourceHostname } from "@/lib/source-utils";

export function ProfileLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="font-medium text-[var(--accent)] underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-current">{children}</Link>;
}

export function ProfileSource({ href, children }: { href: string | null | undefined; children?: ReactNode }) {
  if (!href || !/^https?:\/\//i.test(href)) return null;
  return (
    <a href={href} data-research-event="source_click" target="_blank" rel="noopener noreferrer" className="break-words font-medium text-[var(--accent)] underline underline-offset-4">
      {children || getSourceHostname(href)}
    </a>
  );
}

export function ProfileSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 border-t border-[var(--border)] pt-5">
      <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
      {children}
    </section>
  );
}

export function ProfileFacts({ facts }: { facts: [string, ReactNode][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-4 sm:grid-cols-2">
      {facts.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="type-meta">{label}</dt>
          <dd className="mt-0.5 break-words text-sm font-medium text-[var(--text-primary)] tabular-nums">{value || "Undisclosed"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function RecordProfile({ title, label, summary, backHref, backLabel, compare, children }: {
  title: string;
  label: string;
  summary?: string | null;
  backHref: string;
  backLabel: string;
  compare?: { type: "deal" | "fund" | "company"; id: string };
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[960px] space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <ProfileLink href={backHref}>{backLabel}</ProfileLink>
        {compare && (
          <ProfileLink href={`/compare?type=${compare.type}&id=${encodeURIComponent(compare.id)}`}>Compare records</ProfileLink>
        )}
      </div>
      <header className="space-y-2">
        <p className="type-label text-[var(--accent)]">{label}</p>
        <h1 className="type-page-title break-words">{title}</h1>
        {summary && <p className="max-w-3xl text-sm leading-relaxed text-[var(--text-secondary)]">{summary}</p>}
      </header>
      {children}
    </div>
  );
}
