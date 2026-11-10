import type { Prisma } from "@/generated/prisma/client";

export const SPONSOR_TYPES = ["FUND_MANAGER", "PENSION", "SOVEREIGN_WEALTH"] as const;

export const PUBLIC_SPONSOR_WHERE = {
  status: "PUBLISHED",
  OR: [
    { types: { hasSome: [...SPONSOR_TYPES] } },
    { managedFunds: { some: { status: "PUBLISHED" } } },
  ],
} satisfies Prisma.OrganizationWhereInput;

export const SPONSOR_IDENTITY_SELECT = {
  id: true,
  name: true,
  types: true,
  status: true,
  _count: { select: { managedFunds: { where: { status: "PUBLISHED" } } } },
} as const;

export function isPublicSponsor(organization: {
  types?: readonly string[];
  status?: string;
  _count?: { managedFunds: number };
} | null | undefined): boolean {
  return organization?.status === "PUBLISHED" && (
    !!organization.types?.some((type) => SPONSOR_TYPES.some((eligible) => eligible === type))
    || !!organization._count?.managedFunds
  );
}
