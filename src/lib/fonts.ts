import { Archivo, Source_Sans_3 } from "next/font/google";

// Self-hosted by next/font at build time (BUILD_SPEC §4.3).
export const fontDisplay = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
  axes: ["wdth"],
});

export const fontBody = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
});
