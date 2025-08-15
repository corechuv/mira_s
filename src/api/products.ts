import { supabase } from "./supabase";
import { imageUrl } from "./images";
import type { ProductUI } from "./types";

type ImgRow = { path?: string | null; url?: string | null; sort?: number | null };

function mapRow(p: any): ProductUI {
  const imgs: string[] = (Array.isArray(p.product_images) ? p.product_images as ImgRow[] : [])
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    .map(i => imageUrl(i.path || i.url));
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: p.price,
    old_price: p.old_price,
    rating: p.rating ?? 0,
    rating_count: p.rating_count ?? 0,
    category_l1: p.category_l1,
    category_l2: p.category_l2,
    category_l3: p.category_l3,
    short: p.short ?? null,
    images: imgs,
  };
}

const BASE = `
  id, slug, title, price, old_price, rating, rating_count,
  category_l1, category_l2, category_l3, short
`.trim();

/** Внутренний хелпер: сначала пробуем с path, при 42703 — без path */
async function selectProducts(query: any){
  // ВЕРНО: вложенная связь через скобки
  let q = query.select(`${BASE}, product_images(path,url,sort)`);
  let { data, error } = await q;
  if (error && (error.code === '42703' || /path\b/.test(String(error.message)))) {
    // фоллбек для старой схемы/кэша
    const q2 = query.select(`${BASE}, product_images(url,sort)`);
    const res2 = await q2;
    data = res2.data; error = res2.error;
  }
  if (error) throw error;
  return (data || []).map(mapRow);
}

/** Список товаров (опции: ids, limit) */
export async function listProducts(opts?: { ids?: string[]; limit?: number }): Promise<ProductUI[]> {
  let q = supabase.from("products").select().order("created_at", { ascending: false });
  if (opts?.ids?.length) q = q.in("id", opts.ids);
  if (opts?.limit) q = q.limit(opts.limit);
  return await selectProducts(q);
}

/** По slug один товар */
export async function getProductBySlug(slug: string): Promise<ProductUI | null> {
  const q = supabase.from("products").select().eq("slug", slug).limit(1);
  const rows = await selectProducts(q);
  return rows[0] ?? null;
}

/** По массиву id (для сравнения/избранного) */
export async function listProductsByIds(ids: string[]): Promise<ProductUI[]> {
  if (!ids?.length) return [];
  const q = supabase.from("products").select().in("id", ids);
  return await selectProducts(q);
}
