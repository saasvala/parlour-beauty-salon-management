import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Generate unique demo email
    const timestamp = Date.now();
    const demoEmail = `demo_${timestamp}@glamflow.test`;
    const demoPassword = "Demo@12345";

    // 1. Create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
      user_metadata: { full_name: "Demo Salon Owner" },
    });

    if (authError) throw authError;
    const userId = authData.user.id;

    // 2. Assign salon_owner role
    await supabase.from("user_roles").insert({ user_id: userId, role: "salon_owner" });

    // 3. Create salon
    const { data: salonData, error: salonError } = await supabase.from("salons").insert({
      name: "GlamFlow Demo Salon",
      owner_id: userId,
      description: "A premium beauty & wellness salon",
      email: demoEmail,
      phone: "9876543210",
      address: "123 Beauty Lane, Fashion District",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      pincode: "400001",
      gst_number: "27AABCU9603R1ZX",
      is_active: true,
      subscription_status: "trial",
    }).select().single();

    if (salonError) throw salonError;
    const salonId = salonData.id;

    // 4. Create main branch
    await supabase.from("branches").insert({
      salon_id: salonId,
      name: "Main Branch",
      is_main_branch: true,
      address: "123 Beauty Lane",
      city: "Mumbai",
      phone: "9876543210",
    });

    // 5. Create service categories
    const categories = [
      { name: "Hair Care", icon: "scissors", salon_id: salonId, display_order: 1 },
      { name: "Skin Care", icon: "sparkles", salon_id: salonId, display_order: 2 },
      { name: "Makeup", icon: "palette", salon_id: salonId, display_order: 3 },
      { name: "Spa & Wellness", icon: "leaf", salon_id: salonId, display_order: 4 },
      { name: "Nail Art", icon: "gem", salon_id: salonId, display_order: 5 },
    ];
    const { data: catData } = await supabase.from("service_categories").insert(categories).select();

    // 6. Create services
    if (catData) {
      const catMap: Record<string, string> = {};
      catData.forEach((c: any) => { catMap[c.name] = c.id; });

      const services = [
        { name: "Haircut & Styling", price: 500, duration_minutes: 45, category_id: catMap["Hair Care"], salon_id: salonId },
        { name: "Hair Coloring", price: 2500, duration_minutes: 120, category_id: catMap["Hair Care"], salon_id: salonId },
        { name: "Keratin Treatment", price: 5000, duration_minutes: 180, category_id: catMap["Hair Care"], salon_id: salonId },
        { name: "Blow Dry", price: 300, duration_minutes: 30, category_id: catMap["Hair Care"], salon_id: salonId },
        { name: "Facial - Gold", price: 1500, duration_minutes: 60, category_id: catMap["Skin Care"], salon_id: salonId },
        { name: "Facial - Diamond", price: 2500, duration_minutes: 90, category_id: catMap["Skin Care"], salon_id: salonId },
        { name: "Cleanup", price: 800, duration_minutes: 45, category_id: catMap["Skin Care"], salon_id: salonId },
        { name: "Bridal Makeup", price: 15000, duration_minutes: 180, category_id: catMap["Makeup"], salon_id: salonId },
        { name: "Party Makeup", price: 3000, duration_minutes: 90, category_id: catMap["Makeup"], salon_id: salonId },
        { name: "Full Body Massage", price: 2000, duration_minutes: 60, category_id: catMap["Spa & Wellness"], salon_id: salonId },
        { name: "Head Massage", price: 500, duration_minutes: 30, category_id: catMap["Spa & Wellness"], salon_id: salonId },
        { name: "Manicure", price: 600, duration_minutes: 45, category_id: catMap["Nail Art"], salon_id: salonId },
        { name: "Pedicure", price: 800, duration_minutes: 60, category_id: catMap["Nail Art"], salon_id: salonId },
        { name: "Nail Art Design", price: 1200, duration_minutes: 90, category_id: catMap["Nail Art"], salon_id: salonId },
      ];
      await supabase.from("services").insert(services);
    }

    // 7. Create demo customers
    const customers = [
      { full_name: "Priya Sharma", phone: "9876500001", email: "priya@test.com", salon_id: salonId, gender: "female", total_visits: 12, total_spent: 18500, loyalty_points: 185 },
      { full_name: "Ananya Patel", phone: "9876500002", email: "ananya@test.com", salon_id: salonId, gender: "female", total_visits: 8, total_spent: 12000, loyalty_points: 120 },
      { full_name: "Riya Gupta", phone: "9876500003", email: "riya@test.com", salon_id: salonId, gender: "female", total_visits: 5, total_spent: 7500, loyalty_points: 75 },
      { full_name: "Kavita Singh", phone: "9876500004", email: "kavita@test.com", salon_id: salonId, gender: "female", total_visits: 3, total_spent: 4200, loyalty_points: 42 },
      { full_name: "Neha Joshi", phone: "9876500005", email: "neha@test.com", salon_id: salonId, gender: "female", total_visits: 15, total_spent: 22000, loyalty_points: 220 },
    ];
    await supabase.from("customers").insert(customers);

    // 8. Create inventory items
    const inventory = [
      { name: "Shampoo - Premium", sku: "SHP-001", quantity: 25, min_quantity: 5, cost_price: 350, selling_price: 600, unit: "bottle", salon_id: salonId },
      { name: "Conditioner", sku: "CND-001", quantity: 18, min_quantity: 5, cost_price: 400, selling_price: 700, unit: "bottle", salon_id: salonId },
      { name: "Hair Color - Black", sku: "HC-001", quantity: 3, min_quantity: 5, cost_price: 200, selling_price: 450, unit: "tube", salon_id: salonId },
      { name: "Facial Cream", sku: "FC-001", quantity: 10, min_quantity: 3, cost_price: 500, selling_price: 900, unit: "jar", salon_id: salonId },
      { name: "Nail Polish Set", sku: "NP-001", quantity: 2, min_quantity: 5, cost_price: 150, selling_price: 300, unit: "set", salon_id: salonId },
      { name: "Massage Oil", sku: "MO-001", quantity: 8, min_quantity: 3, cost_price: 600, selling_price: 1000, unit: "bottle", salon_id: salonId },
    ];
    await supabase.from("inventory").insert(inventory);

    return new Response(
      JSON.stringify({ 
        success: true, 
        email: demoEmail, 
        password: demoPassword,
        salonName: "GlamFlow Demo Salon",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
