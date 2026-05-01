/**
 * Shared helpers for API contract tests.
 *
 * These tests run against the live Lovable Cloud (Supabase) backend
 * using the publishable anon key. They validate:
 *   - HTTP status codes for happy paths and errors
 *   - Response schemas (via Zod)
 *   - Error-handling shape for invalid input / unauthenticated calls
 *
 * No service-role key is used — tests rely on RLS to enforce that
 * unauthenticated callers get the documented 401/empty/error response.
 */
import { z } from "zod";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export const SUPABASE_ANON_KEY = import.meta.env
  .VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const restUrl = (path: string) => `${SUPABASE_URL}/rest/v1/${path}`;
export const fnUrl = (name: string) =>
  `${SUPABASE_URL}/functions/v1/${name}`;

const baseHeaders = () => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
});

export const restGet = (path: string, init: RequestInit = {}) =>
  fetch(restUrl(path), {
    ...init,
    method: "GET",
    headers: { ...baseHeaders(), ...(init.headers || {}) },
  });

export const restPost = (path: string, body: unknown, init: RequestInit = {}) =>
  fetch(restUrl(path), {
    ...init,
    method: "POST",
    headers: { ...baseHeaders(), Prefer: "return=representation", ...(init.headers || {}) },
    body: JSON.stringify(body),
  });

export const fnInvoke = (
  name: string,
  body: unknown,
  init: RequestInit = {},
) =>
  fetch(fnUrl(name), {
    ...init,
    method: "POST",
    headers: { ...baseHeaders(), ...(init.headers || {}) },
    body: JSON.stringify(body),
  });

/** Standard PostgREST error shape. */
export const PostgrestErrorSchema = z.object({
  code: z.string().optional(),
  message: z.string(),
  details: z.string().nullable().optional(),
  hint: z.string().nullable().optional(),
});

/** Generic edge-function JSON error shape used by this project. */
export const FunctionErrorSchema = z
  .object({ error: z.union([z.string(), z.record(z.any())]) })
  .passthrough();

/** Salon row (minimal — only fields publicly readable matter for contract). */
export const SalonRowSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    is_active: z.boolean().optional(),
  })
  .passthrough();

/** Service row schema. */
export const ServiceRowSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    duration_minutes: z.number(),
    price: z.number(),
    is_active: z.boolean().optional(),
  })
  .passthrough();

/** Subscription plan row schema. */
export const PlanRowSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    price_monthly: z.number(),
    price_yearly: z.number(),
    is_active: z.boolean(),
  })
  .passthrough();

export const skipIfNoBackend = !SUPABASE_URL || !SUPABASE_ANON_KEY;
