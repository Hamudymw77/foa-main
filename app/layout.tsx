import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | KICKGOAL",
    default: "KICKGOAL - Premier League Live Scores, Stats & Table",
  },
  description: "The ultimate dashboard for Premier League 2025/26. Real-time match scores, live standings, top scorers, team statistics, and detailed match analysis.",
  keywords: ["Premier League", "Football", "Soccer", "EPL", "Live Scores", "League Table", "Stats", "Fantasy Football", "KICKGOAL"],
  authors: [{ name: "KICKGOAL Team" }],
  creator: "KICKGOAL",
  publisher: "KICKGOAL Sports Data",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "KICKGOAL - Premier League Dashboard",
    description: "Follow the Premier League 2025/26 season with real-time updates.",
    url: "https://kickgoal.com",
    siteName: "KICKGOAL",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KICKGOAL - Premier League Live",
    description: "Real-time scores and stats for PL 25/26",
    creator: "@kickgoal",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}>
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
