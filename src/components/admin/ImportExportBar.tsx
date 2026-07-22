"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Download, FileUp, X } from "lucide-react";
import { withBasePath } from "@/lib/base-path";
import { Button } from "@/components/shared/Button";

type EntityType = "deals" | "funds" | "portfolio";
type ImportError = { id?: string; fundName?: string; name?: string; error?: string };
type Preview = {
  items: Record<string, unknown>[];
  fileName: string;
  total: number;
  valid: number;
  creates: number;
  updates: number;
  warnings: string[];
  errors: ImportError[];
};

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

function csvRowToImportShape(row: Record<string, string>, entityType: EntityType): Record<string, unknown> {
  const list = (value: string) => value ? value.split(";").map((item) => item.trim()).filter(Boolean) : [];
  if (entityType === "deals") {
    return { ...row, id: row.legacyId || row.id, category: list(row.category), keyHighlights: list(row.keyHighlights) };
  }
  if (entityType === "funds") {
    return { ...row, id: row.legacyId || row.id, strategies: list(row.strategies), sectors: list(row.sectors), regions: list(row.regions), sourceUrls: list(row.sourceUrls), sizeUsdMm: row.sizeUsdMm ? Number(row.sizeUsdMm) : null };
  }
  return { ...row, countryTags: list(row.countryTags), yearFounded: row.yearFounded ? Number(row.yearFounded) : undefined, investmentYear: row.investmentYear ? Number(row.investmentYear) : undefined };
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
  const [message, setMessage] = useState<string | null>(null);
  const [auditEventId, setAuditEventId] = useState<string | null>(null);
  const labels = LABELS[entityType];

  async function previewFile(file: File) {
    setLoading(true);
    setMessage(null);
    setAuditEventId(null);
    try {
      const rows = clientParseCsv(await file.text());
      if (rows.length === 0) throw new Error("The CSV contains no data rows.");
      if (rows.length > 500) throw new Error("Imports are capped at 500 rows.");
      const items = rows.map((row) => csvRowToImportShape(row, entityType));
      const response = await fetch(withBasePath(`/api/imports/${entityType}?preview=1`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [labels.bodyKey]: items }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Preview failed");
      setPreview({ ...result, items, fileName: file.name });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Preview failed");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [labels.bodyKey]: preview.items }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Import failed");
      setMessage(`${result.imported ?? 0} ${result.imported === 1 ? labels.singular : labels.plural} committed as drafts.`);
      setAuditEventId(result.auditEventId ?? null);
      setPreview(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  function downloadErrors() {
    if (!preview?.errors.length) return;
    const csv = ["row,error", ...preview.errors.map((error, index) => `${index + 1},${JSON.stringify(error.error ?? "Validation error")}`)].join("\n");
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
        <a href={withBasePath(`/api/exports/${entityType}`)} download className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 type-meta font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </a>
        <label className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-[var(--accent)] px-3 type-meta font-medium text-[var(--text-on-accent)] hover:bg-[var(--accent-hover)] focus-within:ring-2 focus-within:ring-[var(--accent-soft)]">
          <FileUp className="h-3.5 w-3.5" /> Select CSV
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={(event) => event.target.files?.[0] && previewFile(event.target.files[0])} className="sr-only" />
        </label>
        {loading && <span className="type-micro animate-pulse">Validating…</span>}
        {message && <span className="type-micro text-[var(--text-secondary)]">{message}</span>}
        {auditEventId && <Link href={`/admin/audit?focus=${encodeURIComponent(auditEventId)}`} className="type-micro font-medium text-[var(--accent)]">View audit event</Link>}
      </div>

      {preview && (
        <section className="surface max-w-2xl overflow-hidden" aria-label="Import preview">
          <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
            <div>
              <h3 className="type-row-title">Import preview</h3>
              <p className="type-micro">{preview.fileName} · no database changes have been made</p>
            </div>
            <button type="button" onClick={() => setPreview(null)} aria-label="Dismiss import preview" className="rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"><X className="h-4 w-4" /></button>
          </div>
          <dl className="grid grid-cols-2 gap-px bg-[var(--border)] sm:grid-cols-4">
            {[["Rows", preview.total], ["Creates", preview.creates], ["Updates", preview.updates], ["Errors", preview.errors.length]].map(([label, value]) => (
              <div key={String(label)} className="bg-[var(--bg-surface)] px-4 py-3"><dt className="type-micro">{label}</dt><dd className="mt-1 mono type-section-title tabular-nums">{value}</dd></div>
            ))}
          </dl>
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <p className="type-micro">Only valid rows will be committed. Imported records remain drafts.</p>
            <div className="flex items-center gap-2">
              {preview.errors.length > 0 && <Button size="sm" variant="ghost" onClick={downloadErrors}>Download errors</Button>}
              <Button size="sm" variant="primary" loading={loading} disabled={preview.valid === 0} onClick={commitImport}>Confirm import</Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
