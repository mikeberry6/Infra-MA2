"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, Search, User } from "lucide-react";
import { TextInput } from "@/components/shared/TextInput";
import { SessionProvider, useSession } from "next-auth/react";

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
  { href: "/one-off-requests", label: "Custom requests" },
  { href: "/compare", label: "Compare deals" },
  { href: "/earnings/latest", label: "Earnings" },
  { href: "/methodology", label: "Methodology" },
];

function matchesPath(pathname: string, href: string) {
  if (href === "/tracker" && (pathname === "/" || pathname.startsWith("/deals/"))) return true;
  const section = href === "/earnings/latest" ? "/earnings" : href;
  return pathname === section || pathname.startsWith(`${section}/`);
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

function Wordmark({ onNavigate }: { onNavigate: () => void }) {
  return (
    <Link href="/tracker" onClick={onNavigate} className="group inline-flex shrink-0 items-center gap-2.5">
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

const navLinkBase = "inline-flex items-center rounded-md px-2.5 type-meta font-medium transition-colors";
const navLinkSizes = {
  compact: "min-h-9",
  touch: "min-h-11 w-full",
  segment: "min-h-11 w-full justify-center text-center",
};
const idleColors = "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]";

function AccountControl({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate: () => void }) {
  const { data } = useSession();
  const user = data?.user;
  const identity = user?.name || user?.email || "Account";
  const classes = `${navLinkBase} ${mobile ? navLinkSizes.touch : navLinkSizes.compact} gap-1.5`;

  if (user && user.role !== "ADMIN") {
    return (
      <span className={classes} title={identity}>
        <User aria-hidden className="h-4 w-4 shrink-0" />
        <span className="sr-only">Signed in as </span>
        <span className="max-w-36 truncate">{identity}</span>
      </span>
    );
  }

  return (
    <Link
      href={user ? "/admin" : "/login"}
      prefetch={false}
      onClick={onNavigate}
      title={user ? `Signed in as ${identity}` : "Sign in for analyst exports or data administration"}
      aria-label={user ? `Account for ${identity}` : undefined}
      className={`${classes} ${mobile ? "" : "border border-[var(--border)]"} ${idleColors}`}
    >
      <User aria-hidden className="h-4 w-4 shrink-0" />
      {user ? "Account" : "Sign in"}
    </Link>
  );
}

export function Navbar() {
  return (
    <SessionProvider basePath="/api/auth">
      <PrimaryNavigation />
    </SessionProvider>
  );
}

function PrimaryNavigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useRef<HTMLElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const research = useRef<HTMLDetailsElement>(null);
  const researchTrigger = useRef<HTMLElement>(null);

  function closeMenus() {
    if (research.current) research.current.open = false;
    setMenuOpen(false);
  }

  useEffect(() => {
    closeMenus();
  }, [pathname]);

  useEffect(() => {
    function dismissOutside(event: Event) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (research.current?.open && !research.current.contains(target)) research.current.open = false;
      if (menuOpen && !navigation.current?.contains(target)) setMenuOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (research.current?.open) {
        research.current.open = false;
        researchTrigger.current?.focus();
      } else if (menuOpen) {
        setMenuOpen(false);
        mobileTrigger.current?.focus();
      }
    }

    const desktop = window.matchMedia?.("(min-width: 1024px)");
    desktop?.addEventListener("change", closeMenus);
    document.addEventListener("focusin", dismissOutside);
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      desktop?.removeEventListener("change", closeMenus);
      document.removeEventListener("focusin", dismissOutside);
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  function navLink(link: (typeof databaseLinks)[number], size: keyof typeof navLinkSizes = "compact") {
    const active = matchesPath(pathname, link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        prefetch={false}
        aria-current={active ? "page" : undefined}
        onClick={closeMenus}
        className={`${navLinkBase} ${navLinkSizes[size]} ${active ? "bg-[var(--accent-soft)] text-[var(--accent-hover)]" : idleColors}`}
      >
        {link.label}
      </Link>
    );
  }

  return (
    <nav ref={navigation} className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-surface)]/95 backdrop-blur-md" aria-label="Primary">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-6">
        <Wordmark onNavigate={closeMenus} />

        <div className="hidden items-center gap-2 lg:flex">
          <div role="group" aria-label="Databases" className="flex items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--bg-app)] p-0.5">
            {databaseLinks.map((link) => navLink(link))}
          </div>
          <div className="flex items-center gap-0.5">
            {monitorLinks.map((link) => navLink(link))}
            <details ref={research} className="group relative">
              <summary
                ref={researchTrigger}
                tabIndex={0}
                aria-controls="desktop-research-links"
                className={`${navLinkBase} ${navLinkSizes.compact} ${idleColors} cursor-pointer list-none gap-1.5 [&::-webkit-details-marker]:hidden`}
              >
                Research
                <ChevronDown aria-hidden className="h-3.5 w-3.5 motion-safe:transition-transform group-open:rotate-180" />
              </summary>
              <div id="desktop-research-links" className="surface-overlay absolute right-0 mt-1 min-w-44 rounded-lg p-1">
                {researchLinks.map((link) => navLink(link, "touch"))}
              </div>
            </details>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <form method="get" action="/search" className="w-44 xl:w-60" role="search">
            <TextInput type="search" name="q" leadingIcon={<Search />} placeholder="Search InfraSight" aria-label="Search InfraSight" />
          </form>
          <AccountControl onNavigate={closeMenus} />
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <Link href="/search" onClick={closeMenus} aria-label="Search InfraSight" className="inline-grid size-11 place-items-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">
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
      >
        <div
          role="group"
          aria-label="Databases"
          className="mb-2 grid grid-cols-3 gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--bg-app)] p-0.5"
        >
          {databaseLinks.map((link) => navLink(link, "segment"))}
        </div>
        <div className="border-t border-[var(--border)] pt-2">
          {monitorLinks.map((link) => navLink(link, "touch"))}
          <div className="mt-2 px-2.5 type-label">Research</div>
          {researchLinks.map((link) => navLink(link, "touch"))}
          <AccountControl mobile onNavigate={closeMenus} />
        </div>
      </div>
    </nav>
  );
}
