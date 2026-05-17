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
  metrics,
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

      {metrics.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {metrics.map((metric, index) => {
            const color = metric.color ?? "var(--accent)";
            return (
              <div
                key={`${metric.label}-${index}`}
                className="inline-flex max-w-full min-w-0 items-center gap-2 border-r border-[var(--border)] pr-4 last:border-r-0 last:pr-0"
              >
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="type-micro font-medium text-[var(--text-tertiary)]">
                  {metric.label}
                </span>
                <span className="mono text-[13px] font-semibold leading-4 text-[var(--text-primary)] tabular-nums">
                  {metric.value}
                </span>
                {metric.detail && (
                  <span className="min-w-0 max-w-[18rem] truncate type-micro text-[var(--text-tertiary)]">
                    {metric.detail}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
