import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AttributionTracker from "@/components/AttributionTracker";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OxiSure Tech — Oxygen Tubing Lifecycle Manager",
  description:
    "Never miss an oxygen tubing replacement. Track your supply schedule, get timely reminders, and reorder with one tap.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <AttributionTracker />
        {children}
      </body>
    </html>
  );
}
