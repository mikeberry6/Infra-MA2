export default function Loading() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-10">
      <div className="animate-pulse space-y-4">
        <div className="h-7 w-1/3 bg-black/[0.06]" />
        <div className="h-4 w-1/2 bg-black/[0.06]" />
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="h-32 bg-black/[0.04]" />
          <div className="h-32 bg-black/[0.04]" />
          <div className="h-32 bg-black/[0.04]" />
        </div>
        <div className="mt-6 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-black/[0.03]" />
          ))}
        </div>
      </div>
    </div>
  );
}
