import dynamic from "next/dynamic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Funds",
};

const FundDatabase = dynamic(
  () => import("@/components/FundDatabase").then((m) => ({ default: m.FundDatabase })),
  { ssr: false }
);

export default function FundsPage() {
  return <FundDatabase />;
}
