import { supabase } from "./supabase";

/** Строка таблицы categories */
export type CategoryRow = {
  id: string;
  name: string;
  title: string | null;
  slug: string;
  parent_id: string | null;
  full_path: string;
  depth: number;
  level: number;
  sort: number;
  created_at: string;
};

/** Узел дерева категорий */
export type CategoryNode = CategoryRow & { children: CategoryNode[] };

/** Плоский список категорий */
export async function listCategoriesFlat(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,title,slug,parent_id,full_path,depth,level,sort,created_at")
    .order("sort", { ascending: true })
    .order("name", { ascending: true })
    .order("full_path", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CategoryRow[];
}

/** Построение дерева из плоского списка */
function buildTree(rows: CategoryRow[]): CategoryNode[] {
  const sorted = [...rows].sort((a, b) => {
    if (a.depth !== b.depth) return a.depth - b.depth;
    if (a.sort !== b.sort) return a.sort - b.sort;
    return a.name.localeCompare(b.name);
  });

  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  for (const r of sorted) {
    const node: CategoryNode = { ...r, children: [] };
    map.set(r.id, node);
    if (!r.parent_id) {
      roots.push(node);
    } else {
      const parent = map.get(r.parent_id);
      if (parent) parent.children.push(node);
      else roots.push(node); // защита, если вдруг нет родителя в выборке
    }
  }

  const sortChildren = (n: CategoryNode) => {
    n.children.sort((a, b) => (a.sort - b.sort) || a.name.localeCompare(b.name));
    n.children.forEach(sortChildren);
  };
  roots.forEach(sortChildren);

  return roots;
}

/** Дерево категорий */
export async function listCategoriesTree(): Promise<CategoryNode[]> {
  const flat = await listCategoriesFlat();
  return buildTree(flat);
}

/** Найти категорию по full_path */
export async function getCategoryByFullPath(full_path: string): Promise<CategoryRow | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,title,slug,parent_id,full_path,depth,level,sort,created_at")
    .eq("full_path", full_path)
    .maybeSingle();

  if (error) throw error;
  return (data as CategoryRow) ?? null;
}

/** АЛИАС для совместимости с существующим кодом */
export async function getCategoryByPath(path: string): Promise<CategoryRow | null> {
  return getCategoryByFullPath(path);
}

/** Дети категории по full_path; если path пустой — корни */
export async function listChildrenByPath(path?: string): Promise<CategoryRow[]> {
  // Корневые категории
  if (!path || path === "/" || path === "#") {
    const { data, error } = await supabase
      .from("categories")
      .select("id,name,title,slug,parent_id,full_path,depth,level,sort,created_at")
      .is("parent_id", null)
      .order("sort", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;
    return (data ?? []) as CategoryRow[];
  }

  // Находим родителя по full_path
  const { data: parent, error: e1 } = await supabase
    .from("categories")
    .select("id")
    .eq("full_path", path)
    .maybeSingle();

  if (e1) throw e1;
  if (!parent?.id) return [];

  // Достаём детей по parent_id
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,title,slug,parent_id,full_path,depth,level,sort,created_at")
    .eq("parent_id", parent.id)
    .order("sort", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CategoryRow[];
}

/** Хлебные крошки из full_path (локально по плоскому списку) */
export function buildBreadcrumbsFromPath(full_path: string, all?: CategoryRow[]) {
  if (!all) return [];
  const byPath = new Map(all.map(r => [r.full_path, r]));
  const parts = full_path.split("/").filter(Boolean);
  const crumbs: CategoryRow[] = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts.slice(0, i + 1).join("/");
    const row = byPath.get(p);
    if (row) crumbs.push(row);
  }
  return crumbs;
}

/** Upsert категории (для админки) */
export async function upsertCategory(input: Partial<CategoryRow> & {
  name?: string; title?: string; slug?: string; parent_id?: string | null; sort?: number;
}) {
  const payload = {
    id: input.id,
    name: input.name ?? null,
    title: input.title ?? input.name ?? null,
    slug: input.slug ?? null,
    parent_id: input.parent_id ?? null,
    sort: input.sort ?? 0,
  };

  const { data, error } = await supabase
    .from("categories")
    .upsert(payload, { onConflict: "id" })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as CategoryRow;
}

/** Удалить категорию */
export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

/** Корневые категории (алиас для совместимости с Catalog.tsx) */
export async function listRootCategories(): Promise<CategoryRow[]> {
  return listChildrenByPath(); // undefined => parent_id IS NULL
}
