export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-8">
      <div className="animate-pulse space-y-3">
        <div className="h-6 w-1/4 bg-black/[0.06]" />
        <div className="h-px bg-black/[0.08]" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-10 bg-black/[0.03]" />
        ))}
      </div>
    </div>
  );
}
