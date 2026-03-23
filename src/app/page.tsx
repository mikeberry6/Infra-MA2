import dynamic from "next/dynamic";

const DealDatabase = dynamic(
  () => import("@/components/DealDatabase").then((m) => ({ default: m.DealDatabase })),
  { ssr: false }
);

export default function Home() {
  return <DealDatabase />;
}
