import { z } from "zod";
import { normalizePhone } from "@/lib/phone";

export const GHANA_REGIONS = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
] as const;

export const OUTSIDE_GHANA = "Outside Ghana";

export const CUSTOMER_TYPES = [
  "Farmer",
  "Agro-processor",
  "Food business / chop bar",
  "Cooperative / NGO",
  "Government / institution",
  "Reseller",
  "Other",
] as const;

const singleLine = (message: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, message)
    .max(max, `Use ${max} characters or fewer.`)
    .regex(/^[^\r\n]*$/, "Use a single line.");

/** The customer form (BUILD_SPEC §8.3). */
export const customerSchema = z
  .object({
    name: singleLine("Enter your full name.", 2, 80),
    phone: z
      .string()
      .trim()
      .refine((value) => normalizePhone(value) !== null, {
        message: "Enter a valid phone number, such as 024 123 4567 or +233 24 123 4567.",
      }),
    town: singleLine("Enter your town, so we can plan delivery.", 2, 80),
    region: z.string().refine((value) => value !== "", { message: "Choose your region." }),
    country: z.string().trim().max(80).optional(),
    customerType: z.string().optional(),
    message: z.string().trim().max(500, "Keep your message to 500 characters or fewer.").optional(),
    consent: z.boolean().refine((value) => value, {
      message: "Tick this box so we can reply to your request.",
    }),
  })
  .superRefine((value, context) => {
    if (value.region === OUTSIDE_GHANA && !value.country) {
      context.addIssue({ code: "custom", path: ["country"], message: "Enter your country." });
    }
  });

export type CustomerFields = z.infer<typeof customerSchema>;

const lineItemSchema = z.object({
  slug: z.string().max(120),
  qty: z.number().int().min(1).max(999),
  note: z.string().trim().max(200).optional(),
});

const attributionSchema = {
  pageUrl: z.string().max(500).optional(),
  utm: z.record(z.string(), z.string().max(200)).optional(),
};

/** One tap on Get quote: the customer's name and number arrive with their WhatsApp message. */
const quickRequestSchema = z.object({
  source: z.literal("product-quick"),
  items: z.array(lineItemSchema).length(1),
  ...attributionSchema,
});

const fullRequestSchema = z.object({
  source: z.literal("site"),
  items: z.array(lineItemSchema).min(1).max(50),
  customer: customerSchema,
  /** Spam checks: a field people never see, and how long the form was open. */
  website: z.string().optional(),
  elapsedMs: z.number().optional(),
  ...attributionSchema,
});

export const quoteRequestSchema = z.discriminatedUnion("source", [
  quickRequestSchema,
  fullRequestSchema,
]);

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
export type QuoteResponse = { reference: string; whatsappUrl: string };

export function customerLocation({ town, region, country }: CustomerFields): string {
  return region === OUTSIDE_GHANA ? `${town}, ${country}` : `${town}, ${region} Region`;
}
