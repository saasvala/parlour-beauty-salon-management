// RLS Tester Edge Function
// Seeds two isolated salons (Salon A + Salon B) and runs cross-salon RLS checks.
// Returns a structured report of each test step.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface StepResult {
  step: string;
  status: "pass" | "fail" | "info";
  detail: string;
  data?: unknown;
}

const PASSWORD = "RlsTest!2024";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const results: StepResult[] = [];
  const ts = Date.now();

  try {
    // ── 1. Provision Salon A (owner + customer) ──────────────────────────
    const ownerAEmail = `rls-owner-a-${ts}@test.local`;
    const customerAEmail = `rls-customer-a-${ts}@test.local`;
    const ownerBEmail = `rls-owner-b-${ts}@test.local`;

    const { data: ownerA, error: ownerAErr } = await admin.auth.admin.createUser({
      email: ownerAEmail,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Owner A" },
    });
    if (ownerAErr) throw new Error(`Owner A creation: ${ownerAErr.message}`);

    const { data: customerAUser, error: custAErr } = await admin.auth.admin.createUser({
      email: customerAEmail,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Customer A" },
    });
    if (custAErr) throw new Error(`Customer A creation: ${custAErr.message}`);

    const { data: ownerB, error: ownerBErr } = await admin.auth.admin.createUser({
      email: ownerBEmail,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Owner B" },
    });
    if (ownerBErr) throw new Error(`Owner B creation: ${ownerBErr.message}`);

    // Promote owners
    await admin.from("user_roles").delete().eq("user_id", ownerA.user.id);
    await admin.from("user_roles").insert({ user_id: ownerA.user.id, role: "salon_owner" });
    await admin.from("user_roles").delete().eq("user_id", ownerB.user.id);
    await admin.from("user_roles").insert({ user_id: ownerB.user.id, role: "salon_owner" });

    // Create salons
    const { data: salonA, error: salonAErr } = await admin
      .from("salons")
      .insert({ name: `RLS Salon A ${ts}`, owner_id: ownerA.user.id, is_active: true })
      .select()
      .single();
    if (salonAErr) throw new Error(`Salon A: ${salonAErr.message}`);

    const { data: salonB, error: salonBErr } = await admin
      .from("salons")
      .insert({ name: `RLS Salon B ${ts}`, owner_id: ownerB.user.id, is_active: true })
      .select()
      .single();
    if (salonBErr) throw new Error(`Salon B: ${salonBErr.message}`);

    // Create customer record in Salon A linked to customerA's auth user
    const { data: custARow, error: custARowErr } = await admin
      .from("customers")
      .insert({
        salon_id: salonA.id,
        user_id: customerAUser.user.id,
        full_name: "Customer A",
        email: customerAEmail,
        phone: "+910000000001",
      })
      .select()
      .single();
    if (custARowErr) throw new Error(`Customer A row: ${custARowErr.message}`);

    // Service for Salon A
    const { data: serviceA, error: svcAErr } = await admin
      .from("services")
      .insert({
        salon_id: salonA.id,
        name: "RLS Test Haircut",
        price: 500,
        duration_minutes: 30,
        is_active: true,
      })
      .select()
      .single();
    if (svcAErr) throw new Error(`Service A: ${svcAErr.message}`);

    results.push({
      step: "Seed two isolated salons (A & B) with owners and customer",
      status: "pass",
      detail: `Salon A: ${salonA.id.slice(0, 8)}…  Salon B: ${salonB.id.slice(0, 8)}…`,
    });

    // ── 2. Customer A creates appointment in Salon A ─────────────────────
    const customerClient = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false },
    });
    const { error: custLoginErr } = await customerClient.auth.signInWithPassword({
      email: customerAEmail,
      password: PASSWORD,
    });
    if (custLoginErr) throw new Error(`Customer login: ${custLoginErr.message}`);

    const today = new Date().toISOString().slice(0, 10);
    const { data: apt, error: aptErr } = await customerClient
      .from("appointments")
      .insert({
        salon_id: salonA.id,
        customer_id: custARow.id,
        appointment_date: today,
        start_time: "10:00:00",
        end_time: "10:30:00",
        status: "pending",
        total_amount: 500,
        final_amount: 500,
      })
      .select()
      .single();

    if (aptErr || !apt) {
      results.push({
        step: "Customer A inserts appointment in Salon A",
        status: "fail",
        detail: aptErr?.message || "No row returned",
      });
    } else {
      results.push({
        step: "Customer A inserts appointment in Salon A",
        status: "pass",
        detail: `Appointment ${apt.id.slice(0, 8)}… created`,
        data: { appointment_id: apt.id },
      });

      // Add appointment_services link
      await customerClient.from("appointment_services").insert({
        appointment_id: apt.id,
        service_id: serviceA.id,
        price: 500,
        duration_minutes: 30,
        status: "pending",
      });
    }

    // ── 3. Owner A can see appointment in their salon ────────────────────
    const ownerAClient = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false },
    });
    await ownerAClient.auth.signInWithPassword({
      email: ownerAEmail,
      password: PASSWORD,
    });
    const { data: ownerASeesAppts, error: ownerAErr2 } = await ownerAClient
      .from("appointments")
      .select("id, salon_id")
      .eq("salon_id", salonA.id);

    if (ownerAErr2) {
      results.push({
        step: "Owner A reads appointments in own salon",
        status: "fail",
        detail: ownerAErr2.message,
      });
    } else {
      const found = (ownerASeesAppts || []).some((a) => a.id === apt?.id);
      results.push({
        step: "Owner A reads appointments in own salon",
        status: found ? "pass" : "fail",
        detail: found
          ? `Found ${ownerASeesAppts?.length} appointment(s) including the new one`
          : `Appointment NOT visible to owner. Got ${ownerASeesAppts?.length} rows.`,
      });
    }

    // ── 4. Owner B CANNOT see Salon A appointments ───────────────────────
    const ownerBClient = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false },
    });
    await ownerBClient.auth.signInWithPassword({
      email: ownerBEmail,
      password: PASSWORD,
    });
    const { data: ownerBSeesAppts } = await ownerBClient
      .from("appointments")
      .select("id, salon_id")
      .eq("salon_id", salonA.id);

    const leaked = (ownerBSeesAppts || []).length > 0;
    results.push({
      step: "Owner B is BLOCKED from reading Salon A appointments",
      status: leaked ? "fail" : "pass",
      detail: leaked
        ? `❌ LEAK: Owner B saw ${ownerBSeesAppts?.length} row(s) from Salon A!`
        : "✓ RLS correctly hid Salon A data from Owner B",
    });

    // ── 5. Owner B CANNOT update Salon A appointment ─────────────────────
    if (apt) {
      const { error: updateErr, count } = await ownerBClient
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", apt.id)
        .select("id", { count: "exact", head: true });

      // Either error or zero rows updated = pass
      const blocked = !!updateErr || count === 0 || count === null;
      results.push({
        step: "Owner B is BLOCKED from updating Salon A appointment",
        status: blocked ? "pass" : "fail",
        detail: blocked
          ? "✓ Update silently blocked by RLS"
          : `❌ LEAK: Owner B updated ${count} row(s)!`,
      });
    }

    // ── 6. Owner B CANNOT see Salon A customers ──────────────────────────
    const { data: ownerBSeesCustomers } = await ownerBClient
      .from("customers")
      .select("id")
      .eq("salon_id", salonA.id);

    const customerLeak = (ownerBSeesCustomers || []).length > 0;
    results.push({
      step: "Owner B is BLOCKED from reading Salon A customers",
      status: customerLeak ? "fail" : "pass",
      detail: customerLeak
        ? `❌ LEAK: ${ownerBSeesCustomers?.length} customer row(s) exposed!`
        : "✓ Customer data isolated",
    });

    // ── 7. Customer A only sees own appointments ─────────────────────────
    const { data: custSelfAppts } = await customerClient
      .from("appointments")
      .select("id, customer_id");
    const customerSeesOnlyOwn =
      (custSelfAppts || []).length >= 1 &&
      (custSelfAppts || []).every((a) => a.customer_id === custARow.id);
    results.push({
      step: "Customer A only sees their own appointments",
      status: customerSeesOnlyOwn ? "pass" : "fail",
      detail: customerSeesOnlyOwn
        ? `✓ Customer sees ${custSelfAppts?.length} own appointment(s)`
        : `Got ${custSelfAppts?.length} rows, some with foreign customer_ids`,
    });

    // ── Cleanup test users + cascading data ──────────────────────────────
    await admin.from("appointment_services").delete().eq("service_id", serviceA.id);
    if (apt) await admin.from("appointments").delete().eq("id", apt.id);
    await admin.from("services").delete().eq("id", serviceA.id);
    await admin.from("customers").delete().eq("id", custARow.id);
    await admin.from("salons").delete().eq("id", salonA.id);
    await admin.from("salons").delete().eq("id", salonB.id);
    await admin.auth.admin.deleteUser(ownerA.user.id);
    await admin.auth.admin.deleteUser(ownerB.user.id);
    await admin.auth.admin.deleteUser(customerAUser.user.id);

    results.push({
      step: "Cleanup test fixtures",
      status: "info",
      detail: "All seeded users, salons, and appointments removed",
    });

    const passed = results.filter((r) => r.status === "pass").length;
    const failed = results.filter((r) => r.status === "fail").length;

    return new Response(
      JSON.stringify({
        summary: { passed, failed, total: passed + failed },
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
