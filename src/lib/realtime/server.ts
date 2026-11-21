import "server-only";
import { parseEnv } from "@neon/env";
import {
  createRealtime,
  type SealedLiveQuery,
} from "@neon/realtime/server";
import { drizzleAdapter } from "@neon/realtime-drizzle";
import { getDb } from "@/lib/db";
import { getPostgresDatabaseName } from "@/lib/env/neon";
import {
  buildStudioProjectsLiveQuery,
  serializeLiveProjects,
  type LiveProjectRow,
  type SerializedLiveProjectRow,
} from "@/lib/realtime/queries";
import neonConfig from "../../../neon";

type StudioRealtimeServer = ReturnType<
  typeof createRealtime<ReturnType<typeof buildStudioProjectsLiveQuery>>
>;

const globalForRealtime = globalThis as {
  realtimeServer?: StudioRealtimeServer;
};

export function isRealtimeConfigured(): boolean {
  return Boolean(
    process.env.NEON_REALTIME_SECRET &&
      (process.env.NEXT_PUBLIC_NEON_REALTIME_URL || process.env.NEON_REALTIME_URL)
  );
}

/**
 * Retourne l'émetteur de capacités Neon Realtime (serveur uniquement).
 */
export function getRealtimeServer(): StudioRealtimeServer {
  if (globalForRealtime.realtimeServer) {
    return globalForRealtime.realtimeServer;
  }

  const { realtime } = parseEnv(neonConfig, ["NEON_REALTIME_SECRET"]);
  const dbName = getPostgresDatabaseName();

  globalForRealtime.realtimeServer = createRealtime({
    secret: realtime.secret,
    db: dbName,
    adapter: drizzleAdapter(),
    debugMode: process.env.NODE_ENV !== "production",
  });

  return globalForRealtime.realtimeServer;
}

export interface StudioLiveInitialPayload {
  rows: SerializedLiveProjectRow[];
  sealedQuery: SealedLiveQuery<LiveProjectRow> | null;
  realtimeUrl: string | null;
}

/**
 * Précharge les données initiales et scelle la requête live pour le SSR du dashboard.
 */
export async function loadStudioProjectsLiveData(): Promise<StudioLiveInitialPayload> {
  const db = getDb();
  const query = buildStudioProjectsLiveQuery(db);
  const realtimeUrl =
    process.env.NEXT_PUBLIC_NEON_REALTIME_URL ??
    process.env.NEON_REALTIME_URL ??
    null;

  if (!isRealtimeConfigured() || !realtimeUrl) {
    const rows = await query;
    return {
      rows: serializeLiveProjects(rows),
      sealedQuery: null,
      realtimeUrl: null,
    };
  }

  const [rows, sealedQuery] = await Promise.all([
    query,
    getRealtimeServer().seal({ query }),
  ]);

  return {
    rows: serializeLiveProjects(rows),
    sealedQuery,
    realtimeUrl,
  };
}

