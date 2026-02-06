// app/components/NavTabs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Item = { href: string; label: string };

const ITEMS: Item[] = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/farmers-market", label: "Farmers Market" },
  { href: "/seasonal-menu", label: "Seasonal Menu" }
];

export default function NavTabs() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [path]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <>
      <header className="navBar">
        <div className="navInner">
          <Link className="brand" href="/">
            Amias Bakery
          </Link>

          <button
            type="button"
            className="hamburgerBtn"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <span className="hamburgerLines" />
          </button>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`drawerOverlay ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <aside className={`drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="drawerTop">
          <div className="drawerTitle">Menu</div>
          <button
            type="button"
            className="drawerClose"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="drawerNav">
          {ITEMS.map((it) => {
            const active = path === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`drawerLink ${active ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="drawerFooter">
          <div className="drawerFooterLine">IG: @amiasbakery</div>
          <div className="drawerFooterLine">amiasbakery@gmail.com</div>
        </div>
      </aside>
    </>
  );
}
