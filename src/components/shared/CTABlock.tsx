"use client";

import { Mail } from "lucide-react";
import { ResearchContactLink } from "@/components/ResearchContactLink";
import type { ProductEventProperties } from "@/lib/analytics-contract";

export function CTABlock({
  surface,
}: {
  surface: ProductEventProperties["research_contact_initiated"]["surface"];
}) {
  return (
    <div className="my-8">
      <div className="surface px-5 py-6 sm:px-8 sm:py-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 inline-flex items-center gap-2 type-label">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Research desk
            </div>
            <h3 className="type-page-title mb-2">
              Need a source packet or custom screen?
            </h3>
            <p className="type-meta">
              Ask InfraSight Research to prioritize a market, verify a company profile,
              or package the evidence behind a transaction, fund, or portfolio company.
            </p>
          </div>
          <ResearchContactLink
            surface={surface}
            subject="InfraSight research request"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-3.5 type-meta font-medium text-[var(--text-on-accent)] transition-colors hover:bg-[var(--accent-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
          >
            <Mail className="h-3.5 w-3.5" />
            Contact research
          </ResearchContactLink>
        </div>
      </div>
    </div>
  );
}
