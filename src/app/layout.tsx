import type { Metadata } from "next";
import type { ReactNode } from "react";
import { site } from "@/config/site";
import { fontSans } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.name,
  description: "Agricultural machinery and food-processing equipment, based in Kasoa, Ghana.",
  // Holding page: stays out of search results until the SEO work in Phase 7.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontSans.variable}>
      <body className="antialiased">
        {/* Scroll reveals start hidden, so without JavaScript they must simply be shown. */}
        <noscript>
          <style>{`.reveal,.stagger>*{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
