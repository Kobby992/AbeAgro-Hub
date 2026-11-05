import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { GearIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "btn inline-flex shrink-0 items-center justify-center gap-2 rounded-md whitespace-nowrap select-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "btn-primary",
        gold: "btn-gold",
        outline: "btn-outline",
        ghost: "btn-ghost",
        "outline-light": "btn-outline-light",
      },
      // Every size keeps a 44px minimum touch target (BUILD_SPEC §11).
      size: {
        sm: "min-h-11 px-3.5 text-sm [&_svg]:size-4",
        md: "min-h-12 px-5 text-base [&_svg]:size-5",
        lg: "min-h-14 px-7 text-lg [&_svg]:size-5",
        icon: "size-11 [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Shows a turning gear, sets aria-busy and blocks further presses. */
    loading?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (asChild) {
    return (
      <Slot.Root className={classes} {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} aria-busy={loading} {...props}>
      {loading && <GearIcon className="spinner" />}
      {children}
    </button>
  );
}

export { Button, buttonVariants };
