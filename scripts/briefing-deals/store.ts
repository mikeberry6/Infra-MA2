import { normalizeFundName } from "../../src/lib/fund-name-utils";
import type { Prisma, PrismaClient } from "../../src/generated/prisma/client";
import { classifyDealImport, commitDealImport, prepareDealRows } from "../../src/modules/imports/deals";
import { digest, sourceKey, normalizeName } from "./archive";
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
    for (const merge of proposal.duplicates) {
      const duplicate = current.records.find(d => d.legacyId === merge.duplicateId && d.status === "PUBLISHED");
      const canonical = current.records.find(d => d.legacyId === merge.canonicalId && d.status === "PUBLISHED");
      if (!duplicate || !canonical || normalizeName(duplicate.target) !== normalizeName(canonical.target)) throw new Error("Duplicate merge requires two existing published records for the same asset");
      const citations = await tx.citation.findMany({ where: { dealId: duplicate.id } });
      for (const citation of citations) {
        if (!(await tx.citation.findFirst({ where: { dealId: canonical.id, sourceId: citation.sourceId } }))) await tx.citation.create({ data: { dealId: canonical.id, sourceId: citation.sourceId, isPrimary: citation.isPrimary, purpose: citation.purpose, evidenceLabel: citation.evidenceLabel } });
      }
      await tx.briefingDeal.updateMany({ where: { dealId: duplicate.id }, data: { dealId: canonical.id } });
      await tx.newsMention.updateMany({ where: { dealId: duplicate.id }, data: { dealId: canonical.id } });
      await tx.deal.update({ where: { id: duplicate.id }, data: { status: "ARCHIVED" } });
      await tx.auditEvent.create({ data: { entityType: "BriefingDuplicateMerge", entityId: merge.duplicateId, action: "MERGE", metadata: { canonicalLegacyId: merge.canonicalId, evidence: merge.evidence, sourceUrl: merge.sourceUrl, duplicateBefore: JSON.parse(JSON.stringify(duplicate)) } } });
    }
    const existingToPublish: string[] = [];
    const citationsToAdd: Proposal["decisions"] = [];
    const creates = new Map<string, NonNullable<Proposal["decisions"][number]["data"]>>();
    for (const row of proposal.decisions) {
      if (row.action === "MATCH") {
        const match = current.records.find(d => d.legacyId === row.canonicalId && (d.status === "PUBLISHED" || (row.data?.publishExisting === true && ["DRAFT", "IN_REVIEW"].includes(d.status))));
        if (match && match.status !== "PUBLISHED") existingToPublish.push(match.id);
        if (!match) throw new Error(`Missing or unpublished match: ${row.canonicalId}`);
        if (match.date.slice(0,10) !== row.verifiedAnnouncementDate) throw new Error(`Matched deal date or source conflicts with verified evidence; correct the individual record and regenerate preview: ${row.canonicalId}`);
        if (!match.sources.some(s => sourceKey(s) === sourceKey(row.verificationSourceUrl!))) {
          if (row.data?.addCitation !== true) throw new Error(`Matched deal date or source conflicts with verified evidence; explicit citation addition required: ${row.canonicalId}`);
          citationsToAdd.push(row);
        }
      } else {
        const data = { ...row.data!, id: row.canonicalId };
        if (creates.has(row.canonicalId) && digest(creates.get(row.canonicalId)) !== digest(data)) throw new Error(`Conflicting creates: ${row.canonicalId}`);
        creates.set(row.canonicalId, data);
      }
    }
    for (const row of citationsToAdd) {
      const deal = current.records.find(d => d.legacyId === row.canonicalId)!;
      const source = await tx.source.upsert({ where: { url: row.verificationSourceUrl! }, update: {}, create: { url: row.verificationSourceUrl!, label: String(row.data?.sourceName || "Primary transaction announcement"), type: "ARTICLE" } });
      if (!(await tx.citation.findFirst({ where: { dealId: deal.id, sourceId: source.id } }))) await tx.citation.create({ data: { dealId: deal.id, sourceId: source.id, isPrimary: deal.sources.length === 0 } });
    }
    if (existingToPublish.length) await tx.deal.updateMany({ where: { id: { in: existingToPublish }, status: { in: ["DRAFT", "IN_REVIEW"] } }, data: { status: "PUBLISHED" } });
    const canonicalParty = (name: string) => {
      const via = name.match(/\s*\(via\s+[^)]+\)\s*$/)?.[0] ?? "";
      return `${normalizeFundName(name)}${via}`;
    };
    const prepared = prepareDealRows([...creates.values()]);
    for (const row of prepared.prepared) {
      row.buyers = row.buyers.map(canonicalParty);
      row.sellers = row.sellers.map(canonicalParty);
    }
    if (prepared.errors.length) throw new Error("Invalid reviewed create data");
    const classification = await classifyDealImport(tx, prepared);
    if ([...classification.actions.values()].some(a => a !== "create")) throw new Error("CREATE identity already exists; review as MATCH");
    await commitDealImport(tx, classification);
    if (creates.size) await tx.deal.updateMany({ where: { legacyId: { in: [...creates.keys()] }, status: "DRAFT" }, data: { status: "PUBLISHED" } });
    const canonicalDeals = await tx.deal.findMany({ where: { legacyId: { in: [...new Set(proposal.decisions.map(r => r.canonicalId))] } }, select: { id: true, legacyId: true } });
    const canonicalIds = new Map(canonicalDeals.map(d => [d.legacyId, d.id]));
    for (const issue of proposal.issues) {
      const { cards: _cards, ...data } = issue;
      await tx.briefingIssue.upsert({ where: { edition: issue.edition }, create: {
        ...data, coverageStart: new Date(`${data.coverageStart}T00:00:00Z`), coverageEnd: new Date(`${data.coverageEnd}T00:00:00Z`),
      }, update: { ...data, coverageStart: new Date(`${data.coverageStart}T00:00:00Z`), coverageEnd: new Date(`${data.coverageEnd}T00:00:00Z`) } });
      await tx.briefingDeal.deleteMany({ where: { issueEdition: issue.edition } });
      await tx.briefingDeal.createMany({ data: issue.cards.map(card => {
        const decision = proposal.decisions.find(r => r.edition === issue.edition && r.cardKey === card.key)!;
        const dealId = canonicalIds.get(decision.canonicalId);
        if (!dealId) throw new Error(`Missing canonical deal: ${decision.canonicalId}`);
        return { issueEdition: issue.edition, cardKey: card.key, position: card.position, dealId };
      }) });
    }
    await tx.auditEvent.create({ data: { id: auditId, entityType: "BriefingImport", action: "APPLY", metadata: JSON.parse(JSON.stringify(proposal)) as Prisma.InputJsonValue } });
    return { manifestHash, alreadyApplied: false, issueCount: proposal.issues.length, cardCount: proposal.decisions.length };
  }, { isolationLevel: "Serializable", timeout: 300000, maxWait: 30000 });
}
