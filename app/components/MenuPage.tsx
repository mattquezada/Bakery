// app/components/MenuPage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { MenuItem, MenuPageKey } from "../lib/types";
import { fetchMenuItems } from "../lib/menuQueries";
import { getOrderUrl } from "../lib/orderLink";

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
    return Array.from(map.entries());
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
        {loading && <div>Loading…</div>}

        {!loading && grouped.length === 0 && (
          <div style={{ color: "#666" }}>No items yet.</div>
        )}

        {grouped.map(([section, sectionItems]) => (
          <section key={section}>
            {/* SECTION HEADER */}
            <div className="sectionHead">
              <div className="sectionTitle">{section}</div>
            </div>

            <div className="sectionLine" />

            {sectionItems.map((it) => {
              const price = it.prices?.[0] ?? "";

              return (
                <div className="row" key={it.id}>
                  {/* LEFT SIDE: IMAGE + TEXT */}
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
                      {it.description ? (
                        <div className="itemDesc">{it.description}</div>
                      ) : null}
                    </div>
                  </div>

                  {/* RIGHT SIDE: PRICE + ORDER (TIGHT + RIGHT-ALIGNED) */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      justifyContent: "center"
                    }}
                  >
                    {/* PRICE */}
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 18,
                        marginBottom: 6,
                        textAlign: "right"
                      }}
                    >
                      {price}
                    </div>

                    {/* ORDER BUTTON */}
                    <button
                      className="btn btnPrimary"
                      onClick={() => {
                        window.open(getOrderUrl(), "_blank");
                      }}
                    >
                      Order
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        ))}

        {/* CONTACT BAR */}
        <div className="contactBar">
          <div className="contactLeft">Contact Us</div>
          <div className="contactMid">IG: @amiasbakery</div>
          <div className="contactRight">
            Email:
            <div style={{ fontWeight: 700 }}>amiasbakery@gmail.com</div>
          </div>
        </div>

        <div className="note">*Prices subject to change.</div>
      </div>
    </main>
  );
}
