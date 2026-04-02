"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Search, ShoppingCart } from "lucide-react";

const dataLinks = [
  { href: "/", label: "Deals" },
  { href: "/funds", label: "Funds" },
  { href: "/portfolio", label: "Portfolio companies" },
];

const primaryNav = [
  { label: "News and analysis", hasDropdown: true, active: false },
  { label: "Data", hasDropdown: true, active: true },
  { label: "Performance and rankings", hasDropdown: true, active: false },
  { label: "Network and events", hasDropdown: true, active: false },
  { label: "Sectors", hasDropdown: true, active: false },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Tier A: Black Utility Bar */}
      <div className="hidden sm:block bg-[#1a1a1a] h-[28px]">
        <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center text-[10.5px] leading-none text-[#b0b0b0]">
            <a href="#" className="hover:text-white transition-colors px-[6px] first:pl-0">Contact us</a>
            <span className="text-[#444]">|</span>
            <a href="#" className="hover:text-white transition-colors px-[6px]">Sign-in</a>
            <span className="text-[#444]">|</span>
            <a href="#" className="hover:text-white transition-colors px-[6px]">FAQ</a>
            <span className="text-[#444]">|</span>
            <a href="#" className="hover:text-white transition-colors px-[6px]">About Infrastructure Investor</a>
            <span className="text-[#444]">|</span>
            <a href="#" className="hover:text-white transition-colors px-[6px]">Suggest a story</a>
            <span className="text-[#444]">|</span>
            <a href="#" className="hover:text-white transition-colors px-[6px]">Subscription Options</a>
          </div>
          <div className="flex items-center gap-3 text-[10.5px] leading-none text-[#b0b0b0]">
            <a href="#" className="hover:text-white transition-colors">My account</a>
            <ShoppingCart className="h-3 w-3 text-[#b0b0b0] hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </div>

      {/* Tier B: White Masthead */}
      <div className="bg-white border-b border-black/[0.08]">
        <div className="mx-auto flex h-[60px] max-w-[1240px] items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-[10px] group">
            {/* Green vertical rule — matches II reference */}
            <div className="w-[4px] h-[42px] bg-[#008253] flex-shrink-0" />
            {/* Stacked wordmark — the real II logo uses a heavy condensed sans
                with "Infrastructure" slightly lighter than "Investor" */}
            <div className="flex flex-col" style={{ lineHeight: '0.88' }}>
              <span
                className="font-heading text-[#1a1a1a] tracking-[-0.04em]"
                style={{ fontSize: '24px', fontWeight: 600, fontStretch: 'condensed' }}
              >
                Infrastructure
              </span>
              <span
                className="font-heading text-[#1a1a1a] tracking-[-0.04em]"
                style={{ fontSize: '24px', fontWeight: 700, fontStretch: 'condensed' }}
              >
                Investor
              </span>
            </div>
          </Link>

          {/* Desktop: search field */}
          <div className="hidden sm:flex items-center">
            <div className="flex items-center border border-black/[0.08] bg-[#f7f7f7] h-[32px] w-[260px]">
              <input
                type="text"
                placeholder="Search Infrastructure Investor"
                className="bg-transparent text-[12px] text-[#1a1a1a] placeholder-[#999] outline-none flex-1 px-3"
              />
              <button className="h-full px-2.5 border-l border-black/[0.08] bg-[#eeeeee] hover:bg-[#e4e4e4] transition-colors flex items-center justify-center">
                <Search className="h-3.5 w-3.5 text-[#666]" />
              </button>
            </div>
          </div>

          {/* Mobile: hamburger */}
          <div className="flex sm:hidden items-center">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center text-[#6e6e6e] hover:text-[#1a1a1a] transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tier C: Primary Navigation */}
      <div className="hidden sm:block bg-white border-b border-black/[0.08] shadow-sm">
        <div className="mx-auto flex h-[36px] max-w-[1240px] items-center px-4 sm:px-6">
          {primaryNav.map((item) => (
            <div
              key={item.label}
              className={`relative h-full flex items-center cursor-pointer transition-colors ${
                item.active
                  ? "text-[#1a1a1a]"
                  : "text-[#555555] hover:text-[#1a1a1a]"
              }`}
            >
              <span className={`flex items-center gap-[3px] px-[10px] text-[13px] font-heading ${
                item.active ? "font-bold" : "font-semibold"
              }`}>
                {item.label}
                {item.hasDropdown && (
                  <ChevronDown className="h-[10px] w-[10px] opacity-40" />
                )}
              </span>
              {item.active && (
                <span className="absolute bottom-0 left-[10px] right-[10px] h-[3px] bg-[#008253]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden border-b border-black/[0.08] bg-white shadow-sm">
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
            <div className="border-t border-[#e5e5e5] mt-2 pt-3 px-3">
              <div className="flex items-center border border-black/[0.08] bg-[#f7f7f7] h-[36px]">
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-sm text-[#1a1a1a] placeholder-[#999] outline-none flex-1 px-3"
                />
                <button className="h-full px-3 border-l border-black/[0.08] bg-[#eeeeee]">
                  <Search className="h-3.5 w-3.5 text-[#666]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
