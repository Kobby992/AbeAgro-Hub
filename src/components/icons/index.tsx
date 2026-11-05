import type { ComponentProps } from "react";

// Custom machinery icons (BUILD_SPEC §2), drawn to match Lucide's 24px grid and 2px stroke.
function Icon({ children, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

type IconProps = ComponentProps<"svg">;

export function TractorIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="7.5" cy="16.5" r="4.5" />
      <circle cx="7.5" cy="16.5" r="1" />
      <circle cx="19" cy="18" r="3" />
      <path d="M4 10V5h8l1.5 7" />
      <path d="M12 12h6.5a2 2 0 0 1 2 2v1.3" />
      <path d="M12 16.5h4" />
      <path d="M17 12V7" />
    </Icon>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
    </Icon>
  );
}

export function LeafIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15Z" />
      <path d="M5 19c3-5 6-8 10-10" />
      <path d="m3 21 2-2" />
    </Icon>
  );
}

export function DropIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3s7 7.2 7 12a7 7 0 0 1-14 0c0-4.8 7-12 7-12Z" />
      <path d="M9 15.5a3 3 0 0 0 2.5 2.7" />
    </Icon>
  );
}

export function RiceGrainIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 22v-9" />
      <ellipse cx="12" cy="6" rx="2.4" ry="4" />
      <ellipse cx="6.5" cy="11" rx="2.2" ry="3.6" transform="rotate(-40 6.5 11)" />
      <ellipse cx="17.5" cy="11" rx="2.2" ry="3.6" transform="rotate(40 17.5 11)" />
    </Icon>
  );
}

export function MillIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 3h12l-3.5 6h-5Z" />
      <path d="M8 9h8v4H8Z" />
      <path d="M5 13h14v8H5Z" />
      <path d="M9 21v-4h6v4" />
    </Icon>
  );
}
