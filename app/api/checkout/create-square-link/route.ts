// app/api/checkout/create-square-link/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";


const SQUARE_VERSION = "2026-01-22";

function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`MISSING_${name}`);
  return v;
}

export async function POST(req: Request) {
  try {
    // ✅ Required env
    const accessToken = required("SQUARE_ACCESS_TOKEN");
    const locationId = required("SQUARE_LOCATION_ID");
    const env = (process.env.SQUARE_ENV || "sandbox").toLowerCase();

    const baseUrl =
      env === "production"
        ? "https://connect.squareup.com"
        : "https://connect.squareupsandbox.com";

    // ✅ Read client payload
    const body = await req.json().catch(() => null);

    // Expecting:
    // {
    //   customer: { name, email, phone },
    //   items: [{ name, qty, price_cents }]
    //   subtotal_cents: number
    //   page: "menu" | "seasonal_menu" | ...
    // }
    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Bad request: missing items[]" },
        { status: 400 }
      );
    }

    // ✅ Ensure all amounts are integers in cents
    for (const it of body.items) {
      if (!it?.name || typeof it?.qty !== "number" || typeof it?.price_cents !== "number") {
        return NextResponse.json(
          { error: "Bad request: item fields must be {name, qty:number, price_cents:number}" },
          { status: 400 }
        );
      }
      if (!Number.isInteger(it.price_cents) || it.price_cents < 0) {
        return NextResponse.json(
          { error: `Bad request: price_cents must be an integer >= 0 (got ${it.price_cents})` },
          { status: 400 }
        );
      }
    }

    const idempotencyKey = crypto.randomUUID();

    // ✅ Build Square Checkout Link request
    // (Square is strict: money.amount must be a STRING integer, currency required)
    const lineItems = body.items.map((it: any) => ({
      name: String(it.name),
      quantity: String(it.qty),
      base_price_money: {
        amount: it.price_cents,
        currency: "USD"
      }
    }));

    // IMPORTANT: redirect URL must exist; in sandbox it can be http://localhost
    // in production it should be https://yourdomain
    const origin =
      req.headers.get("origin") ||
      (env === "production" ? "https://amiasbakery.com" : "http://localhost:3000");

    const successUrl = `${origin}/checkout/success`;

    const squarePayload = {
      idempotency_key: idempotencyKey,
      order: {
        location_id: locationId,
        line_items: lineItems
      },
      checkout_options: {
        redirect_url: successUrl
      }
    };

    // ✅ Call Square
    const squareRes = await fetch(`${baseUrl}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Square-Version": SQUARE_VERSION,
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(squarePayload)
    });

    // ✅ Parse response (Square often returns JSON errors)
    const text = await squareRes.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!squareRes.ok) {
      // 🔥 THIS IS WHAT YOU NEED: print Square’s real error(s)
      console.error("Square error status:", squareRes.status);
      console.error("Square error body:", data);

      return NextResponse.json(
        {
          error: "Square request failed",
          status: squareRes.status,
          square: data,
          sent: squarePayload
        },
        { status: squareRes.status }
      );
    }

    // ✅ Success — Square returns a payment_link with a url
    const url =
      data?.payment_link?.url ||
      data?.paymentLink?.url ||
      data?.url;

    if (!url) {
      console.error("Square success but no URL:", data);
      return NextResponse.json(
        { error: "Square response missing checkout URL", square: data },
        { status: 500 }
      );
    }

    return NextResponse.json({ url });
  } catch (e: any) {
    console.error("create-square-link route error:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
