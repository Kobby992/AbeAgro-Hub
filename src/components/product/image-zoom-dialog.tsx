"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { Dialog } from "radix-ui";
import { Button } from "@/components/ui/button";

export default function ImageZoomDialog({
  image,
  alt,
  open,
  onOpenChange,
}: {
  image: string;
  alt: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Content
          data-lenis-prevent
          aria-describedby={undefined}
          className="fixed inset-0 z-50 [touch-action:pinch-zoom] bg-white"
        >
          <Dialog.Title className="sr-only">{alt}</Dialog.Title>
          <Image src={image} alt={alt} fill sizes="100vw" className="object-contain p-4" />
          <Dialog.Close asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Close photo"
              className="absolute top-3 right-3 bg-card"
            >
              <X aria-hidden />
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
