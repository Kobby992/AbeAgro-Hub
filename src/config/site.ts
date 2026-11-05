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
  hours: "9:00am – 5:00pm",
} as const;
