import { DealDatabaseClient } from "@/components/DealDatabaseClient";

export default function Home() {
  return <DealDatabaseClient deals={[]} counts={{ deals: 0, funds: 0, portfolio: 0 }} />;
}
