import { Montserrat } from "next/font/google";

// Self-hosted by next/font at build time. One variable font carries every weight the site uses.
export const fontSans = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});
