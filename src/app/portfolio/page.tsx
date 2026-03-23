import dynamic from "next/dynamic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PortCo Database",
};

const PortfolioDatabase = dynamic(
  () => import("@/components/PortfolioDatabase").then((m) => ({ default: m.PortfolioDatabase })),
  { ssr: false }
);

export default function PortfolioPage() {
  return <PortfolioDatabase />;
}
