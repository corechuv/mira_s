import { supabase } from "./supabase";
import { imageUrl } from "./images";
import type { ProductUI } from "./types";

type ImgRow = { path?: string | null; url?: string | null; sort?: number | null };

function mapRow(p: any): ProductUI {
  const imgs: string[] = ((p.product_images as ImgRow[]) || [])
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

/** Список товаров (опции: ids, limit) */
export async function listProducts(opts?: { ids?: string[]; limit?: number }): Promise<ProductUI[]> {
  const sel = `
    id, slug, title, price, old_price, rating, rating_count,
    category_l1, category_l2, category_l3, short,
    product_images:path,url,sort
  `;
  let q = supabase.from("products").select(sel).order("created_at", { ascending: false });
  if (opts?.ids?.length) q = q.in("id", opts.ids);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(mapRow);
}

/** По slug один товар */
export async function getProductBySlug(slug: string): Promise<ProductUI | null> {
  const sel = `
    id, slug, title, price, old_price, rating, rating_count,
    category_l1, category_l2, category_l3, short,
    product_images:path,url,sort
  `;
  const { data, error } = await supabase.from("products").select(sel).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : null;
}

/** По массиву id (для сравнения/избранного) */
export async function listProductsByIds(ids: string[]): Promise<ProductUI[]> {
  if (!ids?.length) return [];
  return await listProducts({ ids });
}
