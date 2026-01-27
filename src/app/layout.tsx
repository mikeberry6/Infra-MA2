import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Ticker } from "@/components/Ticker";

export const metadata: Metadata = {
  title: "InfraTracker | North American Infrastructure M&A Intelligence",
  description:
    "Premium institutional intelligence platform for North American infrastructure mergers, acquisitions, and project finance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-50 antialiased">
        <Navbar />
        <Ticker />
        <main className="pt-[104px]">{children}</main>
      </body>
    </html>
  );
}
