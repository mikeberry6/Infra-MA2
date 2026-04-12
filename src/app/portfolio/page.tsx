import type { Metadata } from "next";
import { PortfolioDatabaseClient } from "@/components/PortfolioDatabaseClient";

export const metadata: Metadata = {
  title: "Portfolio Companies",
};

export default function PortfolioPage() {
  return <PortfolioDatabaseClient companies={[]} funds={[]} counts={{ deals: 0, funds: 0, portfolio: 0 }} />;
}
