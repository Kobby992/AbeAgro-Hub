"use client";

import Fuse from "fuse.js";
import { Search } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { useEffect, useMemo, useState } from "react";

type Entry = { slug: string; name: string; category: string; summary: string };

const MAX_RESULTS = 8;

export default function SearchPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/search-index.json")
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<Entry[]>;
      })
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Tolerates typos such as "hamer mil" (BUILD_SPEC §2).
  const fuse = useMemo(
    () =>
      new Fuse(entries, {
        threshold: 0.4,
        ignoreLocation: true,
        keys: [
          { name: "name", weight: 3 },
          { name: "category", weight: 1 },
          { name: "summary", weight: 1 },
        ],
      }),
    [entries],
  );

  const trimmed = query.trim();
  const results = trimmed
    ? fuse.search(trimmed, { limit: MAX_RESULTS }).map((hit) => hit.item)
    : [];
  const close = () => onOpenChange(false);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-forest-900/60" />
        <Dialog.Content
          data-lenis-prevent
          aria-describedby={undefined}
          className="fixed inset-x-0 top-0 z-50 mx-auto max-h-dvh w-full max-w-2xl overflow-y-auto bg-card p-4 text-charcoal shadow-lg sm:top-16 sm:rounded-lg"
        >
          <Dialog.Title className="text-xl">Search machinery</Dialog.Title>
          <Form action="/machinery" onSubmit={close} className="relative mt-3">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
            />
            <label htmlFor="palette-search" className="sr-only">
              Machine, crop or job
            </label>
            <input
              id="palette-search"
              name="q"
              type="search"
              autoFocus
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try rice mill or water pump"
              className="min-h-12 w-full rounded-md border border-input bg-card pr-3 pl-10 text-base"
            />
          </Form>

          <p role="status" className="mt-3 text-sm text-muted-foreground">
            {failed
              ? "Search could not load. Press Enter to search the full catalogue."
              : trimmed
                ? results.length > 0
                  ? `${results.length} ${results.length === 1 ? "machine" : "machines"} found`
                  : "No machines match that. Try another word, such as pump or mill."
                : "Type a machine, crop or job."}
          </p>

          {results.length > 0 && (
            <ul className="mt-2">
              {results.map((result) => (
                <li key={result.slug}>
                  <Link
                    href={`/machinery/${result.slug}`}
                    onClick={close}
                    className="block min-h-11 rounded-md p-2 hover:bg-accent"
                  >
                    <span className="block font-semibold">{result.name}</span>
                    <span className="block text-sm text-muted-foreground">{result.category}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
