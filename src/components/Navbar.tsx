"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Menu, X } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Weekly Briefing" },
    { href: "/tracker", label: "Deal Database" },
    { href: "/earnings", label: "Public Asset Managers" },
    { href: "/medals", label: "Medal Count" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
        <Link href="/" className="flex items-center gap-2.5 lg:gap-3">
          <div className="flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900">
            <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-blue-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm lg:text-base font-semibold tracking-tight text-zinc-50">
              InfraTracker
            </span>
            <span className="text-[10px] lg:text-[11px] font-medium uppercase tracking-widest text-zinc-500">
              M&A Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden sm:flex items-center gap-1 lg:gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3.5 lg:px-4 py-1.5 lg:py-2 text-sm lg:text-base font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-800/80 text-zinc-50"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop right section */}
        <div className="hidden sm:flex items-center gap-3 lg:gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs lg:text-sm font-medium text-zinc-400">
              Live
            </span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <span className="mono text-xs lg:text-sm text-zinc-500">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Mobile: live dot + hamburger */}
        <div className="flex sm:hidden items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden absolute top-14 left-0 right-0 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-800/80 text-zinc-50"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="flex items-center gap-2 px-3.5 pt-2 pb-1">
              <span className="mono text-xs text-zinc-500">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
