"use client";

import Link from "next/link";

export function CTABlock() {
  return (
    <div className="my-8">
      <div className="border-t-[3px] border-b-[3px] border-[#008253]">
        <div className="bg-white border-x border-[#d6d6d6] px-8 py-10 text-center">
          <h3 className="font-heading text-2xl font-bold text-[#1a1a1a] mb-2">
            Create an account to search the database
          </h3>
          <p className="text-sm text-[#6e6e6e] mb-6 max-w-lg mx-auto leading-relaxed">
            Unlock thousands of GP and LP data profiles for insights into investment strategies,
            funds in market, fund performance, offices and key contacts.
          </p>
          <div className="flex flex-col items-center gap-3">
            <button className="bg-[#008253] text-white font-heading font-semibold text-sm px-8 py-2.5 hover:bg-[#006d45] transition-colors">
              Register for free
            </button>
            <span className="text-[12px] text-[#6e6e6e]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#008253] underline hover:text-[#006d45] transition-colors">
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
