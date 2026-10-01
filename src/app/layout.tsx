import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { profile } from "@/content/profile";
import { APPLE_ICON, ICON, OG_IMAGE } from "@/lib/metaImages";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: `${profile.name} | ${profile.location} | ${profile.companies}`,
  description: profile.bio,
  alternates: { canonical: "/" },
  icons: {
    icon: { url: ICON.url, type: "image/png", sizes: `${ICON.size}x${ICON.size}` },
    apple: { url: APPLE_ICON.url, type: "image/png", sizes: `${APPLE_ICON.size}x${APPLE_ICON.size}` },
  },
  openGraph: {
    images: [{ ...OG_IMAGE, type: "image/png" }],
    type: "profile",
    url: "/",
    siteName: profile.name,
    title: profile.name,
    description: profile.bio,
    locale: "en_US",
    firstName: profile.name,
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE],
    title: profile.name,
    description: profile.bio,
  },
};

export const viewport: Viewport = {
  themeColor: "#1b1430",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
