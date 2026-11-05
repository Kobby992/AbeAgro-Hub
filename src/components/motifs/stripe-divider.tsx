import { cn } from "@/lib/utils";

/**
 * Curved section divider. Place it at the top of the next section and set `fill` to that
 * section's background colour; the gold and leaf rows ride the curve above it.
 */
export function StripeDivider({
  fill = "var(--abe-forest-900)",
  flip = false,
  className,
}: {
  fill?: string;
  flip?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 1440 96"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("block h-12 w-full md:h-20", flip && "-scale-x-100", className)}
    >
      <path d="M0 40C360 8 900 -4 1440 28V44C900 12 360 22 0 54Z" fill="var(--abe-gold)" />
      <path d="M0 54C360 22 900 12 1440 44V56C900 24 360 34 0 66Z" fill="var(--abe-leaf)" />
      <path d="M0 66C360 34 900 24 1440 56V96H0Z" fill={fill} />
    </svg>
  );
}
