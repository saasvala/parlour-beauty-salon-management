/**
 * Contract tests for Supabase PostgREST endpoints.
 *
 * Validates status codes, response schemas, and error-handling
 * for the public API surface used by the customer booking flow
 * and admin dashboards.
 *
 * Anonymous callers should:
 *   - read public/active rows where RLS allows (200 + array)
 *   - receive an empty array (not 500) when RLS blocks rows
 *   - receive 401/PGRST error JSON when missing apikey
 *   - receive 4xx + structured error JSON for invalid filters or writes
 */
import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  restGet,
  restUrl,
  SUPABASE_ANON_KEY,
  PostgrestErrorSchema,
  PlanRowSchema,
  skipIfNoBackend,
} from "./helpers";

const d = skipIfNoBackend ? describe.skip : describe;

d("PostgREST contract: status & schemas", () => {
  it("RLS-protected tables reject anonymous reads with structured error JSON (never 5xx, never HTML)", async () => {
    // Contract: every tenant-scoped table must respond with 401/403 and a
    // PostgREST error envelope when called anonymously. This is the
    // hardened post-RLS-audit behaviour — no row leakage, no 500s.
    const tables = [
      "salons",
      "services",
      "service_categories",
      "appointments",
      "customers",
      "staff",
      "subscription_plans",
      "profiles",
      "invoices",
      "payments",
    ];
    for (const t of tables) {
      const res = await restGet(`${t}?select=id&limit=1`);
      expect([401, 403]).toContain(res.status);
      expect(res.headers.get("content-type") || "").toContain("application/json");
      const json = await res.json();
      const parsed = PostgrestErrorSchema.safeParse(json);
      expect(parsed.success, `${t} returned non-PG error: ${JSON.stringify(json)}`).toBe(true);
    }
  });

  it("PostgREST root → 200 with OpenAPI-ish JSON (sanity check API is up)", async () => {
    const res = await restGet("");
    expect(res.status).toBe(200);
    const json = await res.json();
    // PostgREST returns a swagger-style document at the root.
    expect(typeof json).toBe("object");
    expect(json).not.toBeNull();
  });
});

d("PostgREST contract: error handling", () => {
  it("missing apikey → 401 + Postgrest error JSON", async () => {
    const res = await fetch(restUrl("salons?select=id"));
    expect(res.status).toBe(401);
    const json = await res.json();
    const parsed = PostgrestErrorSchema.safeParse(json);
    expect(parsed.success).toBe(true);
  });

  it("unknown table → 404 + Postgrest error JSON", async () => {
    const res = await restGet("__definitely_not_a_table__?select=*");
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(PostgrestErrorSchema.safeParse(json).success).toBe(true);
  });

  it("invalid filter operator → 400 + Postgrest error JSON", async () => {
    const res = await restGet("salons?select=id&id=notarealop.foo");
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
    const json = await res.json();
    expect(PostgrestErrorSchema.safeParse(json).success).toBe(true);
  });

  it("anonymous INSERT into appointments → 4xx (RLS denies)", async () => {
    const res = await fetch(restUrl("appointments"), {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        salon_id: "00000000-0000-0000-0000-000000000000",
        customer_id: "00000000-0000-0000-0000-000000000000",
        appointment_date: "2030-01-01",
        start_time: "10:00:00",
        end_time: "11:00:00",
      }),
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
    const json = await res.json().catch(() => ({}));
    // Either RLS error or FK/constraint error — both must match PG error shape
    expect(PostgrestErrorSchema.safeParse(json).success).toBe(true);
  });
});
