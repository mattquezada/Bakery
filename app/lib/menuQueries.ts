// app/lib/menuQueries.ts
import { supabase } from "./supabaseClient";
import type { MenuItem, MenuPageKey } from "./types";

export async function fetchMenuItems(page: MenuPageKey): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("page", page)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as MenuItem[];
}
