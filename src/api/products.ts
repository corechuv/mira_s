import { supabase } from "./supabase";
import type { ProductRow, ProductImageRow, ProductUI } from "./types";
import { mapRowToUI } from "./types";

type ListParams = {
  lvl1?: string; lvl2?: string; lvl3?: string;
  min?: number; max?: number;
  sort?: "popular"|"price_asc"|"price_desc"|"rating_desc";
  filters?: Partial<{ brand: string[]; shade: string[]; skin_type: string[]; volume: string[] }>;
  q?: string;
  limit?: number; offset?: number;
};

export async function listProducts(params: ListParams = {}): Promise<ProductUI[]>{
  if (import.meta.env.DEV) console.debug("[listProducts] params", params);

  let q = supabase
    .from("products")
    .select("id, slug, title, price, old_price, rating, short, category_l1, category_l2, category_l3, brand, shade, skin_type, volume, product_images(url, sort)")
    .eq("is_active", true);

  if(params.lvl1) q = q.eq("category_l1", params.lvl1);
  if(params.lvl2) q = q.eq("category_l2", params.lvl2);
  if(params.lvl3) q = q.eq("category_l3", params.lvl3);

  if(params.min != null) q = q.gte("price", params.min);
  if(params.max != null) q = q.lte("price", params.max);

  if(params.filters?.brand?.length) q = q.in("brand", params.filters.brand);
  if(params.filters?.shade?.length) q = q.in("shade", params.filters.shade);
  if(params.filters?.skin_type?.length) q = q.in("skin_type", params.filters.skin_type);
  if(params.filters?.volume?.length) q = q.in("volume", params.filters.volume);

  if(params.q && params.q.trim()){
    q = q.textSearch("search", params.q, { type: "websearch" }).ilike("title", `%${params.q}%`);
  }

  if(params.sort === "price_asc") q = q.order("price", { ascending: true });
  else if(params.sort === "price_desc") q = q.order("price", { ascending: false });
  else if(params.sort === "rating_desc") q = q.order("rating", { ascending: false });
  else q = q.order("created_at", { ascending: false });

  if(params.limit) q = q.limit(params.limit);
  if(params.offset) q = q.range(params.offset, (params.offset + (params.limit ?? 20) - 1));

  q = q.order("sort", { foreignTable: "product_images", ascending: true });

  const { data, error } = await q;
  if(error) throw error;
  if (import.meta.env.DEV) console.debug("[listProducts] rows", (data as any[])?.length ?? 0);

  return (data as any[]).map(row =>
    mapRowToUI(row as ProductRow, (row as any).product_images as ProductImageRow[] || [])
  );
}

export async function getProductBySlug(slug: string): Promise<ProductUI | null>{
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, title, price, old_price, rating, short, category_l1, category_l2, category_l3, brand, shade, skin_type, volume, product_images(url, sort)")
    .eq("slug", slug)
    .eq("is_active", true)
    .order("sort", { foreignTable: "product_images", ascending: true })
    .maybeSingle();
  if(error) throw error;
  if(!data) return null;
  if (import.meta.env.DEV) console.debug("[getProductBySlug] ok", slug);
  return mapRowToUI(data as any, (data as any).product_images as ProductImageRow[] || []);
}

export async function listProductsByIds(ids: string[]): Promise<ProductUI[]>{
  if(!ids || !ids.length) return [];
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, title, price, old_price, rating, short, category_l1, category_l2, category_l3, brand, shade, skin_type, volume, product_images(url, sort)")
    .in("id", ids)
    .eq("is_active", true)
    .order("sort", { foreignTable: "product_images", ascending: true });
  if(error) throw error;

  const rows = (data as any[]) ?? [];
  const mapped = rows.map(row => mapRowToUI(row as ProductRow, (row as any).product_images as ProductImageRow[] || []));
  // вернуть в порядке исходного списка ids
  return mapped.sort((a,b)=> ids.indexOf(a.id) - ids.indexOf(b.id));
}
