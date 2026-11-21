"use client";

import { useState, type ReactNode } from "react";
import { createRealtimeClient } from "@neon/realtime/client";
import { RealtimeProvider } from "@neon/realtime-react";

interface RealtimeRootProps {
  realtimeUrl: string;
  children: ReactNode;
}

export function RealtimeRoot({ realtimeUrl, children }: RealtimeRootProps) {
  const [client] = useState(() => createRealtimeClient({ url: realtimeUrl }));
  return <RealtimeProvider client={client}>{children}</RealtimeProvider>;
}

