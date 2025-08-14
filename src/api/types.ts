export type ProductRow = {
  id: string;
  slug: string;
  title: string;
  price: number;
  old_price: number | null;
  rating: number;
  short: string | null;
  category_l1: string;
  category_l2: string;
  category_l3: string;
  brand: string | null;
  shade: string | null;
  skin_type: string | null;
  volume: string | null;
};
export type ProductImageRow = { url: string; sort: number };

export type ProductUI = {
  id: string;
  slug: string;
  title: string;
  price: number;
  oldPrice?: number;
  rating: number;
  images: string[];
  categoryPath: string[];
  attrs: Record<string,string>;
  short: string;
};

export function mapRowToUI(row: ProductRow, images: ProductImageRow[]): ProductUI{
  const attrs: Record<string,string> = {};
  if(row.brand) attrs["бренд"] = row.brand;
  if(row.shade) attrs["оттенок"] = row.shade;
  if(row.skin_type) attrs["тип кожи"] = row.skin_type;
  if(row.volume) attrs["объем"] = row.volume;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    price: row.price,
    oldPrice: row.old_price ?? undefined,
    rating: row.rating,
    images: images?.sort((a,b)=>a.sort-b.sort).map(i=>i.url) ?? [],
    categoryPath: [row.category_l1,row.category_l2,row.category_l3],
    attrs,
    short: row.short ?? ""
  };
}
