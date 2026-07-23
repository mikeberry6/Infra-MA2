"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Download, FileUp, X } from "lucide-react";
import { withBasePath } from "@/lib/base-path";
import { Button } from "@/components/shared/Button";
import { FormMessage } from "@/components/shared/FormControls";
import {
  buildImportErrorCsv,
  importIssueLabel,
  type ImportEntityType,
  type ImportIssue,
  type ImportOwnershipChange,
} from "./import-preview";

type EntityType = ImportEntityType;
type Preview = {
  items: Record<string, unknown>[];
  previewToken: string;
  fileName: string;
  total: number;
  valid: number;
  creates: number;
  updates: number;
  unchanged: number;
  quarantined: number;
  warnings: ImportIssue[];
  errors: ImportIssue[];
  ownershipChanges: ImportOwnershipChange[];
};

type StatusMessage = { tone: "success" | "error"; text: string };

function clientParseCsv(csvText: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    if (quoted) {
      if (char === '"' && csvText[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && csvText[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  if (field || row.length) {
    row.push(field);
    if (row.some(Boolean)) rows.push(row);
  }
  if (rows.length < 2) return [];
  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

const LABELS: Record<EntityType, { singular: string; plural: string; bodyKey: string }> = {
  deals: { singular: "deal", plural: "deals", bodyKey: "deals" },
  funds: { singular: "fund", plural: "funds", bodyKey: "funds" },
  portfolio: { singular: "company", plural: "companies", bodyKey: "companies" },
};

export default function ImportExportBar({ entityType }: { entityType: EntityType }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<StatusMessage | null>(null);
  const [auditEventId, setAuditEventId] = useState<string | null>(null);
  const labels = LABELS[entityType];

  async function previewFile(file: File) {
    setLoading(true);
    setPreview(null);
    setMessage(null);
    setAuditEventId(null);
    try {
      const rows = clientParseCsv(await file.text());
      if (rows.length === 0) throw new Error("The CSV contains no data rows.");
      if (rows.length > 500) throw new Error("Imports are capped at 500 rows.");
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(withBasePath(`/api/imports/${entityType}?preview=1`), {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Preview failed");
      const warnings = Array.isArray(result.warnings) ? result.warnings : [];
      const errors = Array.isArray(result.errors) ? result.errors : [];
      const ownershipChanges = Array.isArray(result.ownershipChanges) ? result.ownershipChanges : [];
      if (typeof result.previewToken !== "string" || !Array.isArray(result.items)) {
        throw new Error("Preview confirmation could not be secured. Please preview the file again.");
      }
      setPreview({
        items: result.items,
        previewToken: result.previewToken,
        fileName: file.name,
        total: Number(result.total) || rows.length,
        valid: Number(result.valid) || 0,
        creates: Number(result.creates) || 0,
        updates: Number(result.updates) || 0,
        unchanged: Number(result.unchanged) || 0,
        quarantined: Number(result.quarantined) || 0,
        warnings,
        errors,
        ownershipChanges,
      });
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Preview failed",
      });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function commitImport() {
    if (!preview) return;
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(withBasePath(`/api/imports/${entityType}`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Import-Preview-Token": preview.previewToken,
        },
        body: JSON.stringify({ [labels.bodyKey]: preview.items }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Import failed");
      const imported = Number(result.imported) || 0;
      const unchanged = Number(result.unchanged) || 0;
      setMessage({
        tone: "success",
        text: imported > 0
          ? `${imported} ${imported === 1 ? labels.singular : labels.plural} committed as drafts.${unchanged > 0 ? ` ${unchanged} unchanged.` : ""}`
          : `No ${labels.plural} required changes.${unchanged > 0 ? ` ${unchanged} unchanged.` : ""}`,
      });
      setAuditEventId(result.auditEventId ?? null);
      setPreview(null);
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Import failed",
      });
    } finally {
      setLoading(false);
    }
  }

  function downloadErrors() {
    if (!preview?.errors.length) return;
    const csv = buildImportErrorCsv(preview.errors, entityType);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${entityType}-import-errors.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={withBasePath(`/api/exports/${entityType}`)}
          download
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 type-meta font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </a>
        <label className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-[var(--accent)] px-3 type-meta font-medium text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)] focus-within:ring-2 focus-within:ring-[var(--accent-soft)]">
          <FileUp className="h-3.5 w-3.5" /> Select CSV
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={(event) => event.target.files?.[0] && previewFile(event.target.files[0])} className="sr-only" />
        </label>
        {loading && <span role="status" className="type-micro animate-pulse">{preview ? "Importing…" : "Validating…"}</span>}
        {auditEventId && <Link href={withBasePath(`/admin/audit?focus=${encodeURIComponent(auditEventId)}`)} className="type-micro font-medium text-[var(--accent)]">View audit event</Link>}
      </div>

      {message && <FormMessage tone={message.tone}>{message.text}</FormMessage>}

      {preview && (
        <section className="surface max-w-3xl overflow-hidden" aria-label="Import preview" aria-live="polite">
          <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
            <div>
              <h3 className="type-row-title">Import preview</h3>
              <p className="type-micro">{preview.fileName} · no imported records have been changed</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPreview(null)}
              aria-label="Dismiss import preview"
              leadingIcon={<X className="h-4 w-4" />}
              className="shrink-0 px-1.5"
            />
          </div>
          <dl className="grid grid-cols-2 gap-px bg-[var(--border)] sm:grid-cols-3 lg:grid-cols-6">
            {[
              ["Rows", preview.total],
              ["Creates", preview.creates],
              ["Updates", preview.updates],
              ["Unchanged", preview.unchanged],
              ["Quarantined", preview.quarantined],
              ["Errors", preview.errors.length],
            ].map(([label, value]) => (
              <div key={String(label)} className="bg-[var(--bg-surface)] px-4 py-3"><dt className="type-micro">{label}</dt><dd className="mt-1 mono type-section-title tabular-nums">{value}</dd></div>
            ))}
          </dl>

          {(preview.warnings.length > 0 || preview.errors.length > 0 || preview.ownershipChanges.length > 0) && (
            <div className="space-y-3 border-t border-[var(--border)] px-4 py-3">
              {preview.ownershipChanges.length > 0 && (
                <section
                  aria-labelledby="ownership-change-heading"
                  className="rounded-md border border-blue-200 bg-blue-50 p-3 text-blue-950"
                >
                  <h4 id="ownership-change-heading" className="type-meta font-semibold">
                    Ownership changes ({preview.ownershipChanges.length})
                  </h4>
                  <p className="mt-1 type-micro text-blue-900">
                    These changes will be committed atomically with the company rows after confirmation.
                  </p>
                  <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto" aria-label="Ownership changes">
                    {preview.ownershipChanges.map((change, index) => (
                      <li key={`${change.row}-${change.name}-${index}`} className="border-t border-blue-200 pt-2 first:border-0 first:pt-0">
                        <p className="type-meta font-semibold">Row {change.row} · {change.name} · {change.action}</p>
                        <p className="type-micro text-blue-950">{change.message}</p>
                        <p className="mt-0.5 type-micro text-blue-900">
                          {change.from.length > 0 ? `From: ${change.from.join(" / ")}` : "From: no active ownership"}
                          {change.to ? ` · To: ${change.to}` : " · To: no active ownership"}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {preview.warnings.length > 0 && (
                <section
                  aria-labelledby="import-warning-heading"
                  className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-950"
                >
                  <h4 id="import-warning-heading" className="type-meta font-semibold">
                    Warnings and quarantined rows ({preview.warnings.length})
                  </h4>
                  <p className="mt-1 type-micro text-amber-900">
                    These rows require editorial review and will not be changed by this import.
                  </p>
                  <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto" aria-label="Import warnings">
                    {preview.warnings.map((warning, index) => (
                      <li key={`${warning.row ?? "unknown"}-${importIssueLabel(warning, entityType)}-${index}`} className="border-t border-amber-200 pt-2 first:border-0 first:pt-0">
                        <p className="type-meta font-semibold">{importIssueLabel(warning, entityType)}</p>
                        <p className="type-micro text-amber-950">{warning.error || "This row was quarantined."}</p>
                        {(warning.code || warning.existingStatus) && (
                          <p className="mt-0.5 type-micro text-amber-900">
                            {[warning.code, warning.existingStatus && `Existing status: ${warning.existingStatus}`].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {preview.errors.length > 0 && (
                <section
                  aria-labelledby="import-error-heading"
                  className="rounded-md border border-red-200 bg-red-50 p-3 text-red-950"
                >
                  <h4 id="import-error-heading" className="type-meta font-semibold">
                    Validation errors ({preview.errors.length})
                  </h4>
                  <p className="mt-1 type-micro text-red-900">
                    Correct these CSV rows and preview the file again. They will not be imported.
                  </p>
                  <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto" aria-label="Import validation errors">
                    {preview.errors.map((error, index) => (
                      <li key={`${error.row ?? "unknown"}-${importIssueLabel(error, entityType)}-${index}`} className="border-t border-red-200 pt-2 first:border-0 first:pt-0">
                        <p className="type-meta font-semibold">{importIssueLabel(error, entityType)}</p>
                        <p className="type-micro text-red-950">{error.error || "Validation error"}</p>
                        {error.code && <p className="mt-0.5 type-micro text-red-900">{error.code}</p>}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <p className="type-micro">
              Confirming will write {preview.creates} {preview.creates === 1 ? "create" : "creates"} and {preview.updates} {preview.updates === 1 ? "update" : "updates"}. {preview.unchanged} unchanged {preview.unchanged === 1 ? "row" : "rows"}, plus any errors and quarantined rows, will be skipped; imported records remain drafts.
            </p>
            <div className="flex items-center gap-2">
              {preview.errors.length > 0 && <Button size="sm" variant="secondary" onClick={downloadErrors}>Download error CSV</Button>}
              <Button size="sm" variant="primary" loading={loading} disabled={preview.creates + preview.updates === 0} onClick={commitImport}>Confirm import</Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
