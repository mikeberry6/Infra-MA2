import type { Metadata } from "next";
import { FundDatabaseClient } from "@/components/FundDatabaseClient";

export const metadata: Metadata = {
  title: "Funds",
};

export default function FundsPage() {
  return <FundDatabaseClient funds={[]} counts={{ deals: 0, funds: 0, portfolio: 0 }} />;
}
