"use client";

import { Button } from "@/components/shared/Button";

export function CTABlock() {
  return (
    <div className="my-8">
      <div className="surface px-6 sm:px-10 py-8 sm:py-10">
        <div className="max-w-lg mx-auto text-center">
          <h3 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight leading-tight mb-2">
            Create an account to search the database
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
            Unlock thousands of GP and LP data profiles for insights into investment strategies,
            funds in market, fund performance, offices and key contacts.
          </p>
          <Button variant="primary" size="lg">
            Register for free
          </Button>
        </div>
      </div>
    </div>
  );
}
