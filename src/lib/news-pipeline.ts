export const NEWS_PIPELINE = "nightly-news";
export const NEWS_INGEST_SUCCEEDED = "SUCCEEDED";

type NewsScanHealth = {
  selection: { selectedEntities: number; cappedByMaxTargets: boolean };
  crawl: { pagesFetched: number };
  search: { enabled: boolean; queriesRun: number; failedQueries: number };
};

export function completedNewsIngest(summary: NewsScanHealth): boolean {
  return summary.selection.selectedEntities > 0
    && !summary.selection.cappedByMaxTargets
    && (!summary.search.enabled || summary.search.queriesRun > 0)
    && (summary.crawl.pagesFetched > 0 || summary.search.queriesRun > summary.search.failedQueries);
}
