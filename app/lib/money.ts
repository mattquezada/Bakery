// app/lib/money.ts
export function parsePriceToCents(price: string): number {
  const cleaned = (price || "").replace(/[^0-9.]/g, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}
