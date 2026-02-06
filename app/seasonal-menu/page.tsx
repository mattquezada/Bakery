// app/seasonal-menu/page.tsx
"use client";

import { useEffect, useState } from "react";
import MenuPage from "../components/MenuPage";
import { fetchMenuItems } from "../lib/menuQueries";
import ContactFooter from "../components/ContactFooter";
import type { MenuItem } from "../lib/types";

export default function SeasonalMenuPage() {
  const [hasSeasonal, setHasSeasonal] = useState<boolean | null>(null);

  useEffect(() => {
    fetchMenuItems("seasonal_menu")
      .then((items: MenuItem[]) => setHasSeasonal(items.length > 0))
      .catch(() => setHasSeasonal(false));
  }, []);

  if (hasSeasonal === null) {
    return <main className="page">Loading…</main>;
  }

  if (!hasSeasonal) {
    return (
      <main>
        <div className="hero">
          <div>
            <h1 className="heroTitle">SEASONAL MENU</h1>
            <div className="heroSubtitle">AMIAS BAKERY</div>
          </div>
        </div>

        <div className="page">
          <h2 style={{ letterSpacing: ".1em", textTransform: "uppercase" }}>
            No seasonal items at the moment
          </h2>

          <p style={{ color: "#555", lineHeight: 1.7 }}>
            Check back soon — we update seasonal specials throughout the year.
          </p>

          <ContactFooter />
        </div>
      </main>
    );
  }

  return <MenuPage pageKey="seasonal_menu" heroTitle="SEASONAL MENU" heroSubtitle="AMIAS BAKERY" />;
}
