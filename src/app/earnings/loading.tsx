export default function EarningsLoading() {
  return (
    <div role="status" aria-label="Loading earnings" aria-busy="true" className="mx-auto max-w-[1280px] animate-pulse px-4 py-6 sm:px-6">
      <span className="sr-only">Loading earnings…</span>
      <div aria-hidden="true" className="h-36 rounded-lg bg-[var(--bg-hover)]" />
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-44 rounded-md bg-[var(--bg-hover)]" />)}</div>
    </div>
  );
}
