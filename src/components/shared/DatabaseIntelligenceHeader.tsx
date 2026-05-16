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
    <section className="mb-5 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-[0_1px_2px_rgba(17,17,20,0.03)]">
      <div className="h-[2px] bg-gradient-to-r from-[var(--accent)] via-[#3b6cf2] to-transparent" />
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
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
            <div className="shrink-0">
              {actions}
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] sm:grid-cols-4">
          {metrics.map((metric, index) => (
            <div
              key={`${metric.label}-${index}`}
              className="min-w-0 border-b border-r border-[var(--border)] px-3 py-2.5 [&:nth-child(2n)]:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 sm:border-b-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(4n)]:border-r-0"
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: metric.color ?? "var(--accent)" }}
                />
                <span className="type-micro font-medium text-[var(--text-secondary)] truncate">
                  {metric.label}
                </span>
              </div>
              <div className="mt-1 mono text-[18px] font-semibold leading-6 text-[var(--text-primary)] tabular-nums truncate">
                {metric.value}
              </div>
              {metric.detail && (
                <div className="mt-0.5 type-micro truncate">
                  {metric.detail}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
