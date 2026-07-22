export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { NewsFeed } from "@/components/NewsFeed";
import { DataUnavailable } from "@/components/shared/DataUnavailable";
import { getNewsFeed } from "@/modules/news/queries";

export const metadata: Metadata = {
  title: "Daily Intelligence Feed",
};

export default async function NewsPage() {
  try {
    const feed = await getNewsFeed();
    return <NewsFeed feed={feed} />;
  } catch (error) {
    console.error("Database query failed on /news:", error);
    return <DataUnavailable title="News feed data could not be loaded." />;
  }
}
