// The only place the WhatsApp number lives (BUILD_SPEC §0). Import it; never hard-code it elsewhere.
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "233557042005";

export const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}`;

export const site = {
  name: "ABE Agro Hub",
  tagline: "Mechanizing Agriculture. Empowering Nations.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.abeagrohub.com",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "sales@abeagrohub.com",
  phoneDisplay: "+233 55 704 2005",
  location: "Head office in Accra, Ghana",
  shortLocation: "Accra, Ghana",
  hours: "9:00am – 5:00pm",
  founded: 1978,
  formerName: "Abdul Baai Enterprise",
  countriesServed: ["Ghana", "Togo", "Burkina Faso", "Côte d'Ivoire"],
  vision:
    "To become Africa's leading digital marketplace for agricultural machinery and mechanization solutions.",
} as const;

/**
 * Branches and their phone numbers, as given by the owner (November 2026). WhatsApp quotes still go
 * to WHATSAPP_NUMBER above; these numbers are for calling a branch.
 */
export const branches = [
  { name: "Accra", label: "Head Office", phoneDisplay: "0244 823 137", tel: "+233244823137" },
  { name: "Accra Central", label: "Branch", phoneDisplay: "024 305 5163", tel: "+233243055163" },
  { name: "Kumasi", label: "Branch", phoneDisplay: "023 580 1203", tel: "+233235801203" },
  { name: "Ashaiman", label: "Branch", phoneDisplay: "024 132 3336", tel: "+233241323336" },
  { name: "Kasoa", label: "Branch", phoneDisplay: "024 284 9245", tel: "+233242849245" },
] as const;

/** "Accra, Kumasi, Ashaiman and Kasoa": the towns with a branch, for running copy. */
export const branchTowns = "Accra, Kumasi, Ashaiman and Kasoa";

/** Header links after the Machinery mega-menu (BUILD_SPEC §6.1). */
export const primaryNav = [
  { label: "Solutions", href: "/solutions" },
  { label: "How it works", href: "/how-it-works" },
  { label: "About", href: "/about" },
  { label: "Partners", href: "/partners" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerLinks = [
  { label: "All machinery", href: "/machinery" },
  ...primaryNav,
  { label: "FAQ", href: "/faq" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;
