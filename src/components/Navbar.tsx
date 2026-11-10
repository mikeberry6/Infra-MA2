"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, Search, User } from "lucide-react";
import { TextInput } from "@/components/shared/TextInput";
import { withBasePath } from "@/lib/base-path";

const databaseLinks = [
  { href: "/tracker", label: "Deals" },
  { href: "/funds", label: "Funds" },
  { href: "/portfolio", label: "PortCos" },
];
const monitorLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/news", label: "News" },
];
const researchLinks = [
  { href: "/weekly-briefing", label: "Weekly briefing" },
  { href: "/email-format/latest", label: "Weekly email" },
  { href: "/one-off-requests", label: "One-offs" },
  { href: "/compare", label: "Compare deals" },
  { href: "/earnings/archive/q4-2025", label: "Earnings archive" },
  { href: "/methodology", label: "Methodology" },
];

function matchesPath(pathname: string, href: string) {
  return (href === "/tracker" && (pathname === "/" || pathname.startsWith("/deals/"))) || pathname === href || pathname.startsWith(`${href}/`);
}

const signalCells = [
  "bg-[var(--accent)]",
  "bg-[var(--gray-200)]",
  "bg-[var(--gray-200)]",
  "bg-[var(--gray-200)]",
  "bg-[var(--accent)] opacity-75",
  "bg-[var(--gray-200)]",
  "bg-[var(--gray-200)]",
  "bg-[var(--gray-200)]",
  "bg-[var(--accent)] opacity-40",
];

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/tracker" className={`inline-flex items-center gap-2.5 group ${className}`}>
      <span
        aria-hidden
        className="grid h-6 w-6 grid-cols-3 gap-[2px] rounded-md border border-[var(--border)] bg-[var(--bg-app)] p-[3px] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition-colors group-hover:border-[var(--border-strong)]"
      >
        {signalCells.map((cell, index) => (
          <span key={index} className={`rounded-[1.5px] ${cell}`} />
        ))}
      </span>
      <span className="type-row-title font-semibold transition-colors group-hover:text-[var(--accent)]">
        InfraSight
      </span>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const research = useRef<HTMLDetailsElement>(null);
  const navLinkClass = "inline-flex min-h-9 items-center rounded-md px-2.5 type-meta font-medium transition-colors";

  useEffect(() => {
    function dismissResearch(event: PointerEvent) {
      if (research.current?.open && event.target instanceof Node && !research.current.contains(event.target)) {
        research.current.open = false;
      }
    }

    document.addEventListener("pointerdown", dismissResearch);
    return () => document.removeEventListener("pointerdown", dismissResearch);
  }, []);

  function navLink(link: (typeof databaseLinks)[number], mobile = false) {
    const active = matchesPath(pathname, link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        prefetch={false}
        aria-current={active ? "page" : undefined}
        onClick={() => {
          if (mobile) setMenuOpen(false);
          if (research.current) research.current.open = false;
        }}
        className={`${navLinkClass} ${mobile ? "w-full min-h-11" : ""} ${active
          ? "bg-[var(--accent-soft)] text-[var(--accent-hover)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"}`}
      >
        {link.label}
      </Link>
    );
  }

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-surface)]/95 backdrop-blur-md" aria-label="Primary">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-6">
        <Wordmark className="shrink-0" />

        <div className="hidden items-center gap-2 lg:flex">
          <div role="group" aria-label="Databases" className="flex items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--bg-app)] p-0.5">
            {databaseLinks.map((link) => navLink(link))}
          </div>
          <div className="flex items-center gap-0.5">
            {monitorLinks.map((link) => navLink(link))}
            <details
              ref={research}
              className="group relative"
              onKeyDown={(event) => {
                if (event.key === "Escape" && event.currentTarget.open) {
                  event.currentTarget.open = false;
                  event.currentTarget.querySelector("summary")?.focus();
                }
              }}
            >
              <summary className={`${navLinkClass} cursor-pointer list-none gap-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] [&::-webkit-details-marker]:hidden`}>
                Research
                <ChevronDown aria-hidden className="h-3.5 w-3.5 group-open:rotate-180" />
              </summary>
              <div className="surface-overlay absolute right-0 mt-1 min-w-44 rounded-lg p-1">
                {researchLinks.map((link) => navLink(link, true))}
              </div>
            </details>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <form method="get" action={withBasePath("/search")} className="w-44 xl:w-60" role="search">
            <TextInput type="search" name="q" leadingIcon={<Search />} placeholder="Search InfraSight" aria-label="Search InfraSight" />
          </form>
          <Link href="/login" aria-label="Account" className="inline-grid size-9 place-items-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">
            <User aria-hidden className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <Link href="/search" onClick={() => setMenuOpen(false)} aria-label="Search InfraSight" className="inline-grid size-11 place-items-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">
            <Search aria-hidden className="h-4 w-4" />
          </Link>
          <button
            ref={mobileTrigger}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-grid size-11 place-items-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-primary-links"
          >
            {menuOpen ? <X aria-hidden className="h-4 w-4" /> : <Menu aria-hidden className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-primary-links"
        hidden={!menuOpen}
        className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 lg:hidden"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setMenuOpen(false);
            mobileTrigger.current?.focus();
          }
        }}
      >
        <div className="mb-2 flex flex-wrap items-center gap-1">
          {databaseLinks.map((link) => (
            <div key={link.href}>{navLink(link, true)}</div>
          ))}
        </div>
        <div className="border-t border-[var(--border)] pt-2">
          {monitorLinks.map((link) => navLink(link, true))}
          <div className="mt-2 px-2.5 type-label">Research</div>
          {researchLinks.map((link) => navLink(link, true))}
          {navLink({ href: "/login", label: "Account" }, true)}
        </div>
      </div>
    </nav>
  );
}
