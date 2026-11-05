"use client";

import { ChevronDown, ClipboardList, Menu, MessageCircle, Search } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { QuoteCount, QuoteListLink } from "@/components/quote/quote-list-link";
import { CategoryIconTile } from "@/components/product/category-tile";
import { Button } from "@/components/ui/button";
import { categories } from "@/config/categories";
import { primaryNav } from "@/config/site";
import { cn } from "@/lib/utils";
import { GENERAL_QUOTE_LINK } from "@/lib/whatsapp";
import { selectQuoteCount, useQuoteStore } from "@/store/quote";

const SearchPalette = dynamic(() => import("./search-palette"), { ssr: false });
const MobileMenu = dynamic(() => import("./mobile-menu"), { ssr: false });

const SCROLL_THRESHOLD = 24;

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

type Feature = { name: string; summary: string; image: string; href: string };

export function Header({ feature }: { feature?: Feature }) {
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > SCROLL_THRESHOLD,
    () => false,
  );
  const count = useQuoteStore(selectQuoteCount);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMounted, setSearchMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const openedByHover = useRef(false);

  const openSearch = () => {
    setSearchMounted(true);
    setSearchOpen(true);
  };

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchMounted(true);
        setSearchOpen(true);
      }
      if (event.key === "Escape") setMegaOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Only the home page has a dark hero under the header.
  const overDark = pathname === "/" && !scrolled && !megaOpen;
  const iconVariant = overDark ? "ghost-light" : "ghost";

  return (
    <header className="fixed inset-x-0 top-0 z-40" data-over-dark={overDark}>
      <div
        className={cn(
          "absolute inset-0 bg-cream shadow-md transition-opacity duration-250",
          overDark ? "opacity-0" : "opacity-100",
        )}
      />
      <div
        className={cn(
          "relative page-container flex items-center justify-between gap-3",
          scrolled ? "h-16" : "h-(--header-h)",
          overDark ? "text-white" : "text-forest",
        )}
      >
        <Link href="/" aria-label="ABE Agro Hub home" className="relative block h-12 w-28 shrink-0">
          <Image
            src="/brand/logo-white.png"
            alt=""
            fill
            sizes="112px"
            className={cn(
              "object-contain object-left transition-opacity duration-250",
              overDark ? "opacity-100" : "opacity-0",
            )}
          />
          <Image
            src="/brand/logo-full.png"
            alt=""
            fill
            sizes="112px"
            className={cn(
              "object-contain object-left transition-opacity duration-250",
              overDark ? "opacity-0" : "opacity-100",
            )}
          />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center">
            <li
              onPointerEnter={(event) => {
                if (event.pointerType !== "mouse") return;
                clearTimeout(closeTimer.current);
                if (!megaOpen) openedByHover.current = true;
                setMegaOpen(true);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType !== "mouse") return;
                openedByHover.current = false;
                closeTimer.current = setTimeout(() => setMegaOpen(false), 150);
              }}
            >
              <button
                type="button"
                aria-expanded={megaOpen}
                aria-controls="mega-menu"
                onClick={() => {
                  // The click that follows a hover-open must not immediately close the menu.
                  if (openedByHover.current) {
                    openedByHover.current = false;
                    return;
                  }
                  setMegaOpen((open) => !open);
                }}
                className="inline-flex min-h-11 items-center gap-1 px-3 font-semibold"
              >
                Machinery
                <ChevronDown
                  aria-hidden
                  className={cn("size-4 transition-transform", megaOpen && "rotate-180")}
                />
              </button>
              {megaOpen && (
                <div
                  id="mega-menu"
                  className="absolute inset-x-(--gutter) top-full rounded-b-lg border-t border-border bg-card text-charcoal shadow-lg"
                >
                  <div className="page-container grid grid-cols-[1fr_18rem] gap-8 py-6">
                    <ul className="grid grid-cols-3 gap-1">
                      {categories.map((category) => (
                        <li key={category.slug}>
                          <Link
                            href={`/machinery/c/${category.slug}`}
                            onClick={() => setMegaOpen(false)}
                            className="group flex min-h-11 items-center gap-3 rounded-md p-1.5 font-semibold hover:bg-accent"
                          >
                            <span className="scale-75">
                              <CategoryIconTile category={category.slug} />
                            </span>
                            {category.name}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          href="/machinery"
                          onClick={() => setMegaOpen(false)}
                          className="flex min-h-11 items-center gap-3 rounded-md p-3 font-bold text-forest underline hover:bg-accent"
                        >
                          View all machinery
                        </Link>
                      </li>
                    </ul>
                    {feature && (
                      <Link
                        href={feature.href}
                        onClick={() => setMegaOpen(false)}
                        data-cat="rice-processing"
                        className="block overflow-hidden rounded-lg border border-border hover:bg-accent"
                      >
                        <div className="machine-stage aspect-video">
                          <Image
                            src={feature.image}
                            alt=""
                            fill
                            sizes="288px"
                            className="object-contain p-2"
                          />
                        </div>
                        <div className="p-3">
                          <p className="font-display font-bold [font-stretch:87.5%]">
                            {feature.name}
                          </p>
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {feature.summary}
                          </p>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </li>
            {primaryNav.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  // These two pages carry the form code, which the home page budget can't absorb.
                  prefetch={
                    link.href === "/contact" || link.href === "/partners" ? false : undefined
                  }
                  aria-current={pathname === link.href ? "page" : undefined}
                  className="inline-flex min-h-11 items-center px-3 font-semibold hover:underline aria-[current=page]:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant={iconVariant}
            size="icon"
            aria-label="Search machinery"
            onClick={openSearch}
          >
            <Search aria-hidden />
          </Button>

          <Button
            asChild
            variant={overDark ? "outline-light" : "outline"}
            size="sm"
            className="relative px-2.5 lg:px-3.5"
          >
            <QuoteListLink data-quote-target>
              <ClipboardList aria-hidden />
              <span className="sr-only lg:not-sr-only">Quote list</span>
              <QuoteCount count={count} />
            </QuoteListLink>
          </Button>

          <Button asChild variant={iconVariant} size="icon" className="hidden lg:inline-flex">
            <a
              href={GENERAL_QUOTE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
            >
              <MessageCircle aria-hidden />
            </a>
          </Button>

          <Button
            variant={iconVariant}
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuMounted(true);
              setMenuOpen(true);
            }}
          >
            <Menu aria-hidden />
          </Button>
        </div>
      </div>

      {searchMounted && <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />}
      {menuMounted && <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />}
    </header>
  );
}
