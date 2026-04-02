"use client";

import Link from "next/link";

export function CTABlock() {
  return (
    <div className="my-6">
      <div className="border-t-[3px] border-[#008253]" />
      <div className="bg-white border-x border-[#d6d6d6] px-6 sm:px-10 py-8 sm:py-10">
        <div className="max-w-xl mx-auto text-center">
          <h3 className="font-heading text-[22px] sm:text-[26px] font-bold text-[#1a1a1a] leading-tight mb-3">
            Create an account to search the database
          </h3>
          <p className="text-[13px] text-[#6e6e6e] mb-6 leading-relaxed">
            Unlock thousands of GP and LP data profiles for insights into investment strategies,
            funds in market, fund performance, offices and key contacts.
          </p>
          <div className="flex flex-col items-center gap-3">
            <button className="bg-[#008253] text-white font-heading font-bold text-[13px] px-10 py-[10px] hover:bg-[#006d45] transition-colors tracking-wide uppercase">
              Register for free
            </button>
            <span className="text-[12px] text-[#6e6e6e]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#008253] underline hover:text-[#006d45] transition-colors font-medium">
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </div>
      <div className="border-b-[3px] border-[#008253]" />
    </div>
  );
}
