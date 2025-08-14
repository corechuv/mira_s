import { supabase } from "./supabase";

export type CategoryNode = { slug: string; title: string; children?: CategoryNode[] };

export async function listCategoriesTree(): Promise<CategoryNode[]>{
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, title, parent_id, level")
    .order("level", { ascending: true });
  if(error) throw error;
  const rows = (data as any[]) || [];
  const nodes = new Map<string, any>();
  const roots: any[] = [];
  rows.forEach(r => nodes.set(r.id, { slug: r.slug, title: r.title, children: [] }));
  rows.forEach(r => {
    const node = nodes.get(r.id);
    if(r.parent_id){
      const parent = nodes.get(r.parent_id);
      if(parent) parent.children.push(node);
    } else {
      roots.push(node);
    }
  });
  // очистить пустые children
  const prune = (n:any)=>{ if(!n.children?.length) delete n.children; else n.children.forEach(prune); };
  roots.forEach(prune);
  return roots;
}
