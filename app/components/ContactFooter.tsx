// app/components/ContactFooter.tsx
export default function ContactFooter() {
  return (
    <>
      <div className="contactBar">
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
    </>
  );
}
