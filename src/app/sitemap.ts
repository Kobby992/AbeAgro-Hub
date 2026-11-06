import type { MetadataRoute } from "next";
import { categories } from "@/config/categories";
import { site } from "@/config/site";
import { solutions } from "@/config/solutions";
import { allProducts } from "@/lib/products";

const PAGES = [
  "",
  "/machinery",
  "/solutions",
  "/how-it-works",
  "/about",
  "/partners",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES,
    ...categories.map(({ slug }) => `/machinery/c/${slug}`),
    ...allProducts.map(({ slug }) => `/machinery/${slug}`),
    ...solutions.map(({ slug }) => `/solutions/${slug}`),
  ].map((pathname) => ({ url: `${site.url}${pathname}` }));
}
