// Shared caching utilities for AI edge functions
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export function getSupabaseAdmin(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

/**
 * Check cache for a given key. Returns cached response or null.
 */
export async function getCached(
  supabase: SupabaseClient,
  cacheKey: string
): Promise<any | null> {
  const { data } = await supabase
    .from("ai_cache")
    .select("response")
    .eq("cache_key", cacheKey)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  return data?.response ?? null;
}

/**
 * Store a response in cache with a TTL in seconds.
 */
export async function setCache(
  supabase: SupabaseClient,
  cacheKey: string,
  cacheType: string,
  response: any,
  ttlSeconds: number
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

  await supabase.from("ai_cache").upsert(
    {
      cache_key: cacheKey,
      cache_type: cacheType,
      response,
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
    },
    { onConflict: "cache_key" }
  );
}

/**
 * Clean up expired cache entries (call periodically).
 */
export async function cleanExpiredCache(supabase: SupabaseClient): Promise<void> {
  await supabase
    .from("ai_cache")
    .delete()
    .lt("expires_at", new Date().toISOString());
}
