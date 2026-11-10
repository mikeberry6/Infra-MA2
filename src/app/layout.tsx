import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ResearchMetrics } from "@/components/shared/ResearchMetrics";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | InfraSight",
    default: "Deals | InfraSight",
  },
  description:
    "InfraSight — the data platform for global infrastructure investing. Deals, fund managers, and PortCos in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] antialiased">
        <a href="#main-content" className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-md bg-[var(--bg-surface)] px-4 py-2 text-sm font-semibold focus:translate-y-0">
          Skip to main content
        </a>
        <Navbar />
        <ResearchMetrics />
        <main id="main-content" tabIndex={-1} className="pt-14">{children}</main>
        <footer className="border-t border-[var(--border)] bg-[var(--bg-app)] mt-16">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 type-micro">
              <div className="inline-flex items-center gap-2">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                <span className="font-medium text-[var(--text-secondary)]">InfraSight</span>
                <span>· &copy; 2026</span>
              </div>
              <a href="mailto:research@infrasight.com" className="hover:text-[var(--text-primary)] transition-colors">
                Contact research
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
