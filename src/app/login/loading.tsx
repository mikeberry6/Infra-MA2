export default function LoginLoading() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-md animate-pulse items-center px-4 py-12">
      <div className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-6">
        <div className="h-7 w-40 rounded bg-[var(--bg-hover)]" />
        <div className="mt-3 h-4 w-64 rounded bg-[var(--bg-hover)]" />
        <div className="mt-7 h-10 rounded-md bg-[var(--bg-hover)]" />
        <div className="mt-4 h-10 rounded-md bg-[var(--bg-hover)]" />
        <div className="mt-5 h-10 rounded-md bg-[var(--bg-hover)]" />
      </div>
    </div>
  );
}
