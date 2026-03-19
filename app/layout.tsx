import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atelier Chef | AI-Powered Culinary Studio",
  description: "Transform your cooking experience with AI-generated recipes, nutrition analysis, and a personal culinary archive. Powered by Google Gemini AI and Supabase.",
  keywords: [
    "AI Chef", "Recipe Generator", "Culinary AI", "Supabase", "Gemini AI", "Nutrition", "Cooking App", "Food", "Kitchen Assistant"
  ],
  authors: [{ name: "Atelier Chef Team" }],
  openGraph: {
    title: "Atelier Chef | AI-Powered Culinary Studio",
    description: "Transform your cooking experience with AI-generated recipes, nutrition analysis, and a personal culinary archive.",
    url: "https://your-deployment-url.com",
    siteName: "Atelier Chef",
    images: [
      {
        url: "/chef-og-image.png",
        width: 1200,
        height: 630,
        alt: "Atelier Chef - AI Culinary Studio"
      }
    ],
    locale: "en_US",
    type: "website"
  }
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
        {children}
      </body>
    </html>
  );
}
