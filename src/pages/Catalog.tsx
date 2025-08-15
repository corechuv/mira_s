import React from "react";
import { useRouter, Link } from "../router";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import { imageUrl } from "../api/images";
import { supabase } from "../api/supabase";
import type { Category } from "../api/categories";
import { getCategoryByPath, listChildrenByPath, listRootCategories } from "../api/categories";

type ProductUI = {
  id:string; slug:string; title:string; price:number; old_price:number|null;
  images:string[]; rating:number; rating_count:number;
};

function parseSegments(pathname:string): string[] {
  const rest = pathname.replace(/^\/catalog\/?/,'');
  if (!rest) return [];
  return rest.split("/").map(decodeURIComponent).filter(Boolean);
}

export default function CatalogPage(){
  const { pathname } = useRouter();
  const segments = React.useMemo(()=> parseSegments(pathname),[pathname]);

  const [current, setCurrent] = React.useState<Category|null>(null);
  const [children, setChildren] = React.useState<Category[]>([]);
  const [products, setProducts] = React.useState<ProductUI[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(()=>{
    let alive = true;
    (async ()=>{
      setLoading(true);

      // 1) категории: текущая и дети
      const [cat, kids] = await Promise.all([
        getCategoryByPath(segments),
        listChildrenByPath(segments),
      ]);
      if(!alive) return;
      setCurrent(cat);
      setChildren(kids);

      // 2) товары: если категория выбрана — по category_id, иначе последние 24
      if (cat){
        let q = supabase.from("products")
          .select(`
            id, slug, title, price, old_price, rating, rating_count,
            product_images:path,url,sort
          `)
          .eq("category_id", cat.id)
          .order("created_at", { ascending: false })
          .limit(24);
        let { data, error } = await q;
        if (error && (error.code === '42703' || /column .*path/i.test(String(error.message)))){
          const r2 = await supabase.from("products")
            .select(`id, slug, title, price, old_price, rating, rating_count, product_images:url,sort`)
            .eq("category_id", cat.id)
            .order("created_at", { ascending: false })
            .limit(24);
          data = r2.data; error = r2.error;
        }
        if (error) throw error;
        const mapped:ProductUI[] = (data||[]).map((p:any)=>({
          id:p.id, slug:p.slug, title:p.title, price:p.price, old_price:p.old_price,
          rating:p.rating??0, rating_count:p.rating_count??0,
          images: ((p.product_images||[]) as any[])
            .sort((a:any,b:any)=> (a.sort??0)-(b.sort??0))
            .map((i:any)=> imageUrl(i.path || i.url))
        }));
        if(!alive) return;
        setProducts(mapped);
      } else {
        // корень: просто фичи
        let { data, error } = await supabase.from("products")
          .select(`id, slug, title, price, old_price, rating, rating_count, product_images:path,url,sort`)
          .order("created_at", { ascending: false })
          .limit(24);
        if (error && (error.code === '42703' || /column .*path/i.test(String(error.message)))){
          const r2 = await supabase.from("products")
            .select(`id, slug, title, price, old_price, rating, rating_count, product_images:url,sort`)
            .order("created_at", { ascending: false })
            .limit(24);
          data = r2.data; error = r2.error;
        }
        if (error) throw error;
        const mapped:ProductUI[] = (data||[]).map((p:any)=>({
          id:p.id, slug:p.slug, title:p.title, price:p.price, old_price:p.old_price,
          rating:p.rating??0, rating_count:p.rating_count??0,
          images: ((p.product_images||[]) as any[])
            .sort((a:any,b:any)=> (a.sort??0)-(b.sort??0))
            .map((i:any)=> imageUrl(i.path || i.url))
        }));
        if(!alive) return;
        setProducts(mapped);
      }

      setLoading(false);
    })().catch(err=>{
      console.error(err);
      setLoading(false);
    });
    return ()=>{ alive=false; };
  },[pathname]);

  // хлебные крошки
  const crumbs = [
    { label:"Каталог", to:"/catalog" },
    ...segments.map((seg, i) => ({
      label: seg,
      to: "/catalog/" + segments.slice(0,i+1).map(encodeURIComponent).join("/")
    }))
  ];

  return (
    <div className="container" style={{display:"grid", gap:16}}>
      <div className="breadcrumbs" style={{display:"flex", gap:8, flexWrap:"wrap"}}>
        {crumbs.map((c,i)=>(
          <span key={i}>
            {i>0 && " / "}
            <Link to={c.to} className="link">{c.label}</Link>
          </span>
        ))}
      </div>

      {/* список дочерних категорий */}
      <div className="card" style={{padding:16}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
          <h2 style={{margin:0}}>{current ? current.name : "Категории"}</h2>
          {current && <Link to="/catalog" className="btn">Все категории</Link>}
        </div>
        <div style={{display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))"}}>
          {children.map(c=>(
            <Link key={c.id} to={`/catalog/${c.full_path}`} className="card" style={{padding:12}}>
              <b>{c.name}</b>
              <div className="muted">/{c.full_path}</div>
            </Link>
          ))}
          {!children.length && <div className="muted">Нет подкатегорий.</div>}
        </div>
      </div>

      {/* товары */}
      <div className="card" style={{padding:16, display:"grid", gap:12}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <h2 style={{margin:0}}>{current ? `Товары: ${current.name}` : "Новые товары"}</h2>
        </div>
        {loading ? (
          <div className="muted">Loading…</div>
        ) : (
          <div className="grid" style={{display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))"}}>
            {products.map(p=>(
              <Reveal key={p.id}><ProductCard product={p as any}/></Reveal>
            ))}
          </div>
        )}
        {!loading && !products.length && <div className="muted">Товаров нет.</div>}
      </div>
    </div>
  );
}
