import type { Metadata } from "next";
import { DealDatabaseClient } from "@/components/DealDatabaseClient";

export const metadata: Metadata = {
  title: "Deal Tracker",
};

export default function TrackerPage() {
  return <DealDatabaseClient deals={[]} counts={{ deals: 0, funds: 0, portfolio: 0 }} />;
}
