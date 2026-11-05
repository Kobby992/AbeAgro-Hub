import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { KobbyPromptButton } from "@/components/kobby/kobby-prompt-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Page Not Found | ABE Agro Hub",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="page-top">
      <div className="page-container max-w-2xl py-12 pb-20 md:py-20">
        <h1 className="text-4xl md:text-5xl">We could not find that page</h1>
        <p className="mt-3 text-lg">It may have moved. Search for the machine you need instead.</p>
        <Form action="/machinery" role="search" className="mt-6 flex gap-2">
          <label htmlFor="not-found-search" className="sr-only">
            Search machinery
          </label>
          <Input
            id="not-found-search"
            name="q"
            type="search"
            placeholder="Try rice mill or water pump"
          />
          <Button type="submit">Search</Button>
        </Form>
        <div className="mt-6 flex flex-wrap gap-3">
          <KobbyPromptButton className={cn(buttonVariants({ variant: "gold" }))}>
            Ask Kobby what you need
          </KobbyPromptButton>
          <Button asChild variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
