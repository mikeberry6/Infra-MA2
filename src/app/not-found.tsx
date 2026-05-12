import Link from "next/link";
import { Button } from "@/components/shared/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[640px] px-4 sm:px-6 py-16">
      <div className="surface px-6 py-8 sm:px-8 sm:py-10">
        <div className="type-label">
          404
        </div>
        <h1 className="mt-1 type-page-title">
          Page not found
        </h1>
        <p className="mt-2 type-meta">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6">
          <Link href="/">
            <Button variant="primary" size="md">
              Back to deals
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
