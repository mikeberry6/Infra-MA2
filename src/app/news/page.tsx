export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { NewsFeed } from "@/components/NewsFeed";
import { DataUnavailable } from "@/components/shared/DataUnavailable";
import { currentServerRequestId } from "@/lib/server-request-context";
import { withServerTask } from "@/lib/server-log";
import { getNewsFeed } from "@/modules/news/queries";

export const metadata: Metadata = {
  title: "Daily Intelligence Feed",
};

export default async function NewsPage() {
  try {
    const requestId = await currentServerRequestId();
    return await withServerTask({ route: "/news", operation: "render_news", requestId }, async () => {
      const feed = await getNewsFeed();
      return <NewsFeed feed={feed} />;
    });
  } catch {
    return <DataUnavailable title="News feed data could not be loaded." retryHref="/news" />;
  }
}
