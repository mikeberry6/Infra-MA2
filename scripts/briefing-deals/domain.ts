import { z } from "zod";
import { digest, editionSchema, issueSchema, normalizeName, sourceKey, type Issue, type Card } from "./archive";
import { prepareDealRows } from "../../src/modules/imports/deals";

export interface SnapshotDeal {
  id: string; legacyId: string; target: string; date: string; status: string;
  updatedAt: string; sources: string[]; buyers: string[]; sellers: string[];
}
export const decisionSchema = z.object({
  edition: z.string(), cardKey: z.string(), action: z.enum(["MATCH", "CREATE", "BLOCK"]),
  canonicalId: z.string(), verifiedAnnouncementDate: editionSchema.nullable(), verificationSourceUrl: z.url().nullable(), approved: z.boolean(), reviewer: z.string(), evidence: z.string(),
  data: z.record(z.string(), z.unknown()).nullable(),
}).strict();
export const proposalSchema = z.object({
  version: z.literal(1), target: z.object({ host: z.string(), database: z.string() }).strict(), snapshotHash: z.string(), issues: z.array(issueSchema),
  decisions: z.array(decisionSchema),
  duplicates: z.array(z.object({ duplicateId: z.string(), canonicalId: z.string(), evidence: z.string().min(1), sourceUrl: z.url() }).strict()).default([]),
}).strict();
export type Proposal = z.infer<typeof proposalSchema>;
export type Decision = z.infer<typeof decisionSchema>;

export function candidateIds(card: Card, deals: SnapshotDeal[]): string[] {
  return deals.filter(d => {
    const sameTarget = normalizeName(d.target) === normalizeName(card.target);
    const sameSource = Boolean(card.sourceUrl) && d.sources.some(s => sourceKey(s) === card.sourceUrl);
    const nearDate = !card.announcementDate || Math.abs(Date.parse(d.date) - Date.parse(card.announcementDate)) <= 14 * 86400000;
    return sameTarget && (sameSource || nearDate);
  }).map(d => d.legacyId);
}
export function buildProposal(issues: Issue[], deals: SnapshotDeal[], snapshotHash: string, target = { host: "unbound", database: "unbound" }): Proposal {
  return { version: 1, target, snapshotHash, issues, decisions: issues.flatMap(issue => issue.cards.map(card => {
    const matches = candidateIds(card, deals);
    return { edition: issue.edition, cardKey: card.key, action: matches.length === 1 ? "MATCH" as const : "BLOCK" as const,
      canonicalId: matches.length === 1 ? matches[0] : `WB-${digest({ source: card.sourceUrl, target: normalizeName(card.target), date: card.announcementDate }).slice(0,24)}`,
      verifiedAnnouncementDate: card.announcementDate, verificationSourceUrl: card.sourceUrl || null,
      approved: false, reviewer: "", evidence: "", data: null };
  })), duplicates: [] };
}
export function validateApprovedProposal(input: unknown) {
  const proposal = proposalSchema.parse(input);
  if (!proposal.issues.length) throw new Error("No issues selected");
  if (new Set(proposal.issues.map(i => i.edition)).size !== proposal.issues.length) throw new Error("Duplicate issue");
  const expected = new Set(proposal.issues.flatMap(i => i.cards.map(c => `${i.edition}/${c.key}`)));
  const seen = new Set<string>();
  for (const row of proposal.decisions) {
    const key = `${row.edition}/${row.cardKey}`;
    if (!expected.has(key) || seen.has(key)) throw new Error(`Unexpected or duplicate decision: ${key}`);
    seen.add(key);
    if (!row.approved || !row.reviewer.trim() || !row.evidence.trim() || row.action === "BLOCK" || !row.canonicalId.trim()) throw new Error(`Unreviewed decision: ${key}`);
    if (!row.verifiedAnnouncementDate || !row.verificationSourceUrl || !sourceKey(row.verificationSourceUrl)) throw new Error(`Missing verified announcement date or source: ${key}`);
    if (row.action === "CREATE") {
      const card = proposal.issues.find(i => i.edition === row.edition)!.cards.find(c => c.key === row.cardKey)!;
      const prepared = prepareDealRows([{ ...row.data, id: row.canonicalId }]);
      if (prepared.errors.length || prepared.prepared.length !== 1) throw new Error(`Invalid deal data: ${key}: ${prepared.errors.map(e => e.message).join(", ")}`);
      if (!sourceKey(String(row.data?.sourceUrl ?? "")) || !row.data?.date || !row.data?.status) throw new Error(`Missing verified source, date or status: ${key}`);
      if (prepared.prepared[0].date.slice(0,10) !== row.verifiedAnnouncementDate || sourceKey(String(row.data?.sourceUrl)) !== sourceKey(row.verificationSourceUrl)) throw new Error(`Deal date or source differs from verified evidence: ${key}`);
      if (normalizeName(String(row.data?.target)) !== normalizeName(card.target)) throw new Error(`Target differs from published card: ${key}`);
    }
  }
  if (seen.size !== expected.size) throw new Error("Every card requires a review decision");
  const duplicates = new Set<string>();
  for (const row of proposal.duplicates) {
    if (row.duplicateId === row.canonicalId || duplicates.has(row.duplicateId) || proposal.decisions.some(d => d.canonicalId === row.duplicateId)) throw new Error("Duplicate merge conflicts with an approved canonical identity");
    duplicates.add(row.duplicateId);
  }
  if (proposal.duplicates.some(row => duplicates.has(row.canonicalId))) throw new Error("Duplicate merge chains are forbidden");
  return proposal;
}
