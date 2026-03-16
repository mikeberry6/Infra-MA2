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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090B] text-[#EDEDED] antialiased">
        <Navbar />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
