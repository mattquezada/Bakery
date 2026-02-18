// app/page.tsx
import ContactFooter from "./components/ContactFooter";

const homePhotos = [
  { src: "/home/1.jpg", alt: "Bakery photo 1" },
  { src: "/home/2.jpg", alt: "Bakery photo 2" },
  { src: "/home/3.jpg", alt: "Bakery photo 3" },
  //{ src: "/home/4.jpg", alt: "Bakery photo 4" },
  //{ src: "/home/5.jpg", alt: "Bakery photo 5" },
  //{ src: "/home/6.jpg", alt: "Bakery photo 6" },
  //{ src: "/home/7.jpg", alt: "Bakery photo 7" }
];

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
        {/* Bio */}
        <p className="bioP">
          Welcome to the Amias Bakery official website! We’re so glad you’re here 🤍
        </p>

        <p className="bioP">
          We bake sourdough loaves, cookies, cinnamon rolls, and occasionally offer seasonal
          specials! Browse our menu online and place orders online or through our linked google order form.
          Payment and pick up details are noted within.
        </p>

        <p className="bioP">
          Amias Bakery is a fully permitted Cottage Food Operation (CFO) under the state of
          California.
        </p>

        {/* Photo collage */}
        <div className="homeCollage">
          {homePhotos.map((p) => (
            <div key={p.src} className="homeCollageItem">
              <img src={p.src} alt={p.alt} loading="lazy" className="homeCollageImg" />
            </div>
          ))}
        </div>

        <ContactFooter />
      </div>
    </main>
  );
}
