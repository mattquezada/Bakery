// app/checkout/success/page.tsx

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function SuccessPage({ searchParams }: Props) {
  const raw = searchParams?.orderId;
  const orderId = Array.isArray(raw) ? raw[0] : raw;

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
        <h2 style={{ letterSpacing: ".06em", textTransform: "uppercase" }}>
          Your payment is being processed.
        </h2>

        <div style={{ marginTop: 18, fontSize: 20 }}>
          <strong>Order ID:</strong>{" "}
          <span style={{ color: "#333" }}>{orderId || "—"}</span>
        </div>

        <p style={{ marginTop: 18, color: "#555", lineHeight: 1.7 }}>
          You should receive an email confirmation shortly. If you don’t see it,
          check spam or contact us.
        </p>

        {/* FOOTER (manually inserted) */}
        <div className="contactBar" style={{ marginTop: 60 }}>
          <div className="contactLeft">Contact Us</div>

          <div className="contactMid">
            IG:{" "}
            <a
              href="https://www.instagram.com/amiasbakery/"
              target="_blank"
              rel="noopener noreferrer"
              className="contactLink"
            >
              @amiasbakery
            </a>
          </div>

          <div className="contactRight">
            Email:
            <div>
              <a
                href="mailto:amiasbakery@gmail.com"
                className="contactLink"
              >
                amiasbakery@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
