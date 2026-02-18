// app/checkout/CheckoutClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { MenuItem, MenuPageKey } from "../lib/types";
import { fetchMenuItems } from "../lib/menuQueries";

function parsePriceToCents(price: string): number {
  // supports "$12", "12", "$12.50", "12.50"
  const cleaned = (price || "").replace(/[^0-9.]/g, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export default function CheckoutClient({ pageKey }: { pageKey: MenuPageKey | string }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchMenuItems(pageKey as MenuPageKey)
      .then((d) => setItems(d))
      .finally(() => setLoading(false));
  }, [pageKey]);

  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();

    for (const it of items) {
      const section = it.section || "Menu";
      if (!map.has(section)) map.set(section, []);
      map.get(section)!.push(it);
    }

    const preferredOrder = [
      "cookies",
      "sourdough loaves",
      "cinnamon rolls"
    ];

    const entries = Array.from(map.entries());

    entries.sort(([a], [b]) => {
      const aKey = a.toLowerCase().trim();
      const bKey = b.toLowerCase().trim();

      const aIdx = preferredOrder.indexOf(aKey);
      const bIdx = preferredOrder.indexOf(bKey);

      if (aIdx === -1 && bIdx === -1) return aKey.localeCompare(bKey);
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;

      return aIdx - bIdx;
    });

    return entries;
  }, [items]);

  function changeQty(id: string, delta: number) {
    setCart((prev) => {
      const next = { ...prev };
      const current = next[id] ?? 0;
      const updated = current + delta;
      if (updated <= 0) delete next[id];
      else next[id] = updated;
      return next;
    });
  }

  const cartItems = useMemo(() => {
    const idToItem = new Map(items.map((i) => [i.id, i]));
    return Object.entries(cart)
      .map(([id, qty]) => {
        const it = idToItem.get(id);
        if (!it) return null;
        const unitPrice = it.prices?.[0] ?? "";
        const unit_price_cents = parsePriceToCents(unitPrice);
        return {
          id,
          name: it.name,
          qty,
          unit_price_cents
        };
      })
      .filter(Boolean) as Array<{ id: string; name: string; qty: number; unit_price_cents: number }>;
  }, [cart, items]);

  const subtotalCents = useMemo(() => {
    return cartItems.reduce((sum, i) => sum + i.qty * i.unit_price_cents, 0);
  }, [cartItems]);

  async function checkoutWithSquare() {
  setError(null);

  const nameValue = name.trim();
  const emailValue = email.trim();
  const phoneValue = phone.trim();

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Basic phone regex (10+ digits; allows spaces, +, parentheses, dashes)
  // Then we also enforce "at least 10 digits" by counting digits.
  const phoneCharsOk = /^[0-9()\-\s+]+$/;

  if (!nameValue) return setError("Please enter your name.");
  if (!emailValue || !phoneValue) {
    return setError("Please enter both an email and phone number.");
  }

  if (!emailRegex.test(emailValue)) {
    return setError("Please enter a valid email address.");
  }

  if (!phoneCharsOk.test(phoneValue)) {
    return setError("Please enter a valid phone number.");
  }

  const digitCount = (phoneValue.match(/\d/g) || []).length;
  if (digitCount < 10) {
    return setError("Please enter a valid phone number.");
  }

  if (cartItems.length === 0) return setError("Please add at least one item.");

  const payloadItems = cartItems.map((i) => ({
    name: i.name,
    qty: i.qty,
    price_cents: i.unit_price_cents
  }));

  setCreating(true);
  try {
    const res = await fetch("/api/checkout/create-square-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: pageKey,
        customer: {
          name: nameValue,
          email: emailValue,
          phone: phoneValue
        },
        items: payloadItems
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg =
        data?.error ||
        data?.message ||
        `Square request failed (${res.status})`;
      setError(String(msg));
      return;
    }

    const url = data?.checkoutUrl || data?.url;
    if (!url) {
      setError("Square response missing checkout URL.");
      return;
    }

    window.location.href = url;
  } catch (e: any) {
    setError(e?.message || "Something went wrong.");
  } finally {
    setCreating(false);
  }
}

  return (
    <main>
      {/* HERO — matches Menu */}
      <div className="hero">
        <div>
          <h1 className="heroTitle">CHECKOUT</h1>
          <div className="heroSubtitle">AMIAS BAKERY</div>
        </div>
      </div>

      <div className="page">
        {/* Customer fields (keep simple; styling uses your existing inputs) */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            style={{ flex: "1 1 220px", padding: 10, border: "1px solid #cfcfcf", borderRadius: 6 }}
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={{ flex: "1 1 220px", padding: 10, border: "1px solid #cfcfcf", borderRadius: 6 }}
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            style={{ flex: "1 1 220px", padding: 10, border: "1px solid #cfcfcf", borderRadius: 6 }}
          />
        </div>

        {error ? (
          <div style={{ color: "#b00020", marginBottom: 14, fontWeight: 700 }}>
            {error}
          </div>
        ) : null}

        {/* Subtotal */}
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>
          Subtotal: ${(subtotalCents / 100).toFixed(2)}
        </div>

        {/* Button */}
        <button
          className="btn btnPrimary"
          onClick={checkoutWithSquare}
          disabled={creating}
        >
          {creating ? "Creating checkout..." : "Checkout with Square"}
        </button>

        <div style={{ height: 26 }} />

        {loading && <div>Loading…</div>}

        {!loading &&
          grouped.map(([section, sectionItems]) => (
            <section key={section}>
              {/* SECTION HEADER — Menu style with a single PRICE label */}
              <div className="sectionHead" style={{ alignItems: "flex-end" }}>
                <div className="sectionTitle">{section}</div>

                {/* right-side column label */}
                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    justifyContent: "flex-end",
                    minWidth: 220,
                    fontWeight: 700,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "#111",
                    paddingBottom: 6
                  }}
                >
                  PRICE
                </div>
              </div>

              <div className="sectionLine" />

              {sectionItems.map((it) => {
                const unitPrice = it.prices?.[0] ?? "";
                const qty = cart[it.id] ?? 0;

                return (
                  <div className="row" key={it.id}>
                    {/* LEFT: image + name */}
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      {it.image_url ? (
                        <img
                          src={it.image_url}
                          alt={it.name}
                          loading="lazy"
                          style={{
                            width: 84,
                            height: 84,
                            objectFit: "cover",
                            borderRadius: 10,
                            border: "1px solid #e7e7e7",
                            flex: "0 0 auto"
                          }}
                        />
                      ) : null}

                      <div>
                        <div className="itemName">{it.name}</div>
                        {it.description ? <div className="itemDesc">{it.description}</div> : null}
                      </div>
                    </div>

                    {/* RIGHT: price + qty controls */}
                    <div style={{ marginLeft: "auto", minWidth: 220, textAlign: "right" }}>
                      <div style={{ fontWeight: 700, fontSize: 22 }}>{unitPrice}</div>

                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          gap: 12,
                          justifyContent: "flex-end",
                          alignItems: "center"
                        }}
                      >
                        <button
                          className="qtyBtn"
                          onClick={() => changeQty(it.id, -1)}
                          aria-label={`Decrease ${it.name}`}
                        >
                          −
                        </button>

                        <span className="qtyNumber">{qty}</span>

                        <button
                          className="qtyBtn"
                          onClick={() => changeQty(it.id, 1)}
                          aria-label={`Increase ${it.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          ))}
      </div>
    </main>
  );
}
