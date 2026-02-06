// app/page.tsx
export default function HomeAbout() {
  return (
    <main className="page">
      <h1 style={{ marginTop: 6, letterSpacing: ".10em", textTransform: "uppercase" }}>
        About Amias Bakery
      </h1>

      <p style={{ color: "#555", lineHeight: 1.7, maxWidth: 820 }}>
        Welcome to Amias Bakery. We bake small-batch breads, cookies, cinnamon rolls, and seasonal specials.
        Browse our menus using the tabs above and place orders through our order form.
      </p>

      <div style={{ marginTop: 22, padding: 18, border: "1px solid #eee", borderRadius: 12, maxWidth: 820 }}>
        <div style={{ fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>How to Order</div>
        <ul style={{ color: "#555", lineHeight: 1.7, marginTop: 10 }}>
          <li>Open Menu / Farmers Market / Seasonal Menu</li>
          <li>Click <b>Order</b> on the item you want</li>
          <li>The item details will be copied to your clipboard and the form will open</li>
        </ul>
      </div>
    </main>
  );
}
