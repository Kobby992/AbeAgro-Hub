"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { SHOW_TOASTER_EVENT } from "@/lib/notify";

const Toaster = dynamic(() => import("sonner").then((module) => module.Toaster), { ssr: false });

export function SiteToaster() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onShow = () => setShow(true);
    window.addEventListener(SHOW_TOASTER_EVENT, onShow);
    return () => window.removeEventListener(SHOW_TOASTER_EVENT, onShow);
  }, []);

  if (!show) return null;

  return (
    <Toaster
      position="top-center"
      offset={88}
      mobileOffset={{ top: 72 }}
      toastOptions={{
        style: {
          background: "var(--abe-forest-900)",
          color: "var(--abe-white)",
          border: "none",
          fontFamily: "var(--font-sans)",
          fontSize: "1rem",
        },
      }}
    />
  );
}
