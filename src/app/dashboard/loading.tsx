import { RouteLoadingRegion } from "@/components/shared/RouteLoadingRegion";

export default function DashboardLoading() {
  return (
    <RouteLoadingRegion
      label="Loading dashboard"
      className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8"
    >
      <div className="mb-5 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="h-[2px] bg-[var(--bg-hover)]" />
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex animate-pulse flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="h-3 w-48 rounded bg-[var(--bg-hover)]" />
              <div className="h-7 w-72 rounded bg-[var(--bg-hover)]" />
              <div className="h-4 w-[min(38rem,80vw)] rounded bg-[var(--bg-hover)]" />
            </div>
            <div className="h-16 w-40 rounded-lg bg-[var(--bg-hover)]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <div className="surface h-72 animate-pulse bg-[var(--bg-surface)]" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="surface h-28 animate-pulse bg-[var(--bg-surface)]" />
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
        <div className="surface h-64 animate-pulse bg-[var(--bg-surface)]" />
        <div className="surface h-64 animate-pulse bg-[var(--bg-surface)]" />
      </div>
    </RouteLoadingRegion>
  );
}
