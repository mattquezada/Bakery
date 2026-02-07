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

  const showOrderButton = pageKey !== "farmers_market";

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

    // sections not in the list go to the bottom, alphabetical
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
        {/* SINGLE PAGE-LEVEL ORDER BUTTON */}
        {showOrderButton && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
            <button
              className="btn btnPrimary"
              onClick={() => window.open(getOrderUrl(), "_blank")}
            >
              Order via Google Forms
            </button>
          </div>
        )}

        {loading && <div>Loading…</div>}

        {grouped.map(([section, sectionItems]) => (
          <section key={section}>
            <div className="sectionHead">
              <div className="sectionTitle">{section}</div>
            </div>

            <div className="sectionLine" />

            {sectionItems.map((it) => (
              <div className="row" key={it.id}>
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
                        border: "1px solid #e7e7e7"
                      }}
                    />
                  )}

                  <div>
                    <div className="itemName">{it.name}</div>
                    {it.description && <div className="itemDesc">{it.description}</div>}
                  </div>
                </div>

                {/* RIGHT */}
                <div style={{ fontWeight: 700, fontSize: 18 }}>
                  {it.prices?.[0]}
                </div>
              </div>
            ))}
          </section>
        ))}

        <ContactFooter />
      </div>
    </main>
  );
}
