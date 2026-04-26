"use client";

import { useRef, useState } from "react";

type EntityType = "deals" | "funds" | "portfolio";

interface ImportExportBarProps {
  entityType: EntityType;
}

interface ImportStatus {
  state: "idle" | "loading" | "done";
  imported?: number;
  errors?: number;
  message?: string;
}

/**
 * Client-side CSV parser for import preview.
 * Parses CSV text into array of objects using header row as keys.
 */
function clientParseCsv(csvText: string): Record<string, string>[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;
  let i = 0;

  while (i < csvText.length) {
    const char = csvText[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < csvText.length && csvText[i + 1] === '"') {
          currentField += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        currentField += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === ",") {
        currentRow.push(currentField);
        currentField = "";
        i++;
      } else if (char === "\r") {
        currentRow.push(currentField);
        currentField = "";
        rows.push(currentRow);
        currentRow = [];
        i++;
        if (i < csvText.length && csvText[i] === "\n") i++;
      } else if (char === "\n") {
        currentRow.push(currentField);
        currentField = "";
        rows.push(currentRow);
        currentRow = [];
        i++;
      } else {
        currentField += char;
        i++;
      }
    }
  }

  if (currentField !== "" || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  if (rows.length < 2) return [];

  const headers = rows[0];
  const results: Record<string, string>[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 1 && row[0] === "") continue;
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = j < row.length ? row[j] : "";
    }
    results.push(obj);
  }
  return results;
}

/** Convert a flat CSV row into the JSON shape expected by the import API. */
function csvRowToImportShape(row: Record<string, string>, entityType: EntityType): Record<string, unknown> {
  if (entityType === "deals") {
    return {
      ...row,
      id: row.legacyId || row.id,
      category: row.category ? row.category.split(";").map((s) => s.trim()).filter(Boolean) : [],
      keyHighlights: row.keyHighlights ? row.keyHighlights.split(";").map((s) => s.trim()).filter(Boolean) : [],
    };
  }

  if (entityType === "funds") {
    return {
      ...row,
      id: row.legacyId || row.id,
      strategies: row.strategies ? row.strategies.split(";").map((s) => s.trim()).filter(Boolean) : [],
      sectors: row.sectors ? row.sectors.split(";").map((s) => s.trim()).filter(Boolean) : [],
      regions: row.regions ? row.regions.split(";").map((s) => s.trim()).filter(Boolean) : [],
      sourceUrls: row.sourceUrls ? row.sourceUrls.split(";").map((s) => s.trim()).filter(Boolean) : [],
      sizeUsdMm: row.sizeUsdMm ? Number(row.sizeUsdMm) : null,
    };
  }

  // portfolio
  return {
    ...row,
    countryTags: row.countryTags ? row.countryTags.split(";").map((s) => s.trim()).filter(Boolean) : [],
    yearFounded: row.yearFounded ? Number(row.yearFounded) : undefined,
    investmentYear: row.investmentYear ? Number(row.investmentYear) : undefined,
  };
}

const ENTITY_LABELS: Record<EntityType, { singular: string; plural: string; bodyKey: string }> = {
  deals: { singular: "deal", plural: "deals", bodyKey: "deals" },
  funds: { singular: "fund", plural: "funds", bodyKey: "funds" },
  portfolio: { singular: "company", plural: "companies", bodyKey: "companies" },
};

export default function ImportExportBar({ entityType }: ImportExportBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>({ state: "idle" });
  const labels = ENTITY_LABELS[entityType];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ state: "loading" });

    try {
      const csvText = await file.text();
      const rows = clientParseCsv(csvText);

      if (rows.length === 0) {
        setImportStatus({ state: "done", imported: 0, errors: 0, message: "CSV file is empty or has no data rows" });
        return;
      }

      // Convert CSV rows to the JSON shape expected by the API
      const items = rows.map((row) => csvRowToImportShape(row, entityType));

      const response = await fetch(`/api/imports/${entityType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [labels.bodyKey]: items }),
      });

      const result = await response.json();

      if (!response.ok) {
        setImportStatus({
          state: "done",
          imported: 0,
          errors: rows.length,
          message: result.error || "Import failed",
        });
      } else {
        setImportStatus({
          state: "done",
          imported: result.imported || 0,
          errors: result.errors?.length || 0,
          message: undefined,
        });
      }
    } catch (err: any) {
      setImportStatus({
        state: "done",
        imported: 0,
        errors: 1,
        message: err.message || "Import failed",
      });
    }

    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Export CSV */}
      <a
        href={`/api/exports/${entityType}`}
        download
        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-[#27272A] hover:bg-[#3f3f46] text-[#1a1a1a] transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
        </svg>
        Export CSV
      </a>

      {/* Import CSV */}
      <label className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-[#27272A] hover:bg-[#3f3f46] text-[#1a1a1a] transition-colors cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M17 8l-5-5m0 0L7 8m5-5v12" />
        </svg>
        Import CSV
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* Status indicator */}
      {importStatus.state === "loading" && (
        <span className="text-xs text-[#A1A1AA] animate-pulse">
          Importing {labels.plural}...
        </span>
      )}

      {importStatus.state === "done" && (
        <span className="text-xs flex items-center gap-2">
          {importStatus.imported !== undefined && importStatus.imported > 0 && (
            <span className="text-emerald-400">
              {importStatus.imported} {importStatus.imported === 1 ? labels.singular : labels.plural} imported
            </span>
          )}
          {importStatus.errors !== undefined && importStatus.errors > 0 && (
            <span className="text-red-400">
              {importStatus.errors} {importStatus.errors === 1 ? "error" : "errors"}
            </span>
          )}
          {importStatus.message && (
            <span className="text-red-400">{importStatus.message}</span>
          )}
          <button
            onClick={() => setImportStatus({ state: "idle" })}
            className="text-[#71717A] hover:text-[#1a1a1a] ml-1"
            title="Dismiss"
          >
            &times;
          </button>
        </span>
      )}
    </div>
  );
}
