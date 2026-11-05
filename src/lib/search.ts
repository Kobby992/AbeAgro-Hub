import Fuse, { type Expression, type FuseResultMatch } from "fuse.js";

export type SearchEntry = {
  slug: string;
  name: string;
  /** The catalogue's full name, when the card shows a shorter one. */
  fullName?: string;
  category: string;
  summary: string;
  uses?: string;
  crops?: string[];
};

export type SearchHit<T> = {
  item: T;
  /** Character ranges of the visible name that matched, for highlighting. */
  nameRanges: [number, number][];
};

const KEYS = [
  { name: "name", weight: 3 },
  { name: "fullName", weight: 3 },
  { name: "category", weight: 2 },
  { name: "crops", weight: 2 },
  { name: "summary", weight: 1 },
  { name: "uses", weight: 1 },
];

// Words people type around what they want, as in "water pump for 2 acres".
const IGNORED = new Set(
  "a an and acre acres business for i in machine machines my need of on the to want with".split(
    " ",
  ),
);

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 1 && !IGNORED.has(word) && !/^\d+$/.test(word));
}

function nameRanges(matches: readonly FuseResultMatch[] | undefined): [number, number][] {
  return (matches ?? [])
    .filter((match) => match.key === "name")
    .flatMap((match) => match.indices.map(([start, end]): [number, number] => [start, end]));
}

/**
 * Typo-tolerant search (BUILD_SPEC §2): "hamer mil" finds the Hammer Mill. Every word must match
 * somewhere; if nothing matches all of them, any word will do. Returns null for an empty query,
 * meaning "no search", as distinct from a search with no results.
 */
export function createProductSearch<T extends SearchEntry>(entries: T[]) {
  const fuse = new Fuse(entries, {
    threshold: 0.3,
    ignoreLocation: true,
    includeMatches: true,
    minMatchCharLength: 2,
    keys: KEYS,
  });

  return (query: string): SearchHit<T>[] | null => {
    const tokens = tokenize(query);
    if (tokens.length === 0) return query.trim() ? [] : null;

    const clauses: Expression[] = tokens.map((token) => ({
      $or: KEYS.map(({ name }) => ({ [name]: token })),
    }));
    const all = fuse.search({ $and: clauses });
    const results = all.length > 0 ? all : fuse.search({ $or: clauses });
    // A machine named for what was typed beats one that only mentions it in its description.
    const nameMatches = ({ matches }: (typeof results)[number]) =>
      (matches ?? []).filter((match) => match.key === "name" || match.key === "fullName").length;
    return [...results]
      .sort((a, b) => nameMatches(b) - nameMatches(a))
      .map((result) => ({
        item: result.item,
        nameRanges: nameRanges(result.matches),
      }));
  };
}
