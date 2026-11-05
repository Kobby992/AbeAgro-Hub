"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { Button } from "@/components/ui/button";
import { categories } from "@/config/categories";
import { primaryNav } from "@/config/site";
import { GENERAL_QUOTE_LINK } from "@/lib/whatsapp";

const linkClasses =
  "flex min-h-12 items-center border-b border-white/15 font-display text-2xl font-bold";

export default function MobileMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const close = () => onOpenChange(false);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Content
          data-lenis-prevent
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-forest-900 px-4 pt-4 pb-8 text-white duration-250 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-right-8"
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-display text-xl font-bold">Menu</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost-light" size="icon" aria-label="Close menu">
                <X aria-hidden />
              </Button>
            </Dialog.Close>
          </div>
          <nav aria-label="Mobile" className="mt-4 flex flex-col">
            <Link href="/machinery" onClick={close} className={linkClasses}>
              Machinery
            </Link>
            <details className="border-b border-white/15">
              <summary className="flex min-h-12 cursor-pointer items-center font-semibold text-gold">
                Browse by category
              </summary>
              <ul className="pb-3">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/machinery/c/${category.slug}`}
                      onClick={close}
                      className="flex min-h-11 items-center"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
            {primaryNav.map((link) => (
              <Link key={link.href} href={link.href} onClick={close} className={linkClasses}>
                {link.label}
              </Link>
            ))}
          </nav>
          <Button asChild variant="gold" size="lg" className="mt-6">
            <a href={GENERAL_QUOTE_LINK} target="_blank" rel="noopener noreferrer">
              Get a quote on WhatsApp
            </a>
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
