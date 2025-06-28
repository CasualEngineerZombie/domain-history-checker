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
  // Updated Title: Make it descriptive of your app's main function
  title: "Domain History Checker | WHOIS & RDAP Lookup Tool",
  // Updated Description: Provide more detail about what the app does
  description: "Instantly check domain registration history, ownership details, registrar information, nameservers, and more using powerful WHOIS and RDAP lookup tools.",
  // Optional: Add keywords for SEO
  keywords: ["domain checker", "whois lookup", "rdap lookup", "domain history", "website owner", "domain registration", "nameserver lookup"],
  // Optional: Add author information
  authors: [{ name: "Your Name or Company Name" }], // Replace with your actual name/company
  // Optional: Add Open Graph / Twitter Card metadata for social sharing
  openGraph: {
    title: "Domain History Checker | WHOIS & RDAP Lookup Tool",
    description: "Instantly check domain registration history, ownership details, registrar information, nameservers, and more using powerful WHOIS and RDAP lookup tools.",
    url: "https://yourdomainchecker.com", // Replace with your actual deployed URL
    siteName: "Domain History Checker",
    images: [
      {
        url: "https://yourdomainchecker.com/og-image.jpg", // Replace with a relevant image for social sharing
        width: 1200,
        height: 630,
        alt: "Domain History Checker",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Domain History Checker | WHOIS & RDAP Lookup Tool",
    description: "Instantly check domain registration history, ownership details, registrar information, nameservers, and more using powerful WHOIS and RDAP lookup tools.",
    creator: "@yourtwitterhandle", // Replace with your Twitter handle
    images: ["https://yourdomainchecker.com/twitter-image.jpg"], // Replace with a relevant image for Twitter
  },
  // Optional: Favicon (if you have one in the public directory)
  icons: {
    icon: "/favicon.ico", // Points to your favicon.ico
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
        {children}
      </body>
    </html>
  );
}