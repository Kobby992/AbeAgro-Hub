// The only place the WhatsApp number lives (BUILD_SPEC §0). Import it; never hard-code it elsewhere.
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "233557042005";

export const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}`;

export const site = {
  name: "ABE Agro Hub",
  tagline: "Mechanizing Agriculture. Empowering Nations.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.abeagrohub.com",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "sales@abeagrohub.com",
  phoneDisplay: "+233 55 704 2005",
  location: "Kasoa, Central Region, Ghana",
  shortLocation: "Kasoa, Ghana",
  hours: "9:00am – 5:00pm",
} as const;

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
