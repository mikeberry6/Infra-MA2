import type { Prisma } from "@/generated/prisma/client";

type RedirectClient = Pick<Prisma.TransactionClient, "companyRedirect">;

/** Preserve the newly retired ID and any older IDs already targeting it. */
export async function rehomeCompanyRedirects(
  tx: RedirectClient,
  retiredId: string,
  canonicalId: string,
): Promise<void> {
  await tx.companyRedirect.updateMany({
    where: { companyId: retiredId },
    data: { companyId: canonicalId },
  });
  await tx.companyRedirect.upsert({
    where: { retiredId },
    create: { retiredId, companyId: canonicalId },
    update: { companyId: canonicalId, reason: "CANONICAL_MERGE" },
  });
}
