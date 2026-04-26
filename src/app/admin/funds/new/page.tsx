import Link from "next/link";
import FundForm from "@/components/admin/FundForm";
import { createFund } from "@/modules/admin/actions";

export const metadata = { title: "Admin - New Fund" };

export default function NewFundPage() {
  return (
    <div className="min-h-screen bg-[#f3f3f3] text-[#1a1a1a] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/funds" className="text-sm text-[#71717A] hover:text-[#1a1a1a] mb-2 inline-block">
            &larr; Back to Funds
          </Link>
          <h1 className="text-2xl font-bold">New Fund</h1>
        </div>

        <FundForm action={createFund} mode="create" />
      </div>
    </div>
  );
}
