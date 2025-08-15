import { supabase } from "./supabase";

export type SiteSettings = {
  currency_symbol?: string; // "€"
  hero_title?: string;
  hero_subtitle?: string;
  theme_default?: "light"|"dark"|"pink";
};

export async function getSettings(): Promise<SiteSettings>{
  const { data } = await supabase.from("site_settings").select("data").single();
  return (data?.data || {}) as SiteSettings;
}

export async function saveSettings(patch: SiteSettings){
  const current = await getSettings();
  const next = { ...current, ...patch };
  await supabase.from("site_settings").upsert({ id: 1, data: next }, { onConflict: "id" });
  return next;
}
