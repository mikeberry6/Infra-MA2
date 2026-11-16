"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { applyNewsDealLifecycle } from "@/modules/news-evidence/mutation-actions";
import { reviewNews } from "../actions";
import type { NewsReviewInput } from "@/modules/news-evidence/review";

const inputClass = "w-full rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-2 type-meta text-[var(--text-primary)]";

type Option = { id: string; label: string };

export function ReviewControls({ revisionId, approvedRevisionId, title, summary, limits, canApprove, canCreateThread, linkedLegacy, related, transactions, legacy }: {
  revisionId: string;
  approvedRevisionId: string | null;
  title: string;
  summary: string;
  limits: { title: number; summary: number };
  canApprove: boolean;
  canCreateThread: boolean;
  linkedLegacy: boolean;
  related: Array<Option & { approvedRevisionId: string; hasThread: boolean; hasLegacy: boolean }>;
  transactions: Array<Option & { kind: "thread" | "deal" }>;
  legacy: Option[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState<NewsReviewInput["action"] | null>(null);
  const [error, setError] = useState("");
  const [targetId, setTargetId] = useState("");
  const [isCorrection, setCorrection] = useState(false);
  const [confirmedEvidence, setConfirmedEvidence] = useState(false);
  const [transaction, setTransaction] = useState("");
  const [legacyDecision, setLegacyDecision] = useState("");
  const [reason, setReason] = useState("");
  const target = related.find(({ id }) => id === targetId);
  const approved = target?.approvedRevisionId ?? approvedRevisionId;
  const transactionLink = transactions.find(({ id, kind }) => `${kind}:${id}` === transaction);
  const base = { revisionId, expectedApprovedRevisionId: approvedRevisionId };

  async function run(input: NewsReviewInput) {
    setPending(input.action);
    setError("");
    try {
      const result = await reviewNews(input);
      if ("error" in result) {
        setError(result.error ?? "Review could not be saved.");
      } else if (result.revisionId !== revisionId) {
        router.replace(`/admin/news-evidence/${result.revisionId}`);
      } else {
        router.refresh();
      }
    } catch {
      setError("Review could not be saved. Reload and try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <section className="surface space-y-4 p-4" aria-labelledby="news-review-actions">
      <h2 id="news-review-actions" className="type-row-title">Review decision</h2>
      {canApprove ? (
        <form className="space-y-3" onSubmit={(event) => {
          event.preventDefault();
          if (!confirmedEvidence) return;
          void run({
            ...base, action: "approve", evidenceReviewed: true,
            target: target ? { id: target.id, expectedApprovedRevisionId: target.approvedRevisionId } : undefined,
            correction: Boolean(approved && isCorrection),
            transactionLink: transactionLink ? { id: transactionLink.id, kind: transactionLink.kind }
              : transaction === "new" && !target?.hasThread ? { kind: "new" } : undefined,
            legacyItemId: legacyDecision && legacyDecision !== "distinct" ? legacyDecision : undefined,
            distinctFromLegacy: legacyDecision === "distinct",
          });
        }}>
          {related.length > 0 && !approvedRevisionId && (
            <label className="block space-y-1 type-meta">
              <span>Related development</span>
              <select className={inputClass} value={targetId} onChange={(event) => {
                setTargetId(event.target.value);
                setCorrection(false);
                setTransaction("");
                setLegacyDecision("");
              }}>
                <option value="">Keep as a separate development</option>
                {related.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
            </label>
          )}
          {approved && <label className="flex items-start gap-2 type-meta"><input type="checkbox" checked={isCorrection} onChange={(event) => setCorrection(event.target.checked)} /> This draft corrects the selected approved revision</label>}
          {(transactions.length > 0 || canCreateThread) && (
            <label className="block space-y-1 type-meta">
              <span>Transaction thread</span>
              <select className={inputClass} value={transaction} onChange={(event) => setTransaction(event.target.value)}>
                <option value="">Keep the current association</option>
                {canCreateThread && !target?.hasThread && <option value="new">Create a thread from the matched parties and date</option>}
                {transactions.map((option) => <option key={`${option.kind}:${option.id}`} value={`${option.kind}:${option.id}`}>{option.label}</option>)}
              </select>
            </label>
          )}
          {legacy.length > 0 && !linkedLegacy && !target?.hasLegacy && (
            <label className="block space-y-1 type-meta">
              <span>Public legacy items with the same source URL</span>
              <select required className={inputClass} value={legacyDecision} onChange={(event) => setLegacyDecision(event.target.value)}>
                <option value="">Select an item or confirm a separate story</option>
                <option value="distinct">This is a separate story</option>
                {legacy.map((option) => <option key={option.id} value={option.id}>Replace in feed · {option.label}</option>)}
              </select>
            </label>
          )}
          <label className="flex items-start gap-2 type-meta"><input type="checkbox" required checked={confirmedEvidence} onChange={(event) => setConfirmedEvidence(event.target.checked)} /> I verified the draft copy, evidence, and selected record links.</label>
          <Button type="submit" variant="primary" disabled={pending !== null} loading={pending === "approve"}>Approve and publish</Button>
        </form>
      ) : <p className="type-meta text-[var(--text-secondary)]">Publication is blocked by the source or evidence checks.</p>}

      <details className="border-t border-[var(--border)] pt-3">
        <summary className="cursor-pointer type-meta font-medium">Edit draft copy</summary>
        <form className="mt-3 space-y-3" onSubmit={(event) => {
          event.preventDefault();
          const fields = new FormData(event.currentTarget);
          void run({ ...base, action: "edit", title: String(fields.get("title") ?? ""), summary: String(fields.get("summary") ?? "") });
        }}>
          <label className="block space-y-1 type-meta"><span>Headline</span><input name="title" required maxLength={limits.title} defaultValue={title} className={inputClass} /></label>
          <label className="block space-y-1 type-meta"><span>Summary</span><textarea name="summary" required maxLength={limits.summary} rows={4} defaultValue={summary} className={inputClass} /></label>
          <Button type="submit" disabled={pending !== null} loading={pending === "edit"}>Save new draft revision</Button>
        </form>
      </details>

      <details className="border-t border-[var(--border)] pt-3">
        <summary className="cursor-pointer type-meta font-medium">Reject draft</summary>
        <form className="mt-3 space-y-3" onSubmit={(event) => { event.preventDefault(); void run({ ...base, action: "reject", reason }); }}>
          <label className="block space-y-1 type-meta"><span>Reason</span><textarea required rows={2} maxLength={400} value={reason} onChange={(event) => setReason(event.target.value)} className={inputClass} /></label>
          <Button type="submit" variant="danger" disabled={pending !== null} loading={pending === "reject"}>Reject draft</Button>
        </form>
      </details>
      {error && <p role="alert" className="type-meta text-[#b91c1c]">{error}</p>}
    </section>
  );
}

export function ApplyDealProposal({ revisionId }: { revisionId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function apply() {
    setPending(true);
    setMessage("");
    try {
      const result = await applyNewsDealLifecycle(revisionId);
      setMessage(result.ok ? "Deal lifecycle update applied." : result.error ?? "The deal update failed.");
      if (result.ok) router.refresh();
    } catch {
      setMessage("The deal update failed.");
    } finally {
      setPending(false);
    }
  }

  return <div className="mt-3 space-y-2"><Button loading={pending} onClick={apply}>Apply reviewed deal update</Button>{message && <p role="status" className="type-meta">{message}</p>}</div>;
}
