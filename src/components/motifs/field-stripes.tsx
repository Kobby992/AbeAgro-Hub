// The logo's curved field rows, running toward a horizon on the right.
const ROWS = [
  { d: "M-60 470 C 300 345, 720 250, 1260 226", width: 54, tone: "base" },
  { d: "M-60 372 C 250 280, 660 196, 1260 172", width: 26, tone: "gold" },
  { d: "M-60 306 C 230 228, 640 150, 1260 132", width: 18, tone: "soft" },
  { d: "M260 490 C 560 400, 880 330, 1260 300", width: 68, tone: "gold" },
  { d: "M620 500 C 820 440, 1020 396, 1260 376", width: 62, tone: "base" },
] as const;

const TONES = {
  dark: { base: "#0c7a58", gold: "var(--abe-gold)", soft: "var(--abe-leaf)" },
  light: { base: "var(--abe-forest)", gold: "var(--abe-gold)", soft: "var(--abe-leaf)" },
} as const;

/** Signature background motif. Set `draw` to run the stripes' draw-in once on load. */
export function FieldStripes({
  tone = "dark",
  draw = false,
  className,
}: {
  tone?: keyof typeof TONES;
  draw?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 1200 420"
      preserveAspectRatio="xMidYMax slice"
      overflow="visible"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {ROWS.map((row, index) => (
        <path
          key={row.d}
          d={row.d}
          stroke={TONES[tone][row.tone]}
          strokeWidth={row.width}
          pathLength={1}
          className={draw ? "stripe-draw" : undefined}
          style={draw ? { animationDelay: `${index * 120}ms` } : undefined}
        />
      ))}
    </svg>
  );
}
