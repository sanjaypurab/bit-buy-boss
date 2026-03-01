import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    const { items, email, instructions } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "No items provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const totalUsd = items.reduce(
      (sum: number, i: { price: number }) => sum + i.price,
      0
    );

    if (totalUsd <= 0 || totalUsd > 100000) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create NOWPayments invoice
    const nowApiKey = Deno.env.get("NOWPAYMENTS_API_KEY");
    if (!nowApiKey) {
      throw new Error("Payment gateway not configured");
    }

    const projectUrl = Deno.env.get("SUPABASE_URL")!;
    const ipnCallbackUrl = `${projectUrl}/functions/v1/payment-webhook`;

    const invoiceRes = await fetch(
      "https://api.nowpayments.io/v1/invoice",
      {
        method: "POST",
        headers: {
          "x-api-key": nowApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price_amount: totalUsd,
          price_currency: "usd",
          pay_currency: "btc",
          ipn_callback_url: ipnCallbackUrl,
          order_description: `Order: ${items.map((i: { name: string }) => i.name).join(", ")}`,
          success_url: `${req.headers.get("origin") || ""}/dashboard`,
          cancel_url: `${req.headers.get("origin") || ""}/cart`,
        }),
      }
    );

    const invoiceBody = await invoiceRes.text();
    if (!invoiceRes.ok) {
      console.error("NOWPayments error:", invoiceBody);
      throw new Error("Failed to create payment invoice");
    }

    const invoice = JSON.parse(invoiceBody);

    // Create order records in Supabase
    const orderInserts = items.map((item: { id: string; name: string; price: number; btc_price?: number; btc_address?: string }) => ({
      user_id: userId,
      service_id: item.id,
      btc_address: item.btc_address || null,
      btc_amount: item.btc_price || null,
      status: "pending",
      payment_status: "pending",
      payment_id: String(invoice.id),
      customer_email: email,
      instructions: instructions?.trim() || null,
    }));

    const { error: insertError } = await supabase
      .from("orders")
      .insert(orderInserts);
    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        payment_url: invoice.invoice_url,
        payment_id: invoice.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("create-payment error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
