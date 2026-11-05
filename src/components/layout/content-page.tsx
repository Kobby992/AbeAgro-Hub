import type { ReactNode } from "react";

/** Shared top of a content page: clears the fixed header, then the page title and intro. */
export function ContentPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="page-top">
      <div className="page-container py-8 pb-16 md:py-12">
        <h1 className="max-w-4xl text-4xl md:text-5xl">{title}</h1>
        {intro && <p className="mt-3 max-w-prose text-lg text-muted-foreground">{intro}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
