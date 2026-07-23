export const revalidate = 300;

import type { Metadata } from "next";
import { NewsFeed } from "@/components/NewsFeed";
import { DataUnavailable } from "@/components/shared/DataUnavailable";
import { getNewsFeed } from "@/modules/news/queries";
import {
  logServerRequest,
  SERVER_OPERATIONS,
  SERVER_ROUTES,
} from "@/lib/server-log";

export const metadata: Metadata = {
  title: "Daily Intelligence Feed",
};

export default async function NewsPage() {
  const startedAt = performance.now();
  try {
    const feed = await getNewsFeed();
    logServerRequest({
      route: SERVER_ROUTES.newsPage,
      operation: SERVER_OPERATIONS.newsPageRead,
      startedAt,
      status: 200,
    });
    return <NewsFeed feed={feed} />;
  } catch (error) {
    logServerRequest({
      route: SERVER_ROUTES.newsPage,
      operation: SERVER_OPERATIONS.newsPageRead,
      startedAt,
      status: 500,
      error,
    });
    return <DataUnavailable title="News feed data could not be loaded." />;
  }
}
