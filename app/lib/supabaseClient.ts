// app/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !url.startsWith("http")) {
  throw new Error("Missing/invalid NEXT_PUBLIC_SUPABASE_URL in .env.local (must start with https://)");
}
if (!anon) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
}

export const supabase = createClient(url, anon);
