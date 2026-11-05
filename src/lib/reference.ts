// Quote references look like ABE-Q-251105-7K3M (BUILD_SPEC §8.2). Crockford base32 leaves out the
// letters I, L, O and U, so a reference read aloud or retyped is hard to get wrong.
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export const REFERENCE_PATTERN = /^ABE-Q-\d{6}-[0-9A-HJKMNP-TV-Z]{4}$/;

export function createReference(now = new Date()): string {
  const date = now.toISOString().slice(2, 10).replace(/-/g, "");
  const random = [...crypto.getRandomValues(new Uint8Array(4))]
    .map((byte) => CROCKFORD[byte % CROCKFORD.length])
    .join("");
  return `ABE-Q-${date}-${random}`;
}
