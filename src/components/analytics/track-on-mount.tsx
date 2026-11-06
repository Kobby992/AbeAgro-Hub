"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvents } from "@/lib/analytics";

/** Records one event when a server-rendered page opens. */
export function TrackOnMount<Name extends "product_viewed" | "compare_used">({
  name,
  props,
}: {
  name: Name;
  props: AnalyticsEvents[Name];
}) {
  const serialized = JSON.stringify(props);
  useEffect(() => {
    track(name, JSON.parse(serialized) as AnalyticsEvents[Name]);
  }, [name, serialized]);
  return null;
}
