"use client";

import { ZoomIn } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, ViewTransition } from "react";
import type { CategorySlug } from "@/config/categories";

const ImageZoomDialog = dynamic(() => import("./image-zoom-dialog"), { ssr: false });

/** Product hero photo: the target of the card morph, and tap to view full screen and pinch-zoom. */
export function ImageZoom({
  slug,
  category,
  image,
  alt,
}: {
  slug: string;
  category: CategorySlug;
  image: string;
  alt: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  return (
    <div>
      <button
        type="button"
        aria-label={`Zoom in on photo of ${alt}`}
        onClick={() => {
          setMounted(true);
          setOpen(true);
        }}
        className="relative block w-full cursor-zoom-in overflow-hidden rounded-lg"
      >
        <ViewTransition name={`product-${slug}`} share="morph" default="none">
          <div data-cat={category} className="machine-stage">
            <Image
              src={image}
              alt={alt}
              fill
              priority
              sizes="(min-width: 1024px) 600px, 100vw"
              className="object-contain p-6"
            />
          </div>
        </ViewTransition>
        <span className="absolute right-2 bottom-2 flex size-11 items-center justify-center rounded-full bg-card shadow-md">
          <ZoomIn aria-hidden className="size-5 text-forest" />
        </span>
      </button>
      {mounted && <ImageZoomDialog image={image} alt={alt} open={open} onOpenChange={setOpen} />}
    </div>
  );
}
