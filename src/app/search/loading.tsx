import { RouteLoadingRegion } from "@/components/shared/RouteLoadingRegion";

export default function SearchLoading() {
  return (
    <RouteLoadingRegion
      label="Loading search"
      className="mx-auto max-w-[900px] px-4 py-8 sm:px-6 sm:py-10"
    >
      <div className="animate-pulse">
        <div className="h-2 w-64 rounded bg-[var(--bg-hover)]" />
        <div className="mt-4 h-8 w-72 rounded bg-[var(--bg-hover)]" />
        <div className="mt-3 h-4 w-full max-w-xl rounded bg-[var(--bg-hover)]" />
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-20 rounded-md bg-[var(--bg-hover)]" />)}</div>
        <div className="mt-6 h-10 rounded-md bg-[var(--bg-hover)]" />
        <div className="mt-7 space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-20 rounded-md bg-[var(--bg-hover)]" />)}</div>
      </div>
    </RouteLoadingRegion>
  );
}
