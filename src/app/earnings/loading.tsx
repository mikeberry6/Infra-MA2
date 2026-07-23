import { RouteLoadingRegion } from "@/components/shared/RouteLoadingRegion";

export default function EarningsLoading() {
  return (
    <RouteLoadingRegion
      label="Loading earnings"
      className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6"
    >
      <div className="animate-pulse">
        <div className="h-36 rounded-lg bg-[var(--bg-hover)]" />
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-44 rounded-md bg-[var(--bg-hover)]" />)}</div>
      </div>
    </RouteLoadingRegion>
  );
}
