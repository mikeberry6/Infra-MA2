import Link from "next/link";
import DealForm from "@/components/admin/DealForm";
import { createDeal } from "@/modules/admin/actions";

export const metadata = { title: "Admin - New Deal" };

export default function NewDealPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/deals" className="text-sm text-[#71717A] hover:text-white mb-2 inline-block">
            &larr; Back to Deals
          </Link>
          <h1 className="text-2xl font-bold">New Deal</h1>
        </div>

        <DealForm action={createDeal} mode="create" />
      </div>
    </div>
  );
}
