"use client";

export function CTABlock() {
  return (
    <div className="my-6">
      <div className="h-[2px] bg-[#008253]" />
      <div className="bg-white border-x border-black/[0.08] px-6 sm:px-10 py-6 sm:py-8">
        <div className="max-w-lg mx-auto text-center">
          <h3 className="font-heading text-[20px] sm:text-[24px] font-bold text-[#1a1a1a] leading-tight mb-2">
            Create an account to search the database
          </h3>
          <p className="text-[12px] text-[#6e6e6e] mb-5 leading-relaxed">
            Unlock thousands of GP and LP data profiles for insights into investment strategies,
            funds in market, fund performance, offices and key contacts.
          </p>
          <div className="flex flex-col items-center gap-2.5">
            <button className="bg-[#008253] text-white font-heading font-bold text-[12px] px-8 py-[8px] hover:bg-[#006d45] transition-colors tracking-wide uppercase">
              Register for free
            </button>
          </div>
        </div>
      </div>
      <div className="h-[2px] bg-[#008253]" />
    </div>
  );
}
