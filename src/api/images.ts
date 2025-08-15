import { supabase } from "./supabase";

/** Возвращает абсолютный URL для картинки.
 *  Принимает: полный URL или path из бакета product-images.
 */
export function imageUrl(pathOrUrl: string | null | undefined): string {
  const v = (pathOrUrl || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  const { data } = supabase.storage.from("product-images").getPublicUrl(v);
  return data?.publicUrl || `/storage/v1/object/public/product-images/${v}`;
}

/** Если хочешь, можно явный публичный URL по path */
export function publicImageUrl(path: string): string {
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
