// app/page.tsx
import ContactFooter from "./components/ContactFooter";

export default function HomePage() {
  return (
    <main>
      <div className="hero">
        <div>
          <h1 className="heroTitle">HOME</h1>
          <div className="heroSubtitle">AMIAS BAKERY</div>
        </div>
      </div>

      <div className="page">
        <p style={{ color: "#555", lineHeight: 1.8, maxWidth: 900 }}>
          Welcome to Amias Bakery. We bake small-batch breads, cookies, cinnamon rolls,
          and seasonal specials. Browse our menus and place
          orders through our order form.
        </p>

        <ContactFooter />
      </div>
    </main>
  );
}
