// app/components/MenuPage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { MenuItem, MenuPageKey } from "../lib/types";
import { fetchMenuItems } from "../lib/menuQueries";
import { getOrderUrl } from "../lib/orderLink";
import ContactFooter from "./ContactFooter";

export default function MenuPage({
  pageKey,
  heroTitle,
  heroSubtitle = "AMIAS BAKERY"
}: {
  pageKey: MenuPageKey;
  heroTitle: string;
  heroSubtitle?: string;
}) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Farmers market: no payment options at all
  const showPaymentOptions = pageKey !== "farmers_market";

  // ✅ Farmers market: hide price/cash columns entirely
  const isFarmersMarket = pageKey === "farmers_market";

  useEffect(() => {
    fetchMenuItems(pageKey)
      .then((d) => setItems(d))
      .finally(() => setLoading(false));
  }, [pageKey]);

  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();

    for (const it of items) {
      if (!map.has(it.section)) map.set(it.section, []);
      map.get(it.section)!.push(it);
    }

    const preferredOrder = ["cookies", "sourdough loaves", "cinnamon rolls"];
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

  return (
    <main>
      {/* HERO */}
      <div className="hero">
        <div>
          <h1 className="heroTitle">{heroTitle}</h1>
          <div className="heroSubtitle">{heroSubtitle}</div>
        </div>
      </div>

      <div className="page">
        {/* ✅ TWO BUTTONS: Card checkout + Google Form (NOT on farmers market) */}
        {showPaymentOptions && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              marginBottom: 18,
              flexWrap: "wrap"
            }}
          >
            <a
              href={`/checkout?page=${pageKey}`}
              className="btn btnPrimary"
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              Pay by Card
            </a>

            <button
              className="btn btnPrimary"
              style={{ display: "inline-flex", alignItems: "center" }}
              onClick={() => window.open(getOrderUrl(), "_blank")}
            >
              Order via Google Form
            </button>
          </div>
        )}

        {loading && <div>Loading…</div>}

        {!loading &&
          grouped.map(([section, sectionItems]) => (
            <section key={section}>
              {/* SECTION HEADER: Left title, right Tap/Cash (NOT on farmers market) */}
              <div
                className="sectionHead"
                style={{
                  display: "grid",
                  gridTemplateColumns: isFarmersMarket ? "1fr" : "1fr auto",
                  alignItems: "end"
                }}
              >
                <div className="sectionTitle">{section}</div>

                {/* ✅ Hide header labels ONLY for farmers market */}
                {!isFarmersMarket && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "90px 90px",
                      gap: 18,
                      textAlign: "center",
                      fontWeight: 700,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      fontSize: 14
                    }}
                  >
                    <div>Price</div>
                    <div>Cash Discount</div>
                  </div>
                )}
              </div>

              <div className="sectionLine" />

              {sectionItems.map((it) => (
                <div
                  className="row"
                  key={it.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: isFarmersMarket ? "1fr" : "1fr auto",
                    gap: 18,
                    padding: "14px 0",
                    alignItems: "center"
                  }}
                >
                  {/* LEFT */}
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    {it.image_url && (
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
                    )}

                    <div>
                      <div className="itemName">{it.name}</div>

                      {/* ✅ paragraph breaks from Supabase */}
                      {it.description && (
                        <div className="itemDesc" style={{ whiteSpace: "pre-line" }}>
                          {it.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ✅ RIGHT column only for non-farmers-market pages */}
                  {!isFarmersMarket && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "90px 90px",
                        gap: 18,
                        textAlign: "center",
                        fontWeight: 700,
                        fontSize: 18
                      }}
                    >
                      <div>{it.prices?.[0] ?? ""}</div>
                      <div>{it.prices?.[1] ?? ""}</div>
                    </div>
                  )}
                </div>
              ))}
            </section>
          ))}

        <ContactFooter />
      </div>
    </main>
  );
}
