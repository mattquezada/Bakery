// app/checkout/page.tsx
import CheckoutClient from "./CheckoutClient";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckoutPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const raw = sp.page;
  const pageKey = Array.isArray(raw) ? raw[0] : raw;
  return <CheckoutClient pageKey={pageKey ?? "menu"} />;
}
