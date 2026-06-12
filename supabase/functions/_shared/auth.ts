import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AuthedUser {
  id: string;
  email?: string;
}

/**
 * Verifies the Authorization header against Supabase Auth.
 * Returns the user if valid, throws otherwise.
 */
export async function requireUser(req: Request): Promise<AuthedUser> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new AuthError("Missing Authorization header", 401);
  }
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user }, error } = await userClient.auth.getUser();
  if (error || !user) {
    throw new AuthError("Invalid or expired token", 401);
  }
  return { id: user.id, email: user.email ?? undefined };
}

/**
 * Returns the verified user or null if the request is anonymous.
 * Throws if a token was provided but is invalid.
 */
export async function getOptionalUser(req: Request): Promise<AuthedUser | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;
  try {
    return await requireUser(req);
  } catch {
    return null;
  }
}

export async function requireRole(
  req: Request,
  roles: Array<"admin" | "moderator" | "writer" | "user">
): Promise<AuthedUser> {
  const user = await requireUser(req);
  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data, error } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .in("role", roles);
  if (error) throw new AuthError("Role lookup failed", 500);
  if (!data || data.length === 0) {
    throw new AuthError("Insufficient privileges", 403);
  }
  return user;
}

/**
 * Allows cron/scheduled invocations via a shared CRON_SECRET header,
 * a service-role JWT (server-to-server), OR an admin user JWT.
 */
export async function requireCronOrAdmin(req: Request): Promise<void> {
  const cronSecret = Deno.env.get("CRON_SECRET");
  const provided = req.headers.get("x-cron-secret");
  if (cronSecret && provided && provided === cronSecret) return;

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization");
  if (serviceKey && authHeader === `Bearer ${serviceKey}`) return;

  await requireRole(req, ["admin"]);
}

export class AuthError extends Error {
  constructor(message: string, public status: number = 401) {
    super(message);
  }
}

export function authErrorResponse(err: unknown, corsHeaders: Record<string, string>) {
  const status = err instanceof AuthError ? err.status : 401;
  const message = err instanceof Error ? err.message : "Unauthorized";
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
