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
      <body className="min-h-screen bg-[#f3f3f3] text-[#1a1a1a] antialiased">
        <Navbar />
        <main className="pt-[164px]">{children}</main>
        <footer className="border-t border-[#d6d6d6] bg-white mt-12">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#6e6e6e]">
              <span>&copy; 2026 PEI Media</span>
              <div className="flex gap-4">
                <span className="hover:text-[#1a1a1a] cursor-pointer transition-colors">Terms &amp; Conditions</span>
                <span className="hover:text-[#1a1a1a] cursor-pointer transition-colors">Privacy Policy</span>
                <span className="hover:text-[#1a1a1a] cursor-pointer transition-colors">Contact</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
