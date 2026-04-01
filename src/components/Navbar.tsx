"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Menu, X } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Deal Database" },
    { href: "/funds", label: "Fund Database" },
    { href: "/portfolio", label: "PortCo Database" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Tier 1: Black Utility Bar */}
      <div className="hidden sm:block bg-[#111111] h-7">
        <div className="mx-auto flex h-full max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
          <span className="mono text-[11px] text-[#a0a0a0]">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[11px] font-medium text-[#a0a0a0]">
                Live
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tier 2: White Brand Header */}
      <div className="bg-white border-b border-[#d7d7d7] h-10 sm:h-11">
        <div className="mx-auto flex h-full max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
          <Link href="/" className="flex items-center gap-2.5">
            {/* TODO: Replace with official Infrastructure Investor logo asset (SVG/PNG) */}
            <div className="flex items-center gap-2">
              <div className="w-[3px] h-6 bg-[#007a4d] rounded-full" />
              <div className="flex h-7 w-7 items-center justify-center rounded border border-[#d7d7d7] bg-[#fafaf9]">
                <Activity className="h-3.5 w-3.5 text-[#007a4d]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-[15px] sm:text-base font-bold tracking-tight text-[#111111]">
                InfraTracker
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] text-[#999999]">
                M&A Intelligence
              </span>
            </div>
          </Link>

          {/* Mobile: live dot + hamburger */}
          <div className="flex sm:hidden items-center gap-3">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded text-[#6b6b6b] hover:text-[#111111] hover:bg-[#f5f5f3] transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tier 3: Navigation Bar */}
      <div className="hidden sm:block bg-[#fafaf9] border-b border-[#d7d7d7] h-9">
        <div className="mx-auto flex h-full max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] items-center px-4 sm:px-6 lg:px-8 xl:px-12 gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 lg:px-4 h-full flex items-center text-sm font-semibold transition-colors ${
                  isActive
                    ? "text-[#111111]"
                    : "text-[#6b6b6b] hover:text-[#111111]"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 lg:left-4 lg:right-4 h-[2px] bg-[#007a4d]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden border-b border-[#d7d7d7] bg-white">
          <div className="px-4 py-3 space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-[#007a4d] bg-[rgba(0,122,77,0.04)]"
                      : "text-[#6b6b6b] hover:text-[#111111] hover:bg-[#f5f5f3]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="flex items-center gap-2 px-3 pt-2 pb-1">
              <span className="mono text-[11px] text-[#999999]">
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
