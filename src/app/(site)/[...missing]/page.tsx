import { notFound } from "next/navigation";

// Sends unknown addresses to (site)/not-found.tsx, which keeps the site header and footer.
export default function MissingPage() {
  notFound();
}
