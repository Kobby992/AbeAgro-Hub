"use client";

import { Check, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type MouseEvent, type ReactNode } from "react";
import { flyToQuote } from "@/components/motion/fly-to-quote";
import { QuickQuoteLink } from "@/components/quote/quick-quote-link";
import { Button } from "@/components/ui/button";
import type { KobbyMessage } from "@/kobby/tools";
import type { CardProduct } from "@/lib/products";
import { reportWhatsAppOpened } from "@/lib/quote-client";
import { cn } from "@/lib/utils";
import { useQuoteStore } from "@/store/quote";

function withBold(text: string): ReactNode[] {
  return text
    .split(/\*\*(.+?)\*\*/g)
    .map((piece, index) => (index % 2 ? <strong key={index}>{piece}</strong> : piece));
}

/** The little Markdown Kobby uses. Built as React elements, so model text can never become HTML. */
function Formatted({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <div className="flex flex-col gap-2">
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n");
        const isList = lines.every((line) => /^\s*[-*•] /.test(line));
        if (isList) {
          return (
            <ul key={blockIndex} className="list-disc pl-5">
              {lines.map((line, index) => (
                <li key={index}>{withBold(line.replace(/^\s*[-*•] /, ""))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={blockIndex} className="whitespace-pre-line">
            {withBold(block)}
          </p>
        );
      })}
    </div>
  );
}

function ProductCard({ card, onNavigate }: { card: CardProduct; onNavigate: () => void }) {
  const [added, setAdded] = useState(false);

  function add(event: MouseEvent<HTMLButtonElement>) {
    flyToQuote(event.currentTarget, () => {
      useQuoteStore.getState().add(card.slug, 1);
      setAdded(true);
    });
  }

  return (
    <article
      data-fly-root
      data-kobby-card={card.slug}
      className="rounded-md border border-border bg-background p-2.5"
    >
      <div className="flex gap-3">
        <Image
          src={card.image}
          alt=""
          width={72}
          height={72}
          className="size-18 shrink-0 rounded-sm bg-card object-contain"
        />
        <div className="min-w-0">
          <h3 className="font-sans text-base leading-snug font-bold">{card.name}</h3>
          {card.specs.slice(0, 1).map((spec) => (
            <p key={spec.label} className="mt-0.5 text-sm text-muted-foreground">
              {spec.label}: {spec.value}
            </p>
          ))}
          {card.needsConfirmation && (
            <p className="mt-0.5 text-sm text-muted-foreground">Details to be confirmed</p>
          )}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        <Button asChild variant="ghost" size="sm" className="px-1">
          <Link href={card.href} prefetch={false} onClick={onNavigate}>
            Details
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="px-1" onClick={add}>
          {added ? (
            <>
              <Check aria-hidden /> Added
            </>
          ) : (
            "+ Add to list"
          )}
        </Button>
        <Button asChild size="sm" className="px-1">
          <QuickQuoteLink slug={card.slug} href={card.quoteHref}>
            Get quote
          </QuickQuoteLink>
        </Button>
      </div>
    </article>
  );
}

function QuoteSummary({
  reference,
  previewText,
  whatsappUrl,
}: {
  reference: string;
  previewText: string;
  whatsappUrl: string;
}) {
  return (
    <section
      aria-label={`Quote request ${reference}`}
      className="rounded-md border-2 border-forest bg-background p-3"
    >
      <h3 className="font-sans text-base font-bold">Quote request {reference}</h3>
      <p className="mt-2 max-h-80 overflow-y-auto text-sm whitespace-pre-line text-muted-foreground">
        {previewText.replaceAll("*", "")}
      </p>
      <Button asChild className="mt-3 w-full">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => reportWhatsAppOpened(reference)}
        >
          <MessageCircle aria-hidden />
          Send to ABE on WhatsApp
        </a>
      </Button>
      <p className="mt-2 text-sm">
        WhatsApp opens with your request filled in. Press send, and our sales team will reply with
        price, availability and delivery.
      </p>
    </section>
  );
}

export function KobbyMessageView({
  message,
  onNavigate,
}: {
  message: KobbyMessage;
  onNavigate: () => void;
}) {
  const isCustomer = message.role === "user";

  return (
    <div className={cn("flex flex-col gap-2", isCustomer && "items-end")}>
      {message.parts.map((part, index) => {
        switch (part.type) {
          case "text":
            return (
              <div
                key={index}
                className={cn(
                  "max-w-[90%] rounded-lg px-3 py-2",
                  isCustomer ? "bg-forest text-white" : "bg-background",
                )}
              >
                <Formatted text={part.text} />
              </div>
            );
          case "tool-showProducts":
            if (part.state !== "output-available") return null;
            return (
              <div key={part.toolCallId} className="flex w-full flex-col gap-2">
                {part.output.cards.map((card) => (
                  <ProductCard key={card.slug} card={card} onNavigate={onNavigate} />
                ))}
              </div>
            );
          case "tool-addToQuoteList":
            if (part.state !== "output-available" || part.output.added.length === 0) return null;
            return (
              <p key={part.toolCallId} className="flex flex-wrap items-center gap-x-2 text-sm">
                <Check aria-hidden className="size-4 text-forest" />
                Added to your quote list:{" "}
                {part.output.added.map((item) => `${item.name} × ${item.qty}`).join(", ")}.
                <Link href="/quote" prefetch={false} onClick={onNavigate} className="underline">
                  View list
                </Link>
              </p>
            );
          case "tool-prepareQuoteRequest":
            if (part.state !== "output-available" || !part.output.ok) return null;
            return (
              <QuoteSummary
                key={part.toolCallId}
                reference={part.output.reference}
                previewText={part.output.previewText}
                whatsappUrl={part.output.whatsappUrl}
              />
            );
          case "tool-handoffToHuman":
            if (part.state !== "output-available") return null;
            return (
              <Button key={part.toolCallId} asChild variant="outline" className="w-full">
                <a href={part.output.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden />
                  Continue with our team on WhatsApp
                </a>
              </Button>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
