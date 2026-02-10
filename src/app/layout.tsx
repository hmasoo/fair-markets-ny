import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Tracking market concentration, corporate consolidation, and their impact on affordability across New York State.";

export const metadata: Metadata = {
  title: {
    default: "Fair Markets NY",
    template: "%s | Fair Markets NY",
  },
  description,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_URL || "https://fair-markets-ny.vercel.app"
  ),
  openGraph: {
    title: "Fair Markets NY",
    description,
    type: "website",
    siteName: "Fair Markets NY",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fair Markets NY",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Nav />
        <main className="pt-14 md:pt-0 min-h-screen">
          {children}
        </main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
