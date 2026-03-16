import { FundDatabase } from "@/components/FundDatabase";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fund Database",
};

export default function FundsPage() {
  return <FundDatabase />;
}
