import { prisma } from "../../src/lib/prisma";
import {
  E2E_DEAL_FIXTURE_SOURCE_LABEL,
  E2E_DEAL_FIXTURE_SOURCE_URL_PREFIXES,
  E2E_DEAL_FIXTURE_SPECS,
  validateDealFixtureCandidate,
  validateDealFixtureSourceCandidate,
} from "./deal-fixture-contract";
import { assertIsolatedE2EDatabase } from "./isolation-guard";

function requireIsolatedFixtureTarget(): void {
  assertIsolatedE2EDatabase();
  if (process.env.TARGET_DATABASE !== "validation") {
    throw new Error("Deal fixture maintenance requires TARGET_DATABASE=validation.");
  }
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL !== process.env.E2E_DATABASE_URL) {
    throw new Error("Deal fixture maintenance requires DATABASE_URL to equal E2E_DATABASE_URL.");
  }
}

async function removeFixtureRows() {
  return prisma.$transaction(async (tx) => {
    const fixtures = await tx.deal.findMany({
      where: {
        OR: E2E_DEAL_FIXTURE_SPECS.map(({ targetPrefix }) => ({
          target: { startsWith: targetPrefix },
        })),
      },
      select: {
        id: true,
        legacyId: true,
        target: true,
        title: true,
        description: true,
        status: true,
        participants: {
          where: { role: "BUYER" },
          select: {
            displayName: true,
            organization: { select: { name: true } },
          },
        },
        _count: { select: { newsMentions: true } },
      },
    });

    const invalidFixtures = fixtures.flatMap((fixture) => {
      const buyerNames = Array.from(new Set(fixture.participants.flatMap((participant) => [
        participant.displayName,
        participant.organization.name,
      ].filter((name): name is string => Boolean(name)))));
      const validation = validateDealFixtureCandidate({
        legacyId: fixture.legacyId,
        target: fixture.target,
        title: fixture.title,
        description: fixture.description,
        buyerNames,
        newsMentionCount: fixture._count.newsMentions,
      });
      return validation.valid
        ? []
        : [{ id: fixture.id, target: fixture.target, reasons: validation.reasons }];
    });

    if (invalidFixtures.length > 0) {
      throw new Error(
        `Refusing to remove ${invalidFixtures.length} prefix-matched deal(s) without the complete E2E fixture signature: ${JSON.stringify(invalidFixtures)}`,
      );
    }

    const fixtureIds = fixtures.map(({ id }) => id);
    const sources = await tx.source.findMany({
      where: {
        OR: [
          { label: E2E_DEAL_FIXTURE_SOURCE_LABEL },
          ...E2E_DEAL_FIXTURE_SOURCE_URL_PREFIXES.map((urlPrefix) => ({
            url: { startsWith: urlPrefix },
          })),
          ...(fixtureIds.length === 0
            ? []
            : [{ citations: { some: { dealId: { in: fixtureIds } } } }]),
        ],
      },
      select: {
        id: true,
        label: true,
        url: true,
        citations: {
          select: {
            dealId: true,
            companyId: true,
          },
        },
      },
    });
    const invalidSources = sources.flatMap((source) => {
      const validation = validateDealFixtureSourceCandidate(source, fixtureIds);
      return validation.valid
        ? []
        : [{ id: source.id, url: source.url, reasons: validation.reasons }];
    });
    if (invalidSources.length > 0) {
      throw new Error(
        `Refusing to remove ${invalidSources.length} source(s) without the complete orphan-safe E2E fixture signature: ${JSON.stringify(invalidSources)}`,
      );
    }

    const sourceIds = sources.map(({ id }) => id);
    if (fixtureIds.length === 0 && sourceIds.length === 0) {
      return {
        matched: {
          deals: 0,
          sources: 0,
        },
        deleted: {
          deals: 0,
          participants: 0,
          citations: 0,
          auditEvents: 0,
          orphanSources: 0,
        },
        records: {
          deals: [],
          sources: [],
        },
      };
    }

    const noDeletion = { count: 0 };
    const auditEvents = fixtureIds.length === 0
      ? noDeletion
      : await tx.auditEvent.deleteMany({
        where: { entityType: "Deal", entityId: { in: fixtureIds } },
      });
    const citations = fixtureIds.length === 0
      ? noDeletion
      : await tx.citation.deleteMany({
        where: { dealId: { in: fixtureIds } },
      });
    const participants = fixtureIds.length === 0
      ? noDeletion
      : await tx.dealParticipant.deleteMany({
        where: { dealId: { in: fixtureIds } },
      });
    const deals = fixtureIds.length === 0
      ? noDeletion
      : await tx.deal.deleteMany({
        where: { id: { in: fixtureIds } },
      });
    const remainingSourceCitations = sourceIds.length === 0
      ? 0
      : await tx.citation.count({
        where: { sourceId: { in: sourceIds } },
      });
    if (remainingSourceCitations !== 0) {
      throw new Error(
        `Refusing to remove E2E sources while ${remainingSourceCitations} citation dependency/dependencies remain.`,
      );
    }
    const orphanSources = sourceIds.length === 0
      ? noDeletion
      : await tx.source.deleteMany({
        where: {
          id: { in: sourceIds },
          citations: { none: {} },
        },
      });

    if (deals.count !== fixtureIds.length) {
      throw new Error(
        `Deal fixture cleanup expected to remove ${fixtureIds.length} deals but removed ${deals.count}.`,
      );
    }
    if (orphanSources.count !== sourceIds.length) {
      throw new Error(
        `Deal fixture cleanup expected to remove ${sourceIds.length} orphan sources but removed ${orphanSources.count}.`,
      );
    }

    return {
      matched: {
        deals: fixtures.length,
        sources: sources.length,
      },
      deleted: {
        deals: deals.count,
        participants: participants.count,
        citations: citations.count,
        auditEvents: auditEvents.count,
        orphanSources: orphanSources.count,
      },
      records: {
        deals: fixtures.map(({ legacyId, target, status }) => ({ legacyId, target, status })),
        sources: sources.map(({ label, url }) => ({ label, url })),
      },
    };
  }, {
    isolationLevel: "Serializable",
    maxWait: 15_000,
    timeout: 60_000,
  });
}

async function main(): Promise<void> {
  requireIsolatedFixtureTarget();
  const operation = process.argv[2];
  if (operation !== "cleanup") {
    throw new Error("Usage: deal-fixture-maintenance.ts cleanup");
  }

  const result = await removeFixtureRows();
  console.log(JSON.stringify({
    fixture: "authenticated-write-deals",
    operation,
    status: "succeeded",
    ...result,
  }));
}

main()
  .catch((error) => {
    console.error(JSON.stringify({
      fixture: "authenticated-write-deals",
      operation: process.argv[2] || null,
      status: "failed",
      error: error instanceof Error ? error.message : "Deal fixture maintenance failed.",
    }));
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
