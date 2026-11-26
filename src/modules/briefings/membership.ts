import { prisma } from "@/lib/prisma";
import type { Issue } from "../../../scripts/briefing-deals/archive";

export async function hasVerifiedBriefingMembership(archive: Issue): Promise<boolean> {
  try {
    const issue = await prisma.briefingIssue.findUnique({
      where: { edition: archive.edition },
      select: {
        archivePath: true,
        contentHash: true,
        deals: {
          orderBy: { position: "asc" },
          select: { cardKey: true, position: true, dealId: true, deal: { select: { status: true } } },
        },
      },
    });

    return !!issue
      && issue.contentHash === archive.contentHash
      && issue.archivePath === archive.archivePath
      && issue.deals.length === archive.cards.length
      && new Set(issue.deals.map(({ dealId }) => dealId)).size === archive.cards.length
      && issue.deals.every((membership, index) => {
        const card = archive.cards[index];
        return membership.cardKey === card.key
          && membership.position === card.position
          && membership.deal.status === "PUBLISHED";
      });
  } catch (error) {
    // The archive remains readable when the membership schema or data is unavailable.
    console.error("Weekly briefing deal membership unavailable:", error);
    return false;
  }
}
