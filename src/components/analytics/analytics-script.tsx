import Script from "next/script";

/** Plausible needs no cookies, so no cookie notice (§10). Off until the domain setting is added. */
export function AnalyticsScript() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;
  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="lazyOnload"
    />
  );
}
