import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if(!url || !anon){
  console.warn("Supabase env is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local");
}

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
