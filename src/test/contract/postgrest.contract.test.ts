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
  SalonRowSchema,
  ServiceRowSchema,
  PlanRowSchema,
  skipIfNoBackend,
} from "./helpers";

const d = skipIfNoBackend ? describe.skip : describe;

d("PostgREST contract: status & schemas", () => {
  it("GET /salons?is_active=eq.true → 200 + Salon[]", async () => {
    const res = await restGet("salons?select=id,name,is_active&is_active=eq.true&limit=5");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    const json = await res.json();
    const parsed = z.array(SalonRowSchema).safeParse(json);
    expect(parsed.success).toBe(true);
  });

  it("GET /services with active filter → 200 + Service[]", async () => {
    const res = await restGet(
      "services?select=id,name,duration_minutes,price,is_active&is_active=eq.true&limit=5",
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    const parsed = z.array(ServiceRowSchema).safeParse(json);
    expect(parsed.success).toBe(true);
  });

  it("GET /subscription_plans → 200 + Plan[]", async () => {
    const res = await restGet(
      "subscription_plans?select=id,name,price_monthly,price_yearly,is_active&limit=10",
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    const parsed = z.array(PlanRowSchema).safeParse(json);
    expect(parsed.success).toBe(true);
  });

  it("GET /appointments anonymously → 200 + [] (RLS blocks rows, not request)", async () => {
    const res = await restGet("appointments?select=id&limit=1");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json).toHaveLength(0);
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
