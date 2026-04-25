import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[720px] px-4 sm:px-6 py-16">
      <div className="border border-black/[0.08] bg-white p-8">
        <p className="text-[11px] font-medium uppercase tracking-wider text-[#008253]">404</p>
        <h1 className="mt-1 text-xl font-semibold text-[#1a1a1a]">Page not found</h1>
        <p className="mt-2 text-sm text-[#555]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-9 items-center px-4 text-[12px] font-medium bg-[#008253] text-white hover:bg-[#006e46] transition-colors"
        >
          Back to deals
        </Link>
      </div>
    </div>
  );
}
