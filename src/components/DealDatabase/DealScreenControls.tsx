"use client";

import { useEffect, useId, useState } from "react";
import type { DealScreenKey } from "@/lib/deal-screen";
import { dealScreenParams } from "@/lib/deal-screen";
import type { BriefingReference, DealListView } from "@/modules/shared/types";

export const SECONDARY_DEAL_KEYS = ["from", "to", "status", "country", "subsector", "sponsor", "role"] as const;

export const DEAL_FILTER_LABELS = {
  from: "Announced from",
  to: "Announced through",
  status: "Status",
  country: "Country",
  subsector: "Subsector",
  sponsor: "Sponsor name",
  role: "Sponsor role",
  briefing: "Weekly briefing",
} as const;

type SecondaryKey = (typeof SECONDARY_DEAL_KEYS)[number];

const fieldClass = "min-w-0 w-full rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-2 text-sm text-[var(--text-primary)]";

export function DealScreenControls({ deals, briefings, params, onChange, includeBriefing = false }: {
  deals: DealListView[];
  briefings: BriefingReference[];
  params: URLSearchParams;
  onChange: (key: DealScreenKey, value: string) => void;
  includeBriefing?: boolean;
}) {
  const groupId = useId();
  const keys: (SecondaryKey | "briefing")[] = includeBriefing
    ? ["briefing", ...SECONDARY_DEAL_KEYS]
    : [...SECONDARY_DEAL_KEYS];
  const selectOptions = {
    status: [...new Set(deals.map((deal) => deal.status).filter(Boolean))].sort(),
    country: [...new Set(deals.map((deal) => deal.country).filter(Boolean))].sort(),
    subsector: [...new Set(deals.map((deal) => deal.subsector).filter(Boolean))].sort(),
    role: ["buyer", "seller"],
    briefing: briefings.map((issue) => issue.edition),
  };
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {keys.map((key) => {
        const id = `${groupId}-${key}`;
        const value = params.get(key) ?? "";
        const options = key === "from" || key === "to" || key === "sponsor" ? null : selectOptions[key];
        return (
          <div key={key} className="min-w-0 space-y-1">
            <label htmlFor={id} className="type-meta font-medium">{DEAL_FILTER_LABELS[key]}</label>
            {options ? (
              <select id={id} value={value} className={fieldClass}
                onChange={(event) => onChange(key, event.target.value)}>
                <option value="">{key === "briefing" ? "All deals" : key === "role" ? "Buyer or seller" : "Any"}</option>
                {value && !options.includes(value) && (
                  <option value={value}>{key === "briefing" ? `Unavailable issue: ${value}` : value}</option>
                )}
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option === "buyer" ? "Buyer" : option === "seller" ? "Seller" : option}
                  </option>
                ))}
              </select>
            ) : (
              <input id={id} value={value} type={key === "sponsor" ? "search" : "date"} className={fieldClass}
                onChange={(event) => onChange(key, event.target.value)} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const SCREEN_STORAGE_KEY = "infrasight:deal-screens:v1";
type SavedScreen = { name: string; query: string };

function loadScreens(): SavedScreen[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(SCREEN_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter((entry): entry is SavedScreen => (
      !!entry && typeof entry.name === "string" && typeof entry.query === "string"
    )).slice(0, 20);
  } catch {
    return [];
  }
}

export function DealSavedScreens({ params, onLoad }: {
  params: URLSearchParams;
  onLoad: (params: URLSearchParams) => void;
}) {
  const [screens, setScreens] = useState<SavedScreen[]>([]);
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");
  useEffect(() => { setScreens(loadScreens()); }, []);

  function store(next: SavedScreen[], message: string) {
    try {
      localStorage.setItem(SCREEN_STORAGE_KEY, JSON.stringify(next));
      setScreens(next);
      setFeedback(message);
    } catch {
      setFeedback("This browser could not save the screen.");
    }
  }

  return (
    <details className="text-sm">
      <summary className="cursor-pointer rounded-md px-2 py-1.5 type-meta font-medium hover:bg-[var(--bg-hover)]">
        Saved screens
      </summary>
      <div className="mt-2 max-w-sm space-y-2">
        <form className="flex flex-wrap items-center gap-2" onSubmit={(event) => {
          event.preventDefault();
          const trimmedName = name.trim();
          if (!trimmedName) return;
          const existing = loadScreens().filter((screen) => screen.name !== trimmedName);
          store([{ name: trimmedName, query: dealScreenParams(params).toString() }, ...existing].slice(0, 20), "Screen saved on this browser.");
          setName("");
        }}>
          <input value={name} maxLength={60} required aria-label="Name this screen"
            className={`${fieldClass} min-w-36 flex-1`} placeholder="Name this screen"
            onChange={(event) => setName(event.target.value)} />
          <button type="submit" className="rounded border border-[var(--border)] px-3 py-2 font-medium">
            Save current screen
          </button>
        </form>
        {screens.length > 0 && (
          <ul className="space-y-1" aria-label="Saved deal screens">
            {screens.map((screen) => (
              <li key={screen.name} className="flex items-center gap-3">
                <button type="button" className="min-w-0 flex-1 truncate py-1.5 text-left underline"
                  onClick={() => onLoad(dealScreenParams(new URLSearchParams(screen.query)))}>{screen.name}</button>
                <button type="button" className="py-1.5" aria-label={`Remove ${screen.name}`}
                  onClick={() => store(loadScreens().filter(({ name }) => name !== screen.name), "Screen removed.")}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <p role="status" className="type-meta">{feedback}</p>
      </div>
    </details>
  );
}
