import type { Prisma, PrismaClient } from "../../src/generated/prisma/client";
import { classifyDealImport, commitDealImport, prepareDealRows } from "../../src/modules/imports/deals";
import { digest } from "./archive";
import { validateApprovedProposal, type Proposal, type SnapshotDeal } from "./domain";

type Client = Prisma.TransactionClient;
export async function snapshot(client: Client) {
  const deals = await client.deal.findMany({ select: {
    id: true, legacyId: true, target: true, date: true, status: true, updatedAt: true,
    participants: { select: { role: true, displayName: true, organization: { select: { name: true } } } },
    citations: { select: { source: { select: { url: true } } } },
  }, orderBy: { legacyId: "asc" } });
  const records: SnapshotDeal[] = deals.map(d => ({
    id: d.id, legacyId: d.legacyId, target: d.target, date: d.date.toISOString(), status: d.status,
    updatedAt: d.updatedAt.toISOString(), sources: d.citations.map(c => c.source.url).sort(),
    buyers: d.participants.filter(p => p.role === "BUYER").map(p => p.displayName || p.organization.name).sort(),
    sellers: d.participants.filter(p => p.role === "SELLER").map(p => p.displayName || p.organization.name).sort(),
  }));
  const tables = await client.$queryRaw<Array<{ present: string | null }>>`SELECT to_regclass('public."BriefingIssue"')::text AS present`;
  const issues = tables[0]?.present ? await client.briefingIssue.findMany({
    orderBy: { edition: "asc" }, include: { deals: { orderBy: { cardKey: "asc" } } },
  }) : [];
  return { records, issues, hash: digest({ records, issues }) };
}

export async function applyProposal(client: PrismaClient, input: unknown, expectedHash: string) {
  const proposal = validateApprovedProposal(input);
  const manifestHash = digest(proposal);
  if (manifestHash !== expectedHash) throw new Error("Approved manifest hash does not match");
  return client.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(7311031600::bigint)`;
    const auditId = `briefing-${manifestHash}`;
    const prior = await tx.auditEvent.findUnique({ where: { id: auditId } });
    if (prior) return { manifestHash, alreadyApplied: true, issueCount: proposal.issues.length, cardCount: proposal.decisions.length };
    const current = await snapshot(tx);
    if (current.hash !== proposal.snapshotHash) throw new Error("Database snapshot is stale; regenerate preview and review changes");
    const creates = new Map<string, NonNullable<Proposal["decisions"][number]["data"]>>();
    for (const row of proposal.decisions) {
      if (row.action === "MATCH") {
        if (!current.records.some(d => d.legacyId === row.canonicalId && d.status === "PUBLISHED")) throw new Error(`Missing or unpublished match: ${row.canonicalId}`);
      } else {
        const data = { ...row.data!, id: row.canonicalId };
        if (creates.has(row.canonicalId) && digest(creates.get(row.canonicalId)) !== digest(data)) throw new Error(`Conflicting creates: ${row.canonicalId}`);
        creates.set(row.canonicalId, data);
      }
    }
    const prepared = prepareDealRows([...creates.values()]);
    if (prepared.errors.length) throw new Error("Invalid reviewed create data");
    const classification = await classifyDealImport(tx, prepared);
    if ([...classification.actions.values()].some(a => a !== "create")) throw new Error("CREATE identity already exists; review as MATCH");
    await commitDealImport(tx, classification);
    if (creates.size) await tx.deal.updateMany({ where: { legacyId: { in: [...creates.keys()] }, status: "DRAFT" }, data: { status: "PUBLISHED" } });
    for (const issue of proposal.issues) {
      const { cards: _cards, ...data } = issue;
      await tx.briefingIssue.upsert({ where: { edition: issue.edition }, create: {
        ...data, coverageStart: new Date(`${data.coverageStart}T00:00:00Z`), coverageEnd: new Date(`${data.coverageEnd}T00:00:00Z`),
      }, update: { ...data, coverageStart: new Date(`${data.coverageStart}T00:00:00Z`), coverageEnd: new Date(`${data.coverageEnd}T00:00:00Z`) } });
      await tx.briefingDeal.deleteMany({ where: { issueEdition: issue.edition } });
      for (const card of issue.cards) {
        const decision = proposal.decisions.find(r => r.edition === issue.edition && r.cardKey === card.key)!;
        const deal = await tx.deal.findUniqueOrThrow({ where: { legacyId: decision.canonicalId }, select: { id: true } });
        await tx.briefingDeal.create({ data: { issueEdition: issue.edition, cardKey: card.key, position: card.position, dealId: deal.id } });
      }
    }
    await tx.auditEvent.create({ data: { id: auditId, entityType: "BriefingImport", action: "APPLY", metadata: JSON.parse(JSON.stringify(proposal)) as Prisma.InputJsonValue } });
    return { manifestHash, alreadyApplied: false, issueCount: proposal.issues.length, cardCount: proposal.decisions.length };
  }, { isolationLevel: "Serializable", timeout: 120000, maxWait: 15000 });
}
