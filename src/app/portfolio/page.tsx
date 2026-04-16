import { PortfolioDatabase } from "@/components/PortfolioDatabase";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PortCos",
};

export default function PortfolioPage() {
  return <PortfolioDatabase />;
}
