import type { ReactNode } from "react";

export function SectionHeading({
  title,
  intro,
  action,
}: {
  title: string;
  intro?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
      <div className="max-w-2xl">
        <h2 className="text-3xl md:text-4xl">{title}</h2>
        {intro && <p className="mt-2 text-lg text-muted-foreground">{intro}</p>}
      </div>
      {action}
    </div>
  );
}
