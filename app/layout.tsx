// app/layout.tsx
import "./globals.css";
import NavTabs from "./components/NavTabs";

export const metadata = {
  title: "Amias Bakery",
  description: "Amias Bakery website"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NavTabs />
        {children}
      </body>
    </html>
  );
}
