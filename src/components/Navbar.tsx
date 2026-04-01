"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Search } from "lucide-react";

const dataLinks = [
  { href: "/", label: "Deals" },
  { href: "/funds", label: "Funds" },
  { href: "/portfolio", label: "Portfolio companies" },
];

const primaryNav = [
  { label: "News and analysis", active: false },
  { label: "Data", active: true },
  { label: "Performance and rankings", active: false },
  { label: "Network and events", active: false },
  { label: "Sectors", active: false },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Tier A: Ad Banner Placeholder */}
      <div className="hidden sm:flex bg-[#f0f0ee] h-6 items-center justify-center">
        <span className="text-[10px] text-[#b0b0b0] tracking-wider uppercase">
          Advertisement
        </span>
      </div>

      {/* Tier B: Black Utility Bar */}
      <div className="hidden sm:block bg-[#111111] h-7">
        <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 text-[10px] text-[#a0a0a0]">
            <span className="hover:text-white cursor-pointer transition-colors">Contact us</span>
            <span className="text-[#444]">&middot;</span>
            <span className="hover:text-white cursor-pointer transition-colors">Sign-in</span>
            <span className="text-[#444]">&middot;</span>
            <span className="hover:text-white cursor-pointer transition-colors">FAQ</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[#a0a0a0]">
            <span className="hover:text-white cursor-pointer transition-colors">About Infrastructure Investor</span>
            <span className="text-[#444]">&middot;</span>
            <span className="hover:text-white cursor-pointer transition-colors">Suggest a story</span>
            <span className="text-[#444]">&middot;</span>
            <span className="hover:text-white cursor-pointer transition-colors">Subscription Options</span>
          </div>
        </div>
      </div>

      {/* Tier C: Masthead Row */}
      <div className="bg-white h-14 border-b border-[#d8d8d8]">
        <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            {/* TODO: Replace with official Infrastructure Investor logo asset */}
            <div className="w-[3px] h-9 bg-[#008253] flex-shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="font-heading text-[22px] font-bold leading-[1.05] tracking-tight text-[#111111]">
                Infrastructure
              </span>
              <span className="font-heading text-[22px] font-bold leading-[1.05] tracking-tight text-[#111111]">
                Investor
              </span>
            </div>
          </Link>

          {/* Desktop: compact search */}
          <div className="hidden sm:flex items-center">
            <div className="flex items-center border border-[#d8d8d8] bg-[#f5f5f5] px-3 py-1.5 gap-2">
              <Search className="h-3.5 w-3.5 text-[#999]" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-xs text-[#111] placeholder-[#999] outline-none w-36"
              />
            </div>
          </div>

          {/* Mobile: hamburger */}
          <div className="flex sm:hidden items-center">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center text-[#6b6b6b] hover:text-[#111111] transition-colors"
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

      {/* Tier D: Primary Nav */}
      <div className="hidden sm:block bg-white h-10 border-b border-[#d8d8d8]">
        <div className="mx-auto flex h-full max-w-[1240px] items-center px-4 sm:px-6 gap-0">
          {primaryNav.map((item) => (
            <div
              key={item.label}
              className={`relative h-full flex items-center px-4 text-[13px] cursor-pointer transition-colors ${
                item.active
                  ? "font-bold text-[#111111]"
                  : "text-[#6f6f6f] hover:text-[#111111]"
              }`}
            >
              <span className="flex items-center gap-1">
                {item.label}
                <ChevronDown className="h-3 w-3" />
              </span>
              {item.active && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#008253]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden border-b border-[#d8d8d8] bg-white">
          <div className="px-4 py-3 space-y-1">
            <div className="text-[10px] font-bold text-[#008253] uppercase tracking-wider mb-2 px-3">
              Data
            </div>
            {dataLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-[#008253] bg-[rgba(0,130,83,0.04)]"
                      : "text-[#6b6b6b] hover:text-[#111111] hover:bg-[#f5f5f3]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="border-t border-[#e5e5e5] mt-2 pt-2">
              {primaryNav.filter(n => !n.active).map((item) => (
                <div
                  key={item.label}
                  className="px-3 py-2 text-sm text-[#999] cursor-default"
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
