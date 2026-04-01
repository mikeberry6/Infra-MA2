"use client";

export function CTABlock() {
  return (
    <div className="my-8 border-t-2 border-[#008253]">
      <div className="bg-white border border-[#d8d8d8] px-6 py-8 text-center">
        <h3 className="font-heading text-xl font-bold text-[#111111] mb-2">
          Get full access to Infrastructure Investor data
        </h3>
        <p className="text-sm text-[#6f6f6f] mb-5 max-w-md mx-auto">
          Track deals, funds, and portfolio companies across global infrastructure.
        </p>
        <button className="bg-[#008253] text-white text-sm font-semibold px-8 py-2.5 hover:bg-[#006d45] transition-colors">
          Register for free
        </button>
      </div>
    </div>
  );
}
