import { supabase } from "./supabase";

/** Возвращает абсолютный URL картинки.
 * Принимает:
 *  - полный http(s) URL,
 *  - server-relative '/storage/v1/object/public/product-images/<key>',
 *  - просто ключ '<key>'.
 */
export function imageUrl(pathOrUrl: string | null | undefined): string {
  const raw = (pathOrUrl || "").trim();
  if (!raw) return "";

  // 1) Готовый абсолютный URL — отдаём как есть
  if (/^https?:\/\//i.test(raw)) return raw;

  // 2) Уже server-relative путь из Storage — достанем ключ
  // допускаем и без начального слэша: 'storage/v1/object/public/product-images/...'
  const m = raw.match(/^(?:https?:\/\/[^/]+)?\/?storage\/v1\/object\/public\/product-images\/(.+)$/i);
  const key = m ? m[1] : raw.replace(/^\/+/, ""); // иначе это и есть ключ

  // 3) Строим правильный публичный URL один раз
  const { data } = supabase.storage.from("product-images").getPublicUrl(key);
  return data?.publicUrl || `/storage/v1/object/public/product-images/${key}`;
}

export function publicImageUrl(key: string): string {
  const { data } = supabase.storage.from("product-images").getPublicUrl(key);
  return data.publicUrl;
}
