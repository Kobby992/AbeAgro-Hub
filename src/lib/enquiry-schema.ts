import { z } from "zod";
import { normalizePhone } from "@/lib/phone";

/** The partner and contact forms (BUILD_SPEC §6.9). Replies need a phone number or an email. */
export const enquirySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter your name.")
      .max(80, "Use 80 characters or fewer.")
      .regex(/^[^\r\n]*$/, "Use a single line."),
    company: z.string().trim().max(120, "Use 120 characters or fewer.").optional(),
    phone: z
      .string()
      .trim()
      .refine((value) => value === "" || normalizePhone(value) !== null, {
        message: "Enter a valid phone number, such as 024 123 4567 or +233 24 123 4567.",
      })
      .optional(),
    email: z.union([z.literal(""), z.email("Enter a valid email address.")]).optional(),
    message: z
      .string()
      .trim()
      .min(5, "Tell us how we can help.")
      .max(1000, "Keep your message to 1000 characters or fewer."),
  })
  .superRefine((value, context) => {
    if (!value.phone && !value.email) {
      context.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Enter a phone number or an email, so we can reply.",
      });
    }
  });

export type EnquiryFields = z.infer<typeof enquirySchema>;

export const enquiryRequestSchema = z.object({
  enquiry: enquirySchema,
  /** Spam checks: a field people never see, and how long the form was open. */
  website: z.string().optional(),
  elapsedMs: z.number().optional(),
});
