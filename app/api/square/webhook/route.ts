// app/api/square/webhook/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServerSupabase } from "../../../lib/supabaseServer";
import { sendOrderEmail } from "../../../lib/email";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-square-hmacsha256-signature") || "";

    // Validate signature (Square expects HMAC of (notificationUrl + body))
    const expected = crypto
      .createHmac("sha256", process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || "")
      .update((process.env.SQUARE_WEBHOOK_NOTIFICATION_URL || "") + rawBody)
      .digest("base64");

    if (!signature || signature !== expected) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const payment = event?.data?.object?.payment;

    // Only care about completed payments
    if (!payment || payment.status !== "COMPLETED") {
      return NextResponse.json({ ok: true });
    }

    const note = payment.note || "";
    const match = note.match(/amias_order:([0-9a-f-]+)/);
    const orderId = match?.[1];

    if (!orderId) {
      // nothing to tie to our DB
      return NextResponse.json({ ok: true });
    }

    const supabase = createServerSupabase();

    // Mark order as PAID (best-effort)
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "PAID", square_payment_id: payment.id })
      .eq("id", orderId);

    if (updateError) {
      console.error("Failed to update order status:", updateError);
    }

    // Fetch order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      console.error("Order not found:", orderErr);
      return NextResponse.json({ ok: true });
    }

    // Fetch order items (if you also store items JSON on orders, this still works)
    const { data: itemsData, error: itemsErr } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    if (itemsErr) {
      console.error("Failed to load order items:", itemsErr);
    }

    const items = itemsData ?? [];

    const itemsList = items.length
      ? items.map((i: any) => `- ${i.qty} x ${i.name}`).join("\n")
      : "- (no line items)";

    const totalDollars = ((order.subtotal_cents ?? 0) / 100).toFixed(2);

    // ✅ FIX: Build pickup info from pickup_date + pickup_window (not pickup_note)
    const pickupText =
      order.pickup_date && order.pickup_window
        ? `${order.pickup_date} (${order.pickup_window})`
        : "-";

    const text =
      `NEW PAID ORDER\n\n` +
      `Name: ${order.customer_name}\n` +
      `Email: ${order.customer_email || "-"}\n` +
      `Phone: ${order.customer_phone || "-"}\n` +
      `Pickup: ${pickupText}\n\n` +
      `Items:\n${itemsList}\n\n` +
      `Total: $${totalDollars}\n` +
      `Payment: CARD\n` +
      `Square Payment ID: ${payment.id}\n`;

    // Send notification email (to bakery inbox)
    // 👇 REPLACE THE EMAIL SEND SECTION BELOW
try {
  console.log(
    "About to send email via Resend. to=",
    process.env.ORDERS_TO_EMAIL || "amiasbakery@gmail.com"
  );

  await sendOrderEmail({
    to: process.env.ORDERS_TO_EMAIL || "amiasbakery@gmail.com",
    subject: `New PAID Order — ${order.customer_name}`,
    text
  });

  console.log("Resend email sendOrderEmail() returned success");
} catch (e: any) {
  console.error("Resend sendOrderEmail() failed:", e?.message || e, e);
}

return NextResponse.json({ ok: true });
} catch (err: any) {
  console.error("Webhook handler error:", err);
  return NextResponse.json({ error: err?.message || "unknown error" }, { status: 500 });
  }
}  