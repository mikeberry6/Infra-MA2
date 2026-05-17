"use client";

import type { ReactNode } from "react";

export interface IntelligenceMetric {
  label: string;
  value: string;
  detail?: string;
  color?: string;
}

interface DatabaseIntelligenceHeaderProps {
  eyebrow: string;
  title: string;
  summary: string;
  metrics: IntelligenceMetric[];
  actions?: ReactNode;
}

export function DatabaseIntelligenceHeader({
  eyebrow,
  title,
  summary,
  actions,
}: DatabaseIntelligenceHeaderProps) {
  return (
    <section className="mb-5 border-b border-[var(--border)] pb-5">
      <div className="mb-4 h-[2px] w-full max-w-[360px] bg-gradient-to-r from-[var(--accent)] via-[#3b6cf2] to-transparent" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <div className="mb-2 inline-flex items-center gap-2 type-label">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            {eyebrow}
          </div>
          <h1 className="type-page-title">
            {title}
          </h1>
          <p className="mt-1.5 type-meta max-w-2xl">
            {summary}
          </p>
        </div>

        {actions && (
          <div className="shrink-0 lg:pt-1">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
