// app/layout.tsx
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1
};

export const metadata = {
  title: "Amias Bakery",
  description: "Small-batch breads, cookies, cinnamon rolls, and seasonal specials."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
