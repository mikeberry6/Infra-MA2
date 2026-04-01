import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    template: "%s | InfraTracker",
    default: "Deal Database | InfraTracker",
  },
  description:
    "Institutional intelligence platform tracking global infrastructure mergers, acquisitions, and fund activity.",
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
        <main className="pt-[104px]">{children}</main>
      </body>
    </html>
  );
}
