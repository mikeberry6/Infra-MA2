import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { TrackedAnalyticsLink } from "@/components/shared/TrackedAnalyticsLink";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://infra-ma-2.vercel.app"),
  title: {
    template: "%s | InfraSight",
    default: "Deals | InfraSight",
  },
  description:
    "InfraSight — the data platform for global infrastructure investing. Deals, fund managers, and portfolio companies in one place.",
  openGraph: {
    type: "website",
    siteName: "InfraSight",
    title: "InfraSight — Infrastructure transaction intelligence",
    description: "Curated infrastructure deals, fund managers, portfolio companies, and market intelligence.",
    images: [{
      url: "/Infra-MA2/og-infrasight.png",
      width: 1731,
      height: 909,
      alt: "InfraSight infrastructure transaction intelligence",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "InfraSight — Infrastructure transaction intelligence",
    description: "Curated infrastructure deals, fund managers, portfolio companies, and market intelligence.",
    images: ["/Infra-MA2/og-infrasight.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] antialiased">
        <a
          href="#main-content"
          className="fixed left-3 top-3 z-[20000] -translate-y-20 rounded-md bg-[var(--accent)] px-3 py-2 type-meta font-medium text-[var(--text-on-accent)] shadow-lg transition-transform focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main-content" tabIndex={-1} className="pt-14 outline-none">
          {children}
        </main>
        <footer className="border-t border-[var(--border)] bg-[var(--bg-app)] mt-16">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 type-micro">
              <div className="inline-flex items-center gap-2">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                <span className="font-medium text-[var(--text-secondary)]">InfraSight</span>
                <span>· &copy; 2026</span>
              </div>
              <TrackedAnalyticsLink
                href="mailto:research@infrasight.com"
                analyticsEvent={{
                  name: "research_contact_initiated",
                  properties: { placement: "footer" },
                }}
                className="hover:text-[var(--text-primary)] transition-colors"
              >
                Contact research
              </TrackedAnalyticsLink>
            </div>
          </div>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
