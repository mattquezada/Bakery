// app/api/checkout/create-square-link/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServerSupabase } from "../../../lib/supabaseServer";

const SQUARE_VERSION = "2026-01-22";

function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`MISSING_${name}`);
  return v;
}

function getBaseUrl(envRaw?: string) {
  const env = (envRaw || "sandbox").toLowerCase();
  return env === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

function getSiteUrl(env?: string) {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`.replace(/\/$/, "");
  return env === "production" ? "https://amiasbakery.com" : "http://localhost:3000";
}

function isEmail(v?: string) {
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isPhone(v?: string) {
  if (!v) return false;
  const digits = (v || "").replace(/\D/g, "");
  return digits.length >= 10;
}

type ReqBody = {
  customer: { name: string; email?: string; phone?: string };
  // client sends only ids + qty; server will fetch prices
  items: Array<{ id: string; qty: number }>;
  // pick a weekend date YYYY-MM-DD and pickup_window is any string stored in pickup_slots
  pickup_date: string;
  pickup_window: string;
  page?: string;
};

export async function POST(req: Request) {
  try {
    const accessToken = required("SQUARE_ACCESS_TOKEN");
    const locationId = required("SQUARE_LOCATION_ID");
    const env = (process.env.SQUARE_ENV || "sandbox").toLowerCase();
    const baseUrl = getBaseUrl(env);

    const body = (await req.json().catch(() => null)) as ReqBody | null;
    if (!body) return NextResponse.json({ error: "Bad request: missing body" }, { status: 400 });

    const customerName = (body.customer?.name || "").trim();
    const customerEmail = (body.customer?.email || "").trim();
    const customerPhone = (body.customer?.phone || "").trim();

    if (!customerName) return NextResponse.json({ error: "Missing customer name" }, { status: 400 });
    if (!customerEmail || !isEmail(customerEmail))
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    if (!customerPhone || !isPhone(customerPhone))
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    for (const it of body.items) {
      if (!it?.id || typeof it.qty !== "number" || !Number.isInteger(it.qty) || it.qty <= 0 || it.qty > 100) {
        return NextResponse.json({ error: "Invalid item id/qty" }, { status: 400 });
      }
    }

    if (!body.pickup_date || !/^\d{4}-\d{2}-\d{2}$/.test(body.pickup_date)) {
      return NextResponse.json({ error: "Invalid pickup_date" }, { status: 400 });
    }

    const pickupWindow = (body.pickup_window || "").trim();
    if (!pickupWindow) {
      return NextResponse.json({ error: "Invalid pickup_window" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // Fetch canonical item rows from Supabase to prevent tampering
    const ids = body.items.map((i) => i.id);
    const { data: dbItems, error: dbErr } = await supabase
      .from("menu_items")
      .select("id,name,prices")
      .in("id", ids);

    if (dbErr) {
      console.error("Failed to load menu_items", dbErr);
      return NextResponse.json({ error: "Failed to load items" }, { status: 500 });
    }

    const byId = new Map((dbItems || []).map((r: any) => [r.id, r]));
    const normalized: Array<{ id: string; name: string; qty: number; unit_price_cents: number }> = [];

    for (const it of body.items) {
      const row = byId.get(it.id);
      if (!row) return NextResponse.json({ error: `Item not found: ${it.id}` }, { status: 400 });

      const priceStr = (row.prices?.[0] ?? "").toString();
      const cleaned = priceStr.replace(/[^0-9.]/g, "");
      const n = Number(cleaned);
      if (!Number.isFinite(n)) return NextResponse.json({ error: `Bad price for item ${row.id}` }, { status: 500 });

      const cents = Math.round(n * 100);
      if (!Number.isInteger(cents) || cents < 0)
        return NextResponse.json({ error: `Invalid price for item ${row.id}` }, { status: 500 });

      normalized.push({ id: row.id, name: row.name, qty: it.qty, unit_price_cents: cents });
    }

    const subtotalCents = normalized.reduce((s, i) => s + i.qty * i.unit_price_cents, 0);

    // Reserve pickup slot atomically via RPC (this validates date+window exist and enforces blackouts)
    const { data: slotId, error: slotErr } = await supabase.rpc("reserve_pickup_slot", {
      p_pickup_date: body.pickup_date,
      p_pickup_window: pickupWindow
    });

    if (slotErr) {
      console.error("Slot RPC error:", slotErr);
      const msg = (slotErr?.message || "").includes("SLOT_FULL") ? "That pickup slot is full." : "Pickup slot unavailable.";
      return NextResponse.json({ error: msg }, { status: 409 });
    }

    // Create a pending order row in Supabase
    const { data: created, error: createErr } = await supabase
      .from("orders")
      .insert({
        status: "pending",
        payment_method: "square",
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        items: normalized,
        subtotal_cents: subtotalCents,
        total_cents: subtotalCents,
        pickup_slot_id: slotId,
        pickup_date: body.pickup_date,
        pickup_window: pickupWindow
      })
      .select("id")
      .single();

    if (createErr || !created?.id) {
      console.error("Failed to create order:", createErr);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    const orderId = created.id as string;

    const lineItems = normalized.map((i) => ({
      name: i.name,
      quantity: String(i.qty),
      base_price_money: {
        amount: i.unit_price_cents,
        currency: "USD"
      }
    }));

    const pickupNote = `Pickup: ${body.pickup_date} (${pickupWindow})`;
    const orderNote = `amias_order:${orderId}\n${pickupNote}`;

    const origin = req.headers.get("origin") || getSiteUrl(env);
    const successUrl = `${origin}/checkout/success?orderId=${orderId}`;

    const idempotencyKey = crypto.randomUUID();

    const squarePayload = {
      idempotency_key: idempotencyKey,
      order: {
        location_id: locationId,
        note: orderNote,
        line_items: lineItems
      },
      checkout_options: {
        redirect_url: successUrl
      }
    };

    const squareRes = await fetch(`${baseUrl}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Square-Version": SQUARE_VERSION,
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(squarePayload)
    });

    const text = await squareRes.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!squareRes.ok) {
      console.error("Square error status:", squareRes.status);
      console.error("Square error body:", data);

      // If Square call fails, release slot (best-effort)
      try {
        await supabase.rpc("release_pickup_slot", { p_slot_id: slotId });
      } catch {
        /* ignore */
      }

      return NextResponse.json(
        { error: "Square request failed", status: squareRes.status, square: data, sent: squarePayload },
        { status: squareRes.status }
      );
    }

    const url = data?.payment_link?.url || data?.paymentLink?.url || data?.url;
    const paymentLinkId = data?.payment_link?.id || data?.paymentLink?.id || data?.id;

    if (!url || !paymentLinkId) {
      console.error("Square success but missing url or id:", data);
      return NextResponse.json({ error: "Square response missing checkout URL/id", square: data }, { status: 500 });
    }

    // Update order with payment link info and mark as created
    const { error: updateErr } = await supabase
      .from("orders")
      .update({
        status: "payment_link_created",
        square_payment_link_id: paymentLinkId,
        square_payment_link_url: url
      })
      .eq("id", orderId);

    if (updateErr) {
      console.error("Failed to update order with link:", updateErr);
    }

    return NextResponse.json({ url, orderId });
  } catch (e: any) {
    console.error("create-square-link route error:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}