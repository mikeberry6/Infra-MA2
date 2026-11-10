"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { withBasePath, withoutBasePath } from "@/lib/base-path";
import {
  RESEARCH_EVENTS, RESEARCH_PAGES, RESEARCH_VITALS,
  type ResearchEvent, type ResearchPage, type ResearchVital,
} from "@/lib/research-metrics";

function getPage(path: string | null): ResearchPage | null {
  const [section, id] = withoutBasePath(path ?? "").split("/").filter(Boolean);
  if (id) {
    if (section === "deals") return "deal-profile";
    if (section === "funds") return "fund-profile";
    if (section === "portfolio") return "company-profile";
    if (section === "sponsors") return "sponsor-profile";
    return null;
  }
  return RESEARCH_PAGES.find((page) => page === section) ?? null;
}

export function ResearchMetrics() {
  const page = getPage(usePathname());
  const initialPage = useRef(page);
  const counts = useRef<Partial<Record<ResearchEvent, number>>>({});
  const vitals = useRef<Partial<Record<ResearchVital, number>>>({});
  const enabled = () => navigator.doNotTrack !== "1"
    && !(navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;

  const reportVital = useCallback((metric: { name: string; value: number }) => {
    const key = RESEARCH_VITALS.find((name) => name === metric.name);
    if (initialPage.current && key && enabled()) {
      vitals.current[key] = Math.round(metric.value * 1_000) / 1_000;
    }
  }, []);
  useReportWebVitals(reportVital);

  useEffect(() => {
    if (!page || !enabled()) return;

    function bump(event: ResearchEvent) {
      counts.current[event] = Math.min((counts.current[event] ?? 0) + 1, 250);
    }

    function submit(data: object) {
      const body = JSON.stringify({
        viewport: window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop",
        ...data,
      });
      const endpoint = withBasePath("/api/research-metrics");
      if (!navigator.sendBeacon?.(endpoint, new Blob([body], { type: "application/json" }))) {
        void fetch(endpoint, { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
      }
    }

    function flush() {
      if (Object.keys(counts.current).length) submit({ page, counts: counts.current });
      if (initialPage.current && Object.keys(vitals.current).length) {
        submit({ page: initialPage.current, vitals: vitals.current });
      }
      counts.current = {};
      vitals.current = {};
    }

    const observedEmpty = new WeakSet<Element>();
    const markSearchEmpty = () => {
      const empty = document.querySelector('[data-research-empty="search"]');
      if (!empty || observedEmpty.has(empty)) return;
      observedEmpty.add(empty);
      bump("search_empty");
    };

    function handleClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const marker = event.target.closest<HTMLElement>("[data-research-event]")?.dataset.researchEvent;
      const name = RESEARCH_EVENTS.find((candidate) => candidate === marker);
      if (!name) return;
      bump(name);
      if (name === "search_success") bump("record_open");
    }

    if (page === "tracker" && new URLSearchParams(window.location.search).get("via") === "briefing") {
      bump("briefing_click");
    }
    const observer = page === "search" ? new MutationObserver(markSearchEmpty) : null;
    if (observer) {
      markSearchEmpty();
      const main = document.querySelector("main");
      if (main) observer.observe(main, { childList: true, subtree: true });
    }

    const onVisibility = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("click", handleClick);
    document.addEventListener("auxclick", handleClick);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    const timer = window.setInterval(flush, 10_000);

    return () => {
      observer?.disconnect();
      document.removeEventListener("click", handleClick);
      document.removeEventListener("auxclick", handleClick);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      window.clearInterval(timer);
      flush();
    };
  }, [page]);

  return null;
}
