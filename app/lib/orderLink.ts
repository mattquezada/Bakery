// app/lib/orderLink.ts

// Your Google Form URL (cleaned: removed fbclid tracking)
export const ORDER_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScsDkPkVBCR9B2ZDgQ0aJfMy9H_XjVDFSpySpXUFXqeDt8WsA/viewform";

export function getOrderUrl(): string {
  return ORDER_FORM_URL;
}
