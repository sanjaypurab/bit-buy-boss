import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.224.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.224.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function verifySignature(
  body: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) return false;

  // NOWPayments IPN signature: HMAC-SHA512 of sorted JSON
  const parsed = JSON.parse(body);
  const sorted = sortObject(parsed);
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(JSON.stringify(sorted)));
  const computed = encodeHex(new Uint8Array(sig));
  return computed === signature.toLowerCase();
}

function sortObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    if (obj[key] !== null && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      sorted[key] = sortObject(obj[key] as Record<string, unknown>);
    } else {
      sorted[key] = obj[key];
    }
  }
  return sorted;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const ipnSecret = Deno.env.get("NOWPAYMENTS_IPN_SECRET");

    if (!ipnSecret) {
      console.error("IPN secret not configured");
      return new Response("Server misconfigured", { status: 500, headers: corsHeaders });
    }

    // Verify webhook signature
    const signature = req.headers.get("x-nowpayments-sig");
    const valid = await verifySignature(body, signature, ipnSecret);
    if (!valid) {
      console.error("Invalid IPN signature");
      return new Response("Invalid signature", { status: 403, headers: corsHeaders });
    }

    const payload = JSON.parse(body);
    console.log("IPN received:", JSON.stringify(payload));

    const {
      payment_status,
      invoice_id,
      order_id,
      actually_paid,
      pay_amount,
    } = payload;

    if (!invoice_id && !order_id) {
      return new Response("No invoice/order ID", { status: 400, headers: corsHeaders });
    }

    // Use service role to bypass RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const paymentId = String(invoice_id || order_id);

    // Check if already processed to prevent duplicates
    const { data: existingOrders } = await supabase
      .from("orders")
      .select("id, payment_status")
      .eq("payment_id", paymentId)
      .limit(1);

    if (existingOrders && existingOrders.length > 0 && existingOrders[0].payment_status === "paid") {
      console.log("Already processed, skipping:", paymentId);
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    // Map NOWPayments statuses to our statuses
    let newStatus: string;
    if (payment_status === "finished" || payment_status === "confirmed") {
      newStatus = "paid";
    } else if (
      payment_status === "confirming" ||
      payment_status === "sending" ||
      payment_status === "partially_paid"
    ) {
      newStatus = "confirming";
    } else if (
      payment_status === "failed" ||
      payment_status === "refunded" ||
      payment_status === "expired"
    ) {
      newStatus = payment_status;
    } else {
      newStatus = "pending";
    }

    // Update all orders with this payment_id
    const updateData: Record<string, unknown> = {
      payment_status: newStatus,
      status: newStatus === "paid" ? "paid" : newStatus,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === "paid") {
      updateData.payment_confirmed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("payment_id", paymentId);

    if (updateError) {
      console.error("Failed to update order:", updateError);
      return new Response("DB update failed", { status: 500, headers: corsHeaders });
    }

    console.log(`Orders with payment_id ${paymentId} updated to: ${newStatus}`);

    // If paid, activation logic would go here
    // e.g., granting access, sending confirmation emails, etc.
    if (newStatus === "paid") {
      console.log("Payment confirmed! Service activation triggered for:", paymentId);
      // Future: send confirmation email, unlock service access, etc.
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }
});
