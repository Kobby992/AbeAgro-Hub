import Image from "next/image";
import Link from "next/link";
import { StripeDivider } from "@/components/motifs/stripe-divider";
import { categories } from "@/config/categories";
import { footerLinks, site } from "@/config/site";
import { GENERAL_QUOTE_LINK } from "@/lib/whatsapp";

const linkClasses = "inline-flex min-h-11 items-center hover:underline lg:min-h-8";

export function Footer() {
  return (
    <footer>
      <StripeDivider className="-mb-px" />
      <div className="grain bg-forest-900 text-white">
        {/* Bottom padding keeps links clear of the floating buttons (BUILD_SPEC §6.1). */}
        <div className="page-container grid gap-10 pt-10 pb-28 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.6fr_1.2fr]">
          <div>
            <Image
              src="/brand/logo-white.png"
              alt={site.name}
              width={550}
              height={249}
              sizes="176px"
              className="h-auto w-44"
            />
            <p className="mt-4 max-w-xs font-semibold">{site.tagline}</p>
          </div>

          <nav aria-label="Quick links">
            <h2 className="text-lg text-gold">Quick links</h2>
            <ul className="mt-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClasses}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Machinery categories">
            <h2 className="text-lg text-gold">Categories</h2>
            <ul className="mt-2 sm:columns-2 lg:columns-1 xl:columns-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link href={`/machinery/c/${category.slug}`} className={linkClasses}>
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-lg text-gold">Contact</h2>
            <ul className="mt-2 space-y-2">
              <li>
                <a
                  href={GENERAL_QUOTE_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClasses}
                >
                  WhatsApp {site.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className={linkClasses}>
                  {site.email}
                </a>
              </li>
              <li>{site.shortLocation}</li>
              <li>Open {site.hours}</li>
              <li>Nationwide delivery</li>
            </ul>
          </div>

          <div className="border-t border-white/20 pt-6 text-sm md:col-span-2 lg:col-span-4">
            <p className="max-w-prose">
              Request a quote for current pricing and availability. Payment and warranty terms are
              agreed with each quote.
            </p>
            <p className="mt-2">
              © {new Date().getFullYear()} {site.name}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
