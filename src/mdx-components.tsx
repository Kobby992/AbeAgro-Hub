import type { MDXComponents } from "mdx/types";

// Required by @next/mdx. Guide styling comes from the .prose-abe class on the wrapper.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return components;
}
