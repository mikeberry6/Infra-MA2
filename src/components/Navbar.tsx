"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Search, User } from "lucide-react";

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
      <div className="hidden sm:block bg-[#e8e8e6] h-10">
        <div className="mx-auto flex h-full max-w-[1240px] items-center justify-center px-4 sm:px-6">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-[#b0b0b0] tracking-[0.2em] uppercase">
              Advertisement
            </span>
            <div className="w-[468px] h-[15px] border border-[#d0d0d0] bg-[#f0f0ee]" />
          </div>
        </div>
      </div>

      {/* Tier B: Black Utility Bar */}
      <div className="hidden sm:block bg-[#111111] h-[30px]">
        <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-0 text-[11px] text-[#a0a0a0]">
            <span className="hover:text-white cursor-pointer transition-colors">Contact us</span>
            <span className="text-[#555] mx-2">|</span>
            <span className="hover:text-white cursor-pointer transition-colors">Sign-in</span>
            <span className="text-[#555] mx-2">|</span>
            <span className="hover:text-white cursor-pointer transition-colors">FAQ</span>
          </div>
          <div className="flex items-center gap-0 text-[11px] text-[#a0a0a0]">
            <span className="hover:text-white cursor-pointer transition-colors">About Infrastructure Investor</span>
            <span className="text-[#555] mx-2">|</span>
            <span className="hover:text-white cursor-pointer transition-colors">Suggest a story</span>
            <span className="text-[#555] mx-2">|</span>
            <span className="hover:text-white cursor-pointer transition-colors">Subscription Options</span>
            <span className="text-[#555] mx-3">|</span>
            <User className="h-3.5 w-3.5 text-[#a0a0a0] hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </div>

      {/* Tier C: Masthead Row */}
      <div className="bg-white h-[56px] border-b border-[#d6d6d6]">
        <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            {/* TODO: Replace with official Infrastructure Investor logo asset */}
            <div className="w-[4px] h-10 bg-[#008253] flex-shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="font-heading text-[26px] font-bold leading-[0.95] tracking-[-0.02em] text-[#1a1a1a]">
                Infrastructure
              </span>
              <span className="font-heading text-[26px] font-bold leading-[0.95] tracking-[-0.02em] text-[#1a1a1a]">
                Investor
              </span>
            </div>
          </Link>

          {/* Desktop: search */}
          <div className="hidden sm:flex items-center">
            <div className="flex items-center border border-[#d6d6d6] bg-[#f3f3f3] px-3 py-1.5 gap-2">
              <Search className="h-3.5 w-3.5 text-[#999]" />
              <input
                type="text"
                placeholder="Search Infrastructure Investor"
                className="bg-transparent text-[13px] text-[#1a1a1a] placeholder-[#999] outline-none w-48"
              />
            </div>
          </div>

          {/* Mobile: hamburger */}
          <div className="flex sm:hidden items-center">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center text-[#6e6e6e] hover:text-[#1a1a1a] transition-colors"
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
      <div className="hidden sm:block bg-white h-[38px] border-b border-[#d6d6d6]">
        <div className="mx-auto flex h-full max-w-[1240px] items-center px-4 sm:px-6 gap-0">
          {primaryNav.map((item) => (
            <div
              key={item.label}
              className={`relative h-full flex items-center px-3 text-[13px] font-heading cursor-pointer transition-colors ${
                item.active
                  ? "font-bold text-[#1a1a1a]"
                  : "font-semibold text-[#5a5a5a] hover:text-[#1a1a1a]"
              }`}
            >
              <span className="flex items-center gap-1">
                {item.label}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </span>
              {item.active && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#008253]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden border-b border-[#d6d6d6] bg-white">
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
                      : "text-[#6e6e6e] hover:text-[#1a1a1a] hover:bg-[#f3f3f3]"
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
            {/* Mobile search */}
            <div className="border-t border-[#e5e5e5] mt-2 pt-3 px-3">
              <div className="flex items-center border border-[#d6d6d6] bg-[#f3f3f3] px-3 py-2 gap-2">
                <Search className="h-3.5 w-3.5 text-[#999]" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-sm text-[#1a1a1a] placeholder-[#999] outline-none w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
