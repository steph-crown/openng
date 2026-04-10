import { RootProvider } from "fumadocs-ui/provider/next";
import { GeistMono, GeistSans } from "geist/font";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700"],
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
    <html className={`${plusJakarta.variable} ${GeistSans.variable} ${GeistMono.variable}`} lang="en" suppressHydrationWarning>
      <body
        className="flex min-h-screen flex-col font-sans antialiased"
        suppressHydrationWarning
      >
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
