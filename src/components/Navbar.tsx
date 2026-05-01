"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, User } from "lucide-react";
import { TextInput } from "@/components/shared/TextInput";

const navLinks = [
  {
    href: "/tracker",
    label: "Database",
    matches: (p: string) =>
      p === "/" || p.startsWith("/tracker") || p.startsWith("/funds") || p.startsWith("/portfolio"),
  },
  { href: "/earnings", label: "Earnings", matches: (p: string) => p.startsWith("/earnings") },
  { href: "/search", label: "Search", matches: (p: string) => p.startsWith("/search") },
];

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
      <span className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
        InfraSight
      </span>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--bg-surface)]/95 shadow-[0_1px_0_rgba(17,17,20,0.02)] backdrop-blur-md"
      aria-label="Primary"
    >
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-6 px-4 sm:px-6">
        {/* Wordmark */}
        <Wordmark />

        {/* Desktop nav */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="inline-flex items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--bg-app)] p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
            {navLinks.map((link) => {
              const isActive = link.matches(pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[0_1px_2px_rgba(17,17,20,0.05)]"
                      : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Desktop right cluster */}
        <div className="hidden md:flex items-center gap-2">
          <form
            method="get"
            action="/search"
            className="w-[260px]"
            role="search"
          >
            <TextInput
              type="search"
              name="q"
              leadingIcon={<Search />}
              placeholder="Search deals, funds, PortCos"
              aria-label="Search"
            />
          </form>
          <Link
            href="/login"
            aria-label="Account"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-[var(--text-secondary)] transition-colors hover:border-[var(--border)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          >
            <User className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile sheet */}
      {menuOpen && (
        <div className="md:hidden bg-[var(--bg-surface)] border-t border-[var(--border)] animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            <form
              method="get"
              action="/search"
              role="search"
              className="mb-3"
              onSubmit={() => setMenuOpen(false)}
            >
              <TextInput
                type="search"
                name="q"
                size="md"
                leadingIcon={<Search />}
                placeholder="Search..."
                aria-label="Search"
              />
            </form>
            {navLinks.map((link) => {
              const isActive = link.matches(pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--bg-hover)] text-[var(--text-primary)] shadow-[inset_2px_0_0_var(--accent)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
