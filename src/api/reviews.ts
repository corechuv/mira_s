import { supabase } from "./supabase";

export type Review = {
  id: string; product_id: string; user_id: string;
  rating: number; body: string | null;
  is_public: boolean; created_at: string; updated_at: string;
  full_name?: string | null; avatar_url?: string | null;
};

export async function listReviews(productId: string, from = 0, size = 20): Promise<Review[]>{
  const { data, error } = await supabase
    .from("reviews_view")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .range(from, from + size - 1);
  if(error) throw error;
  return (data as Review[]) ?? [];
}

export async function getMyReview(productId: string): Promise<Review | null>{
  const { data: { user } } = await supabase.auth.getUser();
  if(!user) return null;
  const { data, error } = await supabase
    .from("reviews_view")
    .select("*")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();
  if(error) throw error;
  return data as any;
}

export async function upsertMyReview(productId: string, rating: number, body: string){
  const { data: { user } } = await supabase.auth.getUser();
  if(!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("reviews")
    .upsert({ product_id: productId, user_id: user.id, rating, body }, { onConflict: "product_id,user_id" });
  if(error) throw error;
}

export async function deleteMyReview(reviewId: string){
  const { data: { user } } = await supabase.auth.getUser();
  if(!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId);
  if(error) throw error;
}

export async function fetchProductStats(productId: string): Promise<{ rating:number; rating_count:number }>{
  const { data, error } = await supabase
    .from("products")
    .select("rating, rating_count")
    .eq("id", productId)
    .maybeSingle();
  if(error) throw error;
  return { rating: data?.rating ?? 0, rating_count: data?.rating_count ?? 0 };
}
