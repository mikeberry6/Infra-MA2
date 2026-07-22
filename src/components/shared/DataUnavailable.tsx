import { AlertTriangle, Mail, RefreshCw } from "lucide-react";
import { withBasePath } from "@/lib/base-path";

interface DataUnavailableProps {
  title: string;
  message?: string;
  retryHref: string;
}

export function DataUnavailable({
  title,
  message = "The database query failed, so this page is not showing an empty result set. Try again shortly or contact research if the issue persists.",
  retryHref,
}: DataUnavailableProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-[760px] items-center px-4 py-12 sm:px-6">
      <section
        role="alert"
        className="surface-elevated w-full px-5 py-6 sm:px-7 sm:py-8"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#f59e0b]/20 bg-[#f59e0b]/10 text-[#b45309]">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="type-label">Data unavailable</p>
            <h1 className="mt-1 type-section-title text-[var(--text-primary)]">
              {title}
            </h1>
            <p className="mt-2 type-meta text-[var(--text-secondary)]">
              {message}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={withBasePath(retryHref)}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-[var(--accent)] px-3 type-meta font-medium text-[var(--text-on-accent)] transition-colors hover:bg-[var(--accent-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try again
              </a>
              <a
                href="mailto:research@infrasight.com"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 type-meta font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
              >
                <Mail className="h-3.5 w-3.5" />
                Contact research
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
