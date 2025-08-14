import React from "react";
import { useRouter, Link } from "../router";
import Breadcrumbs from "../components/Breadcrumbs";
import { price } from "../utils/money";
import { supabase } from "../api/supabase";
import Reviews from "../components/Reviews";
import { Icon } from "../icons/Icon";

// 👇 подцепляем стор, но используем безопасно (as any), чтобы не падать на типах/названиях методов
//    ожидаемые хуки: useCart / useWishlist / useCompare (как в твоих страницах Wishlist/Compare)
import * as Store from "../store/store";

type Prod = {
  id: string;
  slug: string;
  title: string;
  price: number;
  old_price: number | null;
  rating: number;
  rating_count: number;
  short: string | null;
  brand: string | null;
  category_l1: string; category_l2: string; category_l3: string;
};

export default function ProductPage(){
  const { params } = useRouter();
  const slug = params?.slug as string;

  // сторы (могут иметь другие сигнатуры — всё через any + optional chaining)
  const cart = (Store as any).useCart ? (Store as any).useCart() : {};
  const wishlist = (Store as any).useWishlist ? (Store as any).useWishlist() : {};
  const compare = (Store as any).useCompare ? (Store as any).useCompare() : {};

  const [prod, setProd] = React.useState<Prod | null>(null);
  const [imgs, setImgs] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(()=>{
    let isMounted = true;
    (async ()=>{
      setLoading(true);
      const { data: p, error: e1 } = await supabase
        .from("products")
        .select("id,slug,title,price,old_price,rating,rating_count,short,brand,category_l1,category_l2,category_l3")
        .eq("slug", slug)
        .maybeSingle();
      if (e1) console.error(e1);

      const { data: pi, error: e2 } = await supabase
        .from("product_images")
        .select("url, sort, product_id")
        .in("product_id", p?.id ? [p.id] : ["00000000-0000-0000-0000-000000000000"])
        .order("sort", { ascending: true });
      if (e2) console.error(e2);

      if (isMounted){
        setProd(p as any || null);
        setImgs((pi||[]).map(x=>x.url));
        setLoading(false);
      }
    })();
    return ()=>{ isMounted = false; };
  },[slug]);

  // ------ helpers для стора (проверка наличия по id) ------
  function hasId(bucket:any, id:string){
    if(!bucket) return false;
    // варианты структур: ids: string[] | items: string[] | items: {id}[]
    if (Array.isArray(bucket.ids)) return bucket.ids.includes(id);
    if (Array.isArray(bucket.items)) {
      const arr = bucket.items;
      if (arr.length && typeof arr[0] === "string") return arr.includes(id);
      if (arr.length && typeof arr[0] === "object") return arr.some((x:any)=>x?.id===id || x===id);
    }
    if (typeof bucket.has === "function") return !!bucket.has(id);
    return false;
  }

  function toggleWishlist(){
    if(!prod) return;
    if (typeof wishlist.toggle === "function") return wishlist.toggle(prod.id);
    if (hasId(wishlist, prod.id) && typeof wishlist.remove === "function") return wishlist.remove(prod.id);
    if (typeof wishlist.add === "function") return wishlist.add(prod.id);
    // fallback: localStorage (на всякий случай)
    try{
      const key="wishlist"; const cur = JSON.parse(localStorage.getItem(key)||"[]");
      const idx = cur.indexOf(prod.id); if(idx>=0) cur.splice(idx,1); else cur.push(prod.id);
      localStorage.setItem(key, JSON.stringify(cur));
      window.dispatchEvent(new Event("storage"));
    }catch{}
  }

  function toggleCompare(){
    if(!prod) return;
    if (typeof compare.toggle === "function") return compare.toggle(prod.id);
    if (hasId(compare, prod.id) && typeof compare.remove === "function") return compare.remove(prod.id);
    if (typeof compare.add === "function") return compare.add(prod.id);
    try{
      const key="compare"; const cur = JSON.parse(localStorage.getItem(key)||"[]");
      const idx = cur.indexOf(prod.id); if(idx>=0) cur.splice(idx,1); else cur.push(prod.id);
      localStorage.setItem(key, JSON.stringify(cur));
      window.dispatchEvent(new Event("storage"));
    }catch{}
  }

  function addToCart(){
    if(!prod) return;
    // частые сигнатуры: add(productId) или add({productId, qty, price})
    if (cart && typeof cart.add === "function"){
      try { cart.add(prod.id, 1); }
      catch { try { cart.add({ productId: prod.id, qty:1, price: prod.price }); } catch {}
      }
    }
  }

  const inWish = prod ? hasId(wishlist, prod.id) : false;
  const inCompare = prod ? hasId(compare, prod.id) : false;

  if(loading) return <div className="container"><div className="card" style={{padding:16}}>Загрузка…</div></div>;
  if(!prod) return <div className="container"><div className="card" style={{padding:16}}>Товар не найден.</div></div>;

  return (
    <div className="container" style={{display:"grid", gap:16}}>
      <Breadcrumbs
        items={[
          { label:"Каталог", to:"/catalog" },
          { label: prod.category_l1, to:`/catalog/${encodeURIComponent(prod.category_l1)}` },
          { label: prod.category_l2, to:`/catalog/${encodeURIComponent(prod.category_l1)}/${encodeURIComponent(prod.category_l2)}` },
          { label: prod.title }
        ]}
      />

      <div className="card" style={{padding:16, display:"grid", gap:16}}>
        <div style={{display:"grid", gap:16, gridTemplateColumns:"minmax(260px,420px) 1fr"}}>
          {/* Галерея */}
          <div style={{display:"grid", gap:8}}>
            <div className="card" style={{padding:8, display:"grid", placeItems:"center", minHeight:300}}>
              {imgs[0] ? <img src={imgs[0]} alt={prod.title} style={{maxWidth:"100%", borderRadius:16}}/> : <div className="muted">Нет изображения</div>}
            </div>
            {imgs.length>1 && (
              <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                {imgs.slice(1).map((u,i)=>(<img key={i} src={u} style={{width:72, height:72, objectFit:"cover", borderRadius:12}}/>))}
              </div>
            )}
          </div>

          {/* Инфо */}
          <div style={{display:"grid", gap:12}}>
            <h1 style={{margin:0}}>{prod.title}</h1>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <div className="badge">{prod.rating.toFixed(1)} ★</div>
              <small className="muted">({prod.rating_count} отзывов)</small>
            </div>
            <div style={{display:"flex", alignItems:"baseline", gap:10}}>
              <div className="price">{price(prod.price)}</div>
              {prod.old_price && <div className="price-old">{price(prod.old_price)}</div>}
            </div>
            {prod.short && <p style={{marginTop:8}}>{prod.short}</p>}

            {/* ACTION BAR */}
            <div style={{display:"flex", gap:8, flexWrap:"wrap", alignItems:"center"}}>
              <button className="btn primary" onClick={addToCart}>
                <Icon name="cart" /> <span style={{marginLeft:6}}>В корзину</span>
              </button>

              <button className={"btn"+(inWish?" active":"")} onClick={toggleWishlist} title={inWish?"Убрать из избранного":"В избранное"}>
                <Icon name="heart" />
                <span style={{marginLeft:6}}>{inWish?"В избранном":"В избранное"}</span>
              </button>

              <button className={"btn"+(inCompare?" active":"")} onClick={toggleCompare} title={inCompare?"Убрать из сравнения":"В сравнение"}>
                <Icon name="scale" />
                <span style={{marginLeft:6}}>{inCompare?"В сравнении":"В сравнение"}</span>
              </button>

              <Link to="/compare" className="btn" title="Открыть сравнение">
                <Icon name="arrow-right" /><span style={{marginLeft:6}}>Сравнить</span>
              </Link>
            </div>

            <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
              <Link to="/catalog" className="btn">Вернуться в каталог</Link>
            </div>
          </div>
        </div>
      </div>

      {/* 🔽 Блок отзывов */}
      <Reviews productId={prod.id} />
    </div>
  );
}
