"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, User } from "lucide-react";

const navLinks = [
  { href: "/", label: "Deals", matches: (p: string) => p === "/" || p === "/tracker" },
  { href: "/funds", label: "Funds", matches: (p: string) => p.startsWith("/funds") },
  { href: "/portfolio", label: "Portfolio", matches: (p: string) => p.startsWith("/portfolio") },
  { href: "/search", label: "Search", matches: (p: string) => p.startsWith("/search") },
];

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 group ${className}`}>
      <span
        aria-hidden
        className="h-2 w-2 rounded-full bg-[var(--accent)] transition-transform duration-200 group-hover:scale-110"
      />
      <span className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
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
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-surface)] border-b border-[var(--border)]"
      aria-label="Primary"
    >
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-6 px-4 sm:px-6">
        {/* Wordmark */}
        <Wordmark />

        {/* Desktop nav */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-1">
          {navLinks.map((link) => {
            const isActive = link.matches(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative inline-flex items-center h-14 px-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {link.label}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute left-3 right-3 -bottom-px h-[2px] bg-[var(--accent)] rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop right cluster */}
        <div className="hidden md:flex items-center gap-2">
          <form
            method="get"
            action="/search"
            className="relative w-[260px]"
            role="search"
          >
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-tertiary)] pointer-events-none" />
            <input
              type="search"
              name="q"
              placeholder="Search deals, funds, companies"
              aria-label="Search"
              className="w-full h-8 pl-8 pr-2.5 rounded-md text-xs bg-[var(--bg-app)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-colors focus:outline-none focus:bg-[var(--bg-surface)] focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-soft)]"
            />
          </form>
          <button
            type="button"
            aria-label="Account"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <User className="h-4 w-4" />
          </button>
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
              className="relative mb-3"
              onSubmit={() => setMenuOpen(false)}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)] pointer-events-none" />
              <input
                type="search"
                name="q"
                placeholder="Search..."
                aria-label="Search"
                className="w-full h-10 pl-10 pr-3 rounded-md text-sm bg-[var(--bg-app)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-soft)]"
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
                      ? "bg-[var(--bg-hover)] text-[var(--text-primary)]"
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
