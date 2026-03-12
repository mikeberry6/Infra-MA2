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
    { href: "/funds", label: "Fund Database" },
    { href: "/earnings", label: "Public Asset Managers" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-[#27272A] bg-[#09090B]/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
        <Link href="/" className="flex items-center gap-2.5 lg:gap-3">
          <div className="flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-md border border-[#27272A] bg-[#18181B]">
            <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-[#A1A1AA]" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm lg:text-base font-semibold tracking-tight text-[#EDEDED]">
              InfraTracker
            </span>
            <span className="text-[10px] lg:text-[11px] font-medium uppercase tracking-widest text-[#52525B]">
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
                className={`rounded-[4px] px-3.5 lg:px-4 py-1.5 lg:py-2 text-sm lg:text-base font-medium transition-colors ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-[#A1A1AA] hover:text-[#EDEDED] hover:bg-white/5"
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
            <span className="text-xs lg:text-sm font-medium text-[#A1A1AA]">
              Live
            </span>
          </div>
          <div className="h-4 w-px bg-[#27272A]" />
          <span className="mono text-xs lg:text-sm text-[#52525B]">
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
            className="flex h-10 w-10 items-center justify-center rounded-md text-[#A1A1AA] hover:text-[#EDEDED] hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden absolute top-14 left-0 right-0 border-b border-[#27272A] bg-[#09090B]/95 backdrop-blur-md">
          <div className="px-4 py-3 space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-[4px] px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-[#A1A1AA] hover:text-[#EDEDED] hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="flex items-center gap-2 px-3.5 pt-2 pb-1">
              <span className="mono text-xs text-[#52525B]">
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
