import { Archivo, Source_Sans_3 } from "next/font/google";

// Self-hosted by next/font at build time (BUILD_SPEC §4.3).
// Archivo's width and weight axes make it 88 KB, so it loads after the page instead of competing
// with the body font; headings show the size-matched fallback until it arrives.
export const fontDisplay = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
  axes: ["wdth"],
  preload: false,
});

export const fontBody = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
});
