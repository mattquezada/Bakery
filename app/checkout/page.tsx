// app/checkout/page.tsx
import CheckoutClient from "./CheckoutClient";

type SearchParams = {
  page?: string;
};

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const pageKey = sp?.page ?? "menu";
  return <CheckoutClient pageKey={pageKey} />;
}
