export default function NewsLoading() {
  return (
    <div className="mx-auto max-w-[1280px] animate-pulse px-4 py-6 sm:px-6">
      <div className="h-48 rounded-lg bg-[var(--bg-hover)]" />
      <div className="mt-4 h-16 rounded-md bg-[var(--bg-hover)]" />
      <div className="mt-5 grid gap-3 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-36 rounded-md bg-[var(--bg-hover)]" />)}</div>
      <div className="mt-5 h-12 rounded-md bg-[var(--bg-hover)]" />
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-32 rounded-md bg-[var(--bg-hover)]" />)}</div><div className="hidden h-96 rounded-md bg-[var(--bg-hover)] lg:block" /></div>
    </div>
  );
}
