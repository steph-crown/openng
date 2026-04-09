import { RootProvider } from "fumadocs-ui/provider/next";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Fira_Mono, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700"],
});

const firaMono = Fira_Mono({
  subsets: ["latin"],
  variable: "--font-fira-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "OpenNG Docs",
    template: "%s | OpenNG Docs",
  },
  description: "Documentation for the OpenNG public data API",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={`${plusJakarta.variable} ${GeistSans.variable} ${firaMono.variable}`} lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
