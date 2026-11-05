import { parsePhoneNumberFromString } from "libphonenumber-js/min";

export type NormalizedPhone = { e164: string; display: string };

/** Accepts Ghana numbers such as 024 123 4567, and international numbers with a + (§8.3). */
export function normalizePhone(input: string): NormalizedPhone | null {
  const phone = parsePhoneNumberFromString(input.trim(), "GH");
  if (!phone?.isValid()) return null;
  return { e164: phone.number, display: phone.formatInternational() };
}
