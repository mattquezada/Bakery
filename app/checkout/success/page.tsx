// app/checkout/success/page.tsx
"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ContactFooter from "../../components/ContactFooter";

export default function SuccessPage() {
  const searchParams = useSearchParams();

  const orderId = useMemo(() => {
    // Square can return different params depending on flow
    const candidates = [
      "orderId",
      "order_id",
      "order",
      "paymentId",
      "payment_id",
      "checkoutId",
      "checkout_id",
    ];

    for (const key of candidates) {
      const v = searchParams.get(key);
      if (v) return v;
    }
    return "";
  }, [searchParams]);

  return (
    <main>
      {/* HERO — matches Menu */}
      <div className="hero">
        <div>
          <h1 className="heroTitle">THANK YOU!</h1>
          <div className="heroSubtitle">AMIAS BAKERY</div>
        </div>
      </div>

      <div className="page">
        <p style={{ fontSize: 22, marginTop: 8, marginBottom: 26 }}>
          Your payment is being processed.
        </p>

        <div style={{ fontSize: 22, fontWeight: 800 }}>
          Order ID:{" "}
          <span style={{ fontWeight: 600 }}>
            {orderId ? orderId : "—"}
          </span>
        </div>

        {/* ✅ Footer attached */}
        <ContactFooter />
      </div>
    </main>
  );
}
