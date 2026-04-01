import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    template: "%s | Infrastructure Investor",
    default: "Deals | Infrastructure Investor",
  },
  description:
    "Infrastructure Investor's data platform covering deals, fund managers, and portfolio companies across global infrastructure.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f5f5f3] text-[#111111] antialiased">
        <Navbar />
        <main className="pt-[148px]">{children}</main>
        <footer className="border-t border-[#d8d8d8] bg-[#f5f5f5] mt-12">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#6f6f6f]">
              <span>&copy; 2026 PEI Media Ltd &mdash; Infrastructure Investor</span>
              <div className="flex gap-4">
                <span>Terms &amp; Conditions</span>
                <span>Privacy Policy</span>
                <span>Contact</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
