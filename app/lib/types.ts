// app/lib/types.ts
export type MenuPageKey = "menu" | "farmers_market" | "seasonal_menu";

export type MenuItem = {
  id: string;
  page: MenuPageKey;
  section: string;
  name: string;
  description: string | null;
  prices: string[];
  sort_order: number;
  is_active: boolean;

  // ✅ NEW: public image URL from Supabase Storage
  image_url: string | null;
};
