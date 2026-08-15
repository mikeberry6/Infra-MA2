"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, FileUp } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/shared/Button";
import { withBasePath } from "@/lib/base-path";
import {
  buildImportReportCsv,
  parseImportPreview,
  type ImportDisposition,
  type ImportPreviewResult,
} from "./import-preview";

type EntityType = "deals" | "funds" | "portfolio";
type Operation = "preview" | "commit" | null;
type Message = { tone: "success" | "error" | "neutral"; text: string };

interface ImportExportBarProps {
  entityType: EntityType;
}

interface CommitResult {
  imported: number;
  created: number;
  updated: number;
  unchanged: number;
  quarantined: number;
  auditEventId: string;
  idempotent?: boolean;
}

const ENTITY_LABELS: Record<
  EntityType,
  { singular: string; plural: string }
> = {
  deals: { singular: "deal", plural: "deals" },
  funds: { singular: "fund", plural: "funds" },
  portfolio: { singular: "PortCo", plural: "PortCos" },
};

const DISPOSITION_STYLES: Record<ImportDisposition, string> = {
  create: "border-emerald-200 bg-emerald-50 text-emerald-800",
  update: "border-blue-200 bg-blue-50 text-blue-800",
  unchanged: "border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]",
  quarantined: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-red-200 bg-red-50 text-red-800",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function parseCommitResult(value: unknown): CommitResult | null {
  if (
    !isRecord(value) ||
    typeof value.auditEventId !== "string" ||
    value.auditEventId.length === 0 ||
    !isCount(value.imported) ||
    !isCount(value.created) ||
    !isCount(value.updated) ||
    !isCount(value.unchanged) ||
    !isCount(value.quarantined)
  ) {
    return null;
  }

  return {
    imported: value.imported,
    created: value.created,
    updated: value.updated,
    unchanged: value.unchanged,
    quarantined: value.quarantined,
    auditEventId: value.auditEventId,
    ...(typeof value.idempotent === "boolean"
      ? { idempotent: value.idempotent }
      : {}),
  };
}

async function readResponseBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function responseError(
  body: unknown,
  fallback: string,
): string {
  return isRecord(body) && typeof body.error === "string"
    ? body.error
    : fallback;
}

function formatPreviewExpiry(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ImportExportBar({
  entityType,
}: ImportExportBarProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();
  const helperId = `${fileInputId}-helper`;
  const [operation, setOperation] = useState<Operation>(null);
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState<Message | null>(null);
  const [commitResult, setCommitResult] = useState<CommitResult | null>(null);
  const labels = ENTITY_LABELS[entityType];

  const endpoint = withBasePath(`/api/imports/${entityType}`);

  async function previewFile(file: File) {
    setOperation("preview");
    setPreview(null);
    setFileName(file.name);
    setMessage(null);
    setCommitResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      const body = await readResponseBody(response);

      if (!response.ok) {
        throw new Error(responseError(body, "The import preview could not be created."));
      }

      const result = parseImportPreview(body);
      if (!result) {
        throw new Error(
          "The server returned an invalid preview. Select the file again before confirming.",
        );
      }

      setPreview(result);
    } catch (error) {
      setFileName("");
      setMessage({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "The import preview could not be created.",
      });
    } finally {
      setOperation(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function confirmImport() {
    if (!preview || operation) return;
    setOperation("commit");
    setMessage(null);

    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: preview.token }),
      });
      const body = await readResponseBody(response);

      if (!response.ok) {
        throw new Error(responseError(body, "The import could not be committed."));
      }

      const result = parseCommitResult(body);
      if (!result) {
        throw new Error(
          "The import completed without a valid receipt. Review the audit log before retrying.",
        );
      }

      setCommitResult(result);
      setPreview(null);
      setFileName("");
      setMessage({
        tone: "success",
        text: result.idempotent
          ? "This preview was already committed. No duplicate changes were made."
          : `${result.imported} ${
              result.imported === 1 ? labels.singular : labels.plural
            } imported successfully.`,
      });
      router.refresh();
    } catch (error) {
      setMessage({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "The import could not be committed.",
      });
    } finally {
      setOperation(null);
    }
  }

  function cancelPreview() {
    setPreview(null);
    setFileName("");
    setCommitResult(null);
    setMessage({
      tone: "neutral",
      text: "Preview cancelled. No records were changed.",
    });
  }

  function downloadReport() {
    if (!preview) return;

    const csv = buildImportReportCsv(preview.report);
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${entityType}-import-preview-report.csv`;
    anchor.hidden = true;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  const previewBusy = operation === "preview";
  const commitBusy = operation === "commit";
  const canCommit = Boolean(preview && preview.summary.eligible > 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={withBasePath(`/api/exports/${entityType}`)}
          download
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 type-meta font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          Export CSV
        </a>

        <Button
          variant="primary"
          size="md"
          leadingIcon={<FileUp className="h-3.5 w-3.5" aria-hidden />}
          loading={previewBusy}
          disabled={Boolean(operation)}
          onClick={() => fileInputRef.current?.click()}
        >
          {previewBusy ? "Validating…" : "Select CSV"}
        </Button>
        <input
          ref={fileInputRef}
          id={fileInputId}
          type="file"
          accept=".csv,text/csv"
          aria-label={`Select ${labels.plural} CSV file`}
          aria-describedby={helperId}
          className="sr-only"
          disabled={Boolean(operation)}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void previewFile(file);
          }}
        />

        <span id={helperId} className="type-micro text-[var(--text-tertiary)]">
          Preview first · maximum 500 rows
        </span>
      </div>

      {operation && (
        <p role="status" className="type-meta text-[var(--text-secondary)]">
          {previewBusy
            ? `Validating ${labels.plural}; no records are being changed…`
            : `Committing ${labels.plural} in one transaction…`}
        </p>
      )}

      {message && (
        <div
          role={message.tone === "error" ? "alert" : "status"}
          className={`rounded-md border px-3 py-2 type-meta ${
            message.tone === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : message.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
          }`}
        >
          {message.text}
          {commitResult && (
            <span className="ml-1">
              Created {commitResult.created}, updated {commitResult.updated},
              unchanged {commitResult.unchanged}, quarantined{" "}
              {commitResult.quarantined}.{" "}
              <Link
                href={withBasePath(
                  `/admin/audit/${encodeURIComponent(commitResult.auditEventId)}`,
                )}
                className="font-semibold underline decoration-current underline-offset-2"
              >
                View audit event
              </Link>
            </span>
          )}
        </div>
      )}

      {preview && (
        <section
          role="region"
          aria-label="Import preview"
          aria-live="polite"
          className="surface max-w-5xl overflow-hidden"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
            <div>
              <h2 className="type-row-title">Import preview</h2>
              <p className="mt-0.5 type-micro text-[var(--text-secondary)]">
                <span className="font-medium text-[var(--text-primary)]">
                  {fileName}
                </span>{" "}
                · No records have been changed
              </p>
            </div>
            <p className="type-micro text-[var(--text-tertiary)]">
              Expires{" "}
              <time dateTime={preview.expiresAt}>
                {formatPreviewExpiry(preview.expiresAt)}
              </time>
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-px bg-[var(--border)] sm:grid-cols-4 lg:grid-cols-8">
            {[
              ["Rows", preview.summary.total],
              ["Valid", preview.summary.valid],
              ["Eligible", preview.summary.eligible],
              ["Creates", preview.summary.creates],
              ["Updates", preview.summary.updates],
              ["Unchanged", preview.summary.unchanged],
              ["Quarantined", preview.summary.quarantined],
              ["Errors", preview.summary.errors],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="bg-[var(--bg-surface)] px-3 py-2.5"
              >
                <dt className="type-label">{label}</dt>
                <dd className="mt-1 mono text-sm font-semibold tabular-nums text-[var(--text-primary)]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {preview.report.length > 0 && (
            <div className="border-t border-[var(--border)] px-4 py-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="type-row-title">Row-level report</h3>
                  <p className="type-micro text-[var(--text-secondary)]">
                    Review every disposition before committing.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={downloadReport}
                  leadingIcon={<Download className="h-3.5 w-3.5" aria-hidden />}
                >
                  Download report CSV
                </Button>
              </div>

              <div className="max-h-64 overflow-auto rounded-md border border-[var(--border)]">
                <table className="w-full min-w-[620px] border-collapse text-left">
                  <thead className="sticky top-0 bg-[var(--bg-app)]">
                    <tr className="border-b border-[var(--border)]">
                      <th className="px-3 py-2 type-label">Row</th>
                      <th className="px-3 py-2 type-label">Identifier</th>
                      <th className="px-3 py-2 type-label">Disposition</th>
                      <th className="px-3 py-2 type-label">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.report.map((item, index) => (
                      <tr
                        key={`${item.row}-${item.identifier}-${index}`}
                        className="border-b border-[var(--border)] last:border-0"
                      >
                        <td className="px-3 py-2 mono type-micro tabular-nums">
                          {item.row}
                        </td>
                        <td className="max-w-64 break-words px-3 py-2 type-meta text-[var(--text-primary)]">
                          {item.identifier || "—"}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex rounded border px-1.5 py-0.5 type-micro font-medium capitalize ${DISPOSITION_STYLES[item.disposition]}`}
                          >
                            {item.disposition}
                          </span>
                        </td>
                        <td className="max-w-96 break-words px-3 py-2 type-micro text-[var(--text-secondary)]">
                          {[item.code, item.message].filter(Boolean).join(" · ") ||
                            "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-3">
            <p className="max-w-2xl type-micro text-[var(--text-secondary)]">
              Confirming applies {preview.summary.creates} creates and{" "}
              {preview.summary.updates} updates in one transaction. Unchanged,
              quarantined, and invalid rows are not written.
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={Boolean(operation)}
                onClick={cancelPreview}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                loading={commitBusy}
                disabled={!canCommit || Boolean(operation)}
                onClick={() => void confirmImport()}
              >
                Confirm import
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
