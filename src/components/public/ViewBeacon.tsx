"use client";

import * as React from "react";

interface ViewBeaconProps {
  eventType: "page_view" | "project_view" | "article_view";
  targetSlug?: string;
  targetId?: string;
}

export function ViewBeacon({
  eventType,
  targetSlug,
  targetId,
}: ViewBeaconProps) {
  React.useEffect(() => {
    try {
      const payload = JSON.stringify({ eventType, targetSlug, targetId });
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon("/api/public/analytics", payload);
      }
    } catch {
      // Non bloquant sur connexion mobile faible
    }
  }, [eventType, targetSlug, targetId]);

  return null;
}

