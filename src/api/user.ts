import { supabase } from "./supabase";

export type Profile = { id: string; full_name?: string|null; avatar_url?: string|null; phone?: string|null; };
export type Address = { id: string; country?: string|null; city?: string|null; zip?: string|null; street?: string|null; house?: string|null };
export type Order = { id: string; total: number; status: string; created_at: string };

export async function getCurrentUserId(): Promise<string>{
  const { data:{ user }, error } = await supabase.auth.getUser();
  if(error) throw error;
  if(!user) throw new Error("Not authenticated");
  return user.id;
}

/* PROFILE */
export async function fetchProfile(): Promise<Profile|null>{
  const uid = await getCurrentUserId();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
  if(error) throw error;
  return data as any;
}
export async function saveProfile(p: Partial<Profile>): Promise<void>{
  const uid = await getCurrentUserId();
  const { error } = await supabase.from("profiles").upsert({ id: uid, ...p }, { onConflict: "id" });
  if(error) throw error;
}

/* ADDRESSES */
export async function listAddresses(): Promise<Address[]>{
  const uid = await getCurrentUserId();
  const { data, error } = await supabase.from("addresses").select("id,country,city,zip,street,house").eq("user_id", uid).order("created_at", { ascending:false });
  if(error) throw error;
  return (data as any[]) ?? [];
}
export async function createAddress(a: Partial<Address>): Promise<void>{
  const uid = await getCurrentUserId();
  const { error } = await supabase.from("addresses").insert({ user_id: uid, ...a });
  if(error) throw error;
}
export async function updateAddress(id:string, a: Partial<Address>): Promise<void>{
  const { error } = await supabase.from("addresses").update(a).eq("id", id);
  if(error) throw error;
}
export async function deleteAddress(id:string): Promise<void>{
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  if(error) throw error;
}

/* ORDERS */
export async function listOrders(): Promise<Order[]>{
  const uid = await getCurrentUserId();
  const { data, error } = await supabase.from("orders").select("id,total,status,created_at").eq("user_id", uid).order("created_at", { ascending:false });
  if(error) throw error;
  return (data as any[]) ?? [];
}
